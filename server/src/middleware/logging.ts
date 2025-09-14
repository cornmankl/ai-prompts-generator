import { Request, Response, NextFunction } from 'express'
import { Logger } from 'winston'

export const loggingMiddleware = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    
    // Log request
    logger.info('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - start
      
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        timestamp: new Date().toISOString()
      })

      // Log errors
      if (res.statusCode >= 400) {
        logger.error('Request error', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        })
      }

      originalEnd.call(this, chunk, encoding)
    }

    next()
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  console.log(`${req.method} ${req.url} - ${req.ip}`)
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`)
  })
  
  next()
}

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  })
  
  next(error)
}