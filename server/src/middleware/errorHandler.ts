import { Request, Response, NextFunction } from 'express'
import winston from 'winston'

// Custom error class
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal Server Error'
  let isOperational = false

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    isOperational = error.isOperational
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409
    message = 'Duplicate field value'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  } else if (error.name === 'MulterError') {
    statusCode = 400
    message = 'File upload error'
  }

  // Log error
  const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/error.log' })
    ]
  })

  logger.error({
    message: error.message,
    stack: error.stack,
    statusCode,
    isOperational,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: isOperational ? message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error.message
    })
  })
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}

// Validation error handler
export const validationErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }))

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }
  next(error)
}

// Rate limit error handler
export const rateLimitErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter: req.get('Retry-After')
  })
}