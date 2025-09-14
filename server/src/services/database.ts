import mongoose from 'mongoose'
import { Logger } from 'winston'

export class DatabaseService {
  private logger: Logger
  private isConnected: boolean = false

  constructor(logger?: Logger) {
    this.logger = logger || console as any
  }

  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-prompts-generator'
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0
      })

      this.isConnected = true
      this.logger.info('Connected to MongoDB successfully')

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        this.logger.error('MongoDB connection error:', error)
        this.isConnected = false
      })

      mongoose.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected')
        this.isConnected = false
      })

      mongoose.connection.on('reconnected', () => {
        this.logger.info('MongoDB reconnected')
        this.isConnected = true
      })

    } catch (error) {
      this.logger.error('Failed to connect to MongoDB:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect()
      this.isConnected = false
      this.logger.info('Disconnected from MongoDB')
    } catch (error) {
      this.logger.error('Error disconnecting from MongoDB:', error)
      throw error
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    details: {
      connected: boolean
      readyState: number
      host: string
      port: number
      name: string
    }
  }> {
    const readyState = mongoose.connection.readyState
    const isHealthy = readyState === 1

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: {
        connected: isHealthy,
        readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    }
  }

  async createIndexes(): Promise<void> {
    try {
      // Create indexes for better performance
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true })
      await mongoose.connection.db.collection('users').createIndex({ 'subscription.plan': 1 })
      await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 })
      
      await mongoose.connection.db.collection('prompts').createIndex({ title: 'text', content: 'text', description: 'text' })
      await mongoose.connection.db.collection('prompts').createIndex({ category: 1 })
      await mongoose.connection.db.collection('prompts').createIndex({ tags: 1 })
      await mongoose.connection.db.collection('prompts').createIndex({ author: 1 })
      await mongoose.connection.db.collection('prompts').createIndex({ isPublic: 1 })
      await mongoose.connection.db.collection('prompts').createIndex({ 'performance.usageCount': -1 })
      await mongoose.connection.db.collection('prompts').createIndex({ createdAt: -1 })

      this.logger.info('Database indexes created successfully')
    } catch (error) {
      this.logger.error('Error creating database indexes:', error)
      throw error
    }
  }

  async getStats(): Promise<{
    collections: number
    documents: number
    indexes: number
    dataSize: number
    storageSize: number
  }> {
    try {
      const stats = await mongoose.connection.db.stats()
      const collections = await mongoose.connection.db.listCollections().toArray()

      return {
        collections: collections.length,
        documents: stats.objects,
        indexes: stats.indexes,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize
      }
    } catch (error) {
      this.logger.error('Error getting database stats:', error)
      throw error
    }
  }
}