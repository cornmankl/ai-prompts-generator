import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import ExpressBrute from 'express-brute';
import ExpressBruteRedis from 'express-brute-redis';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import { logger } from '../services/loggerService';
import { cacheService } from '../services/cacheService';

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.round(windowMs / 1000)
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for certain conditions
      return req.ip === '127.0.0.1' || req.ip === '::1';
    }
  });
};

// General rate limiting
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for auth endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// AI API rate limiting
export const aiRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 AI requests per minute
  'Too many AI requests, please slow down.'
);

// Speed limiting (gradual slowdown)
export const speedLimit = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // max delay of 20 seconds
});

// Brute force protection
const store = new ExpressBruteRedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

export const bruteForce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 15 * 60 * 1000, // 15 minutes
  lifetime: 24 * 60 * 60, // 24 hours
  refreshTimeoutOnRequest: false,
  skipSuccessfulRequests: true,
  handleStoreError: (error: Error) => {
    logger.error('Brute force store error:', error);
  }
});

// Security headers middleware
export const securityHeaders = helmet({
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
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize MongoDB queries
  mongoSanitize();

  // Sanitize XSS
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Recursive object sanitization
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return xss(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (allowedIPs.includes(clientIP || '')) {
      next();
    } else {
      logger.warn(`Blocked request from IP: ${clientIP}`);
      res.status(403).json({ error: 'Access denied' });
    }
  };
};

// Request size limiter
export const requestSizeLimit = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes

    if (contentLength > maxBytes) {
      logger.warn(`Request too large: ${contentLength} bytes from IP: ${req.ip}`);
      res.status(413).json({ error: 'Request too large' });
      return;
    }

    next();
  };
};

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({ error: 'API key required' });
    return;
  }

  // Validate API key format
  const apiKeyRegex = /^[a-zA-Z0-9]{32,}$/;
  if (!apiKeyRegex.test(apiKey)) {
    res.status(401).json({ error: 'Invalid API key format' });
    return;
  }

  // Check API key in cache/database
  cacheService.get(`api_key:${apiKey}`).then((cached) => {
    if (cached) {
      req.user = JSON.parse(cached);
      next();
    } else {
      res.status(401).json({ error: 'Invalid API key' });
    }
  }).catch(() => {
    res.status(401).json({ error: 'API key validation failed' });
  });
};

// Audit logging middleware
export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With']
};

// Session security middleware
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Prevent session fixation
  if (req.session && !req.session.isNew) {
    req.session.regenerate((err) => {
      if (err) {
        logger.error('Session regeneration error:', err);
        return next(err);
      }
      next();
    });
  } else {
    next();
  }
};

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');

    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      res.status(415).json({
        error: 'Unsupported media type',
        allowedTypes
      });
      return;
    }

    next();
  };
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(timeoutMs, () => {
      logger.warn(`Request timeout for IP: ${req.ip}`);
      res.status(408).json({ error: 'Request timeout' });
    });

    next();
  };
};