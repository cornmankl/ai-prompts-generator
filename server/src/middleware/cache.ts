import { Request, Response, NextFunction } from 'express'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

interface CacheOptions {
  ttl?: number // Time to live in seconds
  keyGenerator?: (req: Request) => string
  skipCache?: (req: Request) => boolean
}

export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req: Request) => `cache:${req.method}:${req.originalUrl}`,
    skipCache = () => false
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests or if skipCache returns true
    if (req.method !== 'GET' || skipCache(req)) {
      return next()
    }

    try {
      const key = keyGenerator(req)
      const cached = await redis.get(key)

      if (cached) {
        const data = JSON.parse(cached)
        return res.json(data)
      }

      // Store original res.json
      const originalJson = res.json.bind(res)

      // Override res.json to cache the response
      res.json = function(body: any) {
        // Cache the response
        redis.setex(key, ttl, JSON.stringify(body))
        return originalJson(body)
      }

      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

// Cache invalidation helper
export const invalidateCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

// User-specific cache
export const userCache = (ttl: number = 300) => {
  return cache({
    ttl,
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id || 'anonymous'
      return `user:${userId}:${req.method}:${req.originalUrl}`
    },
    skipCache: (req: Request) => {
      // Skip cache for admin routes or when user is not authenticated
      return req.path.includes('/admin') || !(req as any).user
    }
  })
}

// API response cache
export const apiCache = (ttl: number = 600) => {
  return cache({
    ttl,
    keyGenerator: (req: Request) => {
      const queryString = req.query ? `?${new URLSearchParams(req.query as any).toString()}` : ''
      return `api:${req.path}${queryString}`
    },
    skipCache: (req: Request) => {
      // Skip cache for authenticated routes or when there are query parameters that affect the response
      return req.path.includes('/auth') || Object.keys(req.query).length > 0
    }
  })
}