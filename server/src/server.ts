import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import mongoose from 'mongoose'
import Redis from 'ioredis'
import dotenv from 'dotenv'
import winston from 'winston'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import promptRoutes from './routes/prompts'
import aiRoutes from './routes/ai'
import pluginRoutes from './routes/plugins'
import analyticsRoutes from './routes/analytics'
import collaborationRoutes from './routes/collaboration'
import subscriptionRoutes from './routes/subscription'
import webhookRoutes from './routes/webhooks'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { rateLimitMiddleware } from './middleware/rateLimit'
import { loggingMiddleware } from './middleware/logging'
import { securityMiddleware } from './middleware/security'

// Import services
import { DatabaseService } from './services/database'
import { RedisService } from './services/redis'
import { SocketService } from './services/socket'
import { AIService } from './services/ai'
import { PluginService } from './services/plugin'
import { AnalyticsService } from './services/analytics'
import { NotificationService } from './services/notification'
import { SubscriptionService } from './services/subscription'

// Import models
import './models/User'
import './models/Prompt'
import './models/Workflow'
import './models/Plugin'
import './models/Analytics'
import './models/Subscription'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

// Initialize services
const databaseService = new DatabaseService()
const redisService = new RedisService()
const socketService = new SocketService(io)
const aiService = new AIService()
const pluginService = new PluginService()
const analyticsService = new AnalyticsService()
const notificationService = new NotificationService()
const subscriptionService = new SubscriptionService()

// Configure logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
})

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI Prompts Generator API',
            version: '1.0.0',
            description: 'Advanced AI Prompts Generator with Orchestration Framework',
            contact: {
                name: 'API Support',
                email: 'support@aipromptsgenerator.com'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}))

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}))

app.use(compression())
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)

// API rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many API requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
})

// Custom middleware
app.use(loggingMiddleware(logger))
app.use(securityMiddleware)

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    })
})

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/prompts', authMiddleware, promptRoutes)
app.use('/api/ai', authMiddleware, apiLimiter, aiRoutes)
app.use('/api/plugins', authMiddleware, pluginRoutes)
app.use('/api/analytics', authMiddleware, analyticsRoutes)
app.use('/api/collaboration', authMiddleware, collaborationRoutes)
app.use('/api/subscription', authMiddleware, subscriptionRoutes)
app.use('/api/webhooks', webhookRoutes)

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`)

    socket.on('join-room', (roomId) => {
        socket.join(roomId)
        logger.info(`User ${socket.id} joined room ${roomId}`)
    })

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId)
        logger.info(`User ${socket.id} left room ${roomId}`)
    })

    socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`)
    })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString()
    })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully')

    server.close(() => {
        logger.info('HTTP server closed')
    })

    await databaseService.disconnect()
    await redisService.disconnect()

    process.exit(0)
})

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully')

    server.close(() => {
        logger.info('HTTP server closed')
    })

    await databaseService.disconnect()
    await redisService.disconnect()

    process.exit(0)
})

// Start server
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '0.0.0.0'

const startServer = async () => {
    try {
        // Connect to database
        await databaseService.connect()
        logger.info('Connected to MongoDB')

        // Connect to Redis
        await redisService.connect()
        logger.info('Connected to Redis')

        // Initialize services
        await aiService.initialize()
        await pluginService.initialize()
        await analyticsService.initialize()
        await notificationService.initialize()
        await subscriptionService.initialize()

        // Start server
        server.listen(PORT, HOST, () => {
            logger.info(`Server running on http://${HOST}:${PORT}`)
            logger.info(`API Documentation available at http://${HOST}:${PORT}/api-docs`)
        })
    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
})

// Start the server
startServer()

export default app
