import Redis from 'ioredis'
import { Logger } from 'winston'

export class RedisService {
  private client: Redis
  private logger: Logger
  private isConnected: boolean = false

  constructor(logger?: Logger) {
    this.logger = logger || console as any
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.logger.info('Redis connected')
      this.isConnected = true
    })

    this.client.on('ready', () => {
      this.logger.info('Redis ready')
      this.isConnected = true
    })

    this.client.on('error', (error) => {
      this.logger.error('Redis error:', error)
      this.isConnected = false
    })

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed')
      this.isConnected = false
    })

    this.client.on('reconnecting', () => {
      this.logger.info('Redis reconnecting...')
    })
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect()
      this.logger.info('Connected to Redis successfully')
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect()
      this.isConnected = false
      this.logger.info('Disconnected from Redis')
    } catch (error) {
      this.logger.error('Error disconnecting from Redis:', error)
      throw error
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.client.status === 'ready'
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    details: {
      connected: boolean
      status: string
      memory: any
      info: any
    }
  }> {
    try {
      const info = await this.client.info('memory')
      const status = this.client.status

      return {
        status: status === 'ready' ? 'healthy' : 'unhealthy',
        details: {
          connected: status === 'ready',
          status,
          memory: this.parseRedisInfo(info),
          info: { status }
        }
      }
    } catch (error) {
      this.logger.error('Redis health check failed:', error)
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          status: 'error',
          memory: null,
          info: { error: error.message }
        }
      }
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n')
    const result: any = {}
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        result[key] = value
      }
    })
    
    return result
  }

  // Cache operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value)
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue)
      } else {
        await this.client.set(key, serializedValue)
      }
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error)
      throw error
    }
  }

  async get(key: string): Promise<any> {
    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error)
      return null
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error)
      throw error
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      this.logger.error(`Error checking cache key ${key}:`, error)
      return false
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl)
    } catch (error) {
      this.logger.error(`Error setting expiry for cache key ${key}:`, error)
      throw error
    }
  }

  // Session operations
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl)
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`)
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`)
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    try {
      const current = await this.client.incr(key)
      
      if (current === 1) {
        await this.client.expire(key, window)
      }
      
      const ttl = await this.client.ttl(key)
      const remaining = Math.max(0, limit - current)
      
      return {
        allowed: current <= limit,
        remaining,
        resetTime: Date.now() + (ttl * 1000)
      }
    } catch (error) {
      this.logger.error(`Error checking rate limit for key ${key}:`, error)
      return {
        allowed: true,
        remaining: limit,
        resetTime: Date.now() + (window * 1000)
      }
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<void> {
    try {
      await this.client.publish(channel, JSON.stringify(message))
    } catch (error) {
      this.logger.error(`Error publishing to channel ${channel}:`, error)
      throw error
    }
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      const subscriber = this.client.duplicate()
      await subscriber.subscribe(channel)
      
      subscriber.on('message', (channel, message) => {
        try {
          const parsedMessage = JSON.parse(message)
          callback(parsedMessage)
        } catch (error) {
          this.logger.error('Error parsing message:', error)
        }
      })
    } catch (error) {
      this.logger.error(`Error subscribing to channel ${channel}:`, error)
      throw error
    }
  }

  // Queue operations
  async pushToQueue(queueName: string, data: any): Promise<void> {
    try {
      await this.client.lpush(queueName, JSON.stringify(data))
    } catch (error) {
      this.logger.error(`Error pushing to queue ${queueName}:`, error)
      throw error
    }
  }

  async popFromQueue(queueName: string): Promise<any> {
    try {
      const result = await this.client.rpop(queueName)
      return result ? JSON.parse(result) : null
    } catch (error) {
      this.logger.error(`Error popping from queue ${queueName}:`, error)
      return null
    }
  }

  async getQueueLength(queueName: string): Promise<number> {
    try {
      return await this.client.llen(queueName)
    } catch (error) {
      this.logger.error(`Error getting queue length for ${queueName}:`, error)
      return 0
    }
  }
}