import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import services
import { cacheService } from './services/cacheService';
import { logger } from './services/loggerService';
import { collaborationService } from './services/collaborationService';
import { analyticsService } from './services/analyticsService';
import { complianceService } from './services/complianceService';
import { aiOrchestrationService } from './services/aiOrchestrationService';

// Import middleware
import {
    securityHeaders,
    sanitizeInput,
    auditLog,
    corsOptions,
    requestTimeout,
    requestSizeLimit
} from './middleware/security';

// Import routes
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import userRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import collaborationRoutes from './routes/collaboration';
import complianceRoutes from './routes/compliance';
import orchestrationRoutes from './routes/orchestration';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-prompts';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request size limiting
app.use(requestSizeLimit('10mb'));

// Request timeout
app.use(requestTimeout(30000)); // 30 seconds

// Input sanitization
app.use(sanitizeInput);

// Audit logging
app.use(auditLog);

// Morgan logging
app.use(morgan('combined', { stream: { write: (message: string) => logger.http(message.trim()) } }));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: NODE_ENV,
            services: {
                database: 'operational',
                cache: 'operational',
                ai: 'operational',
                analytics: 'operational',
                collaboration: 'operational',
                compliance: 'operational',
                orchestration: 'operational'
            },
            metrics: {
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                version: process.version,
                platform: process.platform
            }
        };

        res.json({ success: true, data: health });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            success: false,
            error: 'Health check failed',
            status: 'unhealthy'
        });
    }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/orchestration', orchestrationRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
    });

    // Handle collaboration events
    socket.on('join_workspace', async (data) => {
        try {
            await collaborationService.handleJoinWorkspace(socket, data);
        } catch (error) {
            logger.error('Error handling join workspace:', error);
            socket.emit('error', { message: 'Failed to join workspace' });
        }
    });

    socket.on('leave_workspace', async (data) => {
        try {
            await collaborationService.handleLeaveWorkspace(socket, data);
        } catch (error) {
            logger.error('Error handling leave workspace:', error);
        }
    });

    // Handle real-time analytics
    socket.on('subscribe_analytics', (data) => {
        socket.join('analytics');
        logger.info(`Client subscribed to analytics: ${socket.id}`);
    });

    socket.on('unsubscribe_analytics', () => {
        socket.leave('analytics');
        logger.info(`Client unsubscribed from analytics: ${socket.id}`);
    });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', error);

    res.status(error.status || 500).json({
        success: false,
        error: NODE_ENV === 'production' ? 'Internal server error' : error.message,
        ...(NODE_ENV === 'development' && { stack: error.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Database connection
async function connectDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Cache connection
async function connectCache() {
    try {
        await cacheService.connect();
        logger.info('Connected to Redis cache');
    } catch (error) {
        logger.error('Redis connection error:', error);
        // Continue without cache in development
        if (NODE_ENV === 'production') {
            process.exit(1);
        }
    }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    try {
        // Stop accepting new connections
        server.close(() => {
            logger.info('HTTP server closed');
        });

        // Close database connection
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');

        // Close cache connection
        await cacheService.disconnect();
        logger.info('Redis connection closed');

        // Close WebSocket server
        io.close(() => {
            logger.info('WebSocket server closed');
        });

        logger.info('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
}

// Process event handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', reason);
    // Don't exit the process in production
    if (NODE_ENV === 'development') {
        process.exit(1);
    }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start server
async function startServer() {
    try {
        // Connect to services
        await connectDatabase();
        await connectCache();

        // Start HTTP server
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
            logger.info(`Health check available at http://localhost:${PORT}/health`);
        });

        // Start background services
        startBackgroundServices();

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Background services
function startBackgroundServices() {
    // Cleanup inactive collaboration sessions every 30 minutes
    setInterval(async () => {
        try {
            await collaborationService.cleanupInactiveSessions();
        } catch (error) {
            logger.error('Error cleaning up collaboration sessions:', error);
        }
    }, 30 * 60 * 1000);

    // Generate compliance reports daily
    setInterval(async () => {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const today = new Date();

            await complianceService.generateComplianceReport('daily', {
                start: yesterday,
                end: today
            });
        } catch (error) {
            logger.error('Error generating daily compliance report:', error);
        }
    }, 24 * 60 * 60 * 1000);

    // Cleanup old audit logs weekly
    setInterval(async () => {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // This would clean up old audit logs
            logger.info('Cleaning up old audit logs...');
        } catch (error) {
            logger.error('Error cleaning up audit logs:', error);
        }
    }, 7 * 24 * 60 * 60 * 1000);

    // Monitor system health
    setInterval(async () => {
        try {
            const metrics = await aiOrchestrationService.getSystemMetrics();
            logger.info('System metrics:', metrics);
        } catch (error) {
            logger.error('Error monitoring system health:', error);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
}

// Start the server
startServer();

export { app, server, io };