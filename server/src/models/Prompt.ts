import mongoose, { Document, Schema } from 'mongoose'

export interface IPrompt extends Document {
  _id: string
  title: string
  content: string
  description?: string
  category: string
  tags: string[]
  author: mongoose.Types.ObjectId
  isPublic: boolean
  isTemplate: boolean
  templateData?: {
    variables: Array<{
      name: string
      type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
      required: boolean
      defaultValue?: any
      options?: string[]
      description?: string
    }>
    examples: Array<{
      input: Record<string, any>
      output: string
      description?: string
    }>
  }
  ai: {
    model: string
    temperature: number
    maxTokens: number
    enableChainOfThought: boolean
    enableFewShot: boolean
    systemPrompt?: string
  }
  performance: {
    usageCount: number
    averageRating: number
    totalRatings: number
    successRate: number
    averageResponseTime: number
    lastUsed?: Date
  }
  collaboration: {
    isShared: boolean
    sharedWith: Array<{
      user: mongoose.Types.ObjectId
      permission: 'view' | 'edit' | 'admin'
      addedAt: Date
    }>
    version: number
    parentVersion?: mongoose.Types.ObjectId
    isFork: boolean
    originalAuthor?: mongoose.Types.ObjectId
  }
  analytics: {
    views: number
    likes: number
    dislikes: number
    shares: number
    downloads: number
    comments: number
    lastViewed?: Date
  }
  metadata: {
    language: string
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    estimatedTime: number // in minutes
    complexity: number // 1-10 scale
    industry?: string
    useCase?: string
  }
  status: 'draft' | 'published' | 'archived' | 'flagged'
  createdAt: Date
  updatedAt: Date
  
  // Methods
  incrementUsage(): Promise<void>
  addRating(rating: number): Promise<void>
  addView(): Promise<void>
  addLike(): Promise<void>
  addDislike(): Promise<void>
  addShare(): Promise<void>
  addDownload(): Promise<void>
  addComment(): Promise<void>
  updatePerformance(responseTime: number, success: boolean): Promise<void>
  shareWithUser(userId: string, permission: 'view' | 'edit' | 'admin'): Promise<void>
  removeShareWithUser(userId: string): Promise<void>
  fork(newAuthor: string): Promise<IPrompt>
  updateVersion(): Promise<void>
}

const PromptSchema = new Schema<IPrompt>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000
  },
  description: {
    type: String,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'general', 'coding', 'writing', 'analysis', 'creative', 'business',
      'education', 'research', 'marketing', 'sales', 'customer-service',
      'technical', 'design', 'strategy', 'planning', 'review', 'optimization'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateData: {
    variables: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'number', 'boolean', 'select', 'multiselect'],
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      defaultValue: {
        type: Schema.Types.Mixed
      },
      options: [{
        type: String
      }],
      description: {
        type: String
      }
    }],
    examples: [{
      input: {
        type: Schema.Types.Mixed,
        required: true
      },
      output: {
        type: String,
        required: true
      },
      description: {
        type: String
      }
    }]
  },
  ai: {
    model: {
      type: String,
      default: 'glm-4-5'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 2000,
      min: 1,
      max: 8192
    },
    enableChainOfThought: {
      type: Boolean,
      default: false
    },
    enableFewShot: {
      type: Boolean,
      default: false
    },
    systemPrompt: {
      type: String,
      maxlength: 5000
    }
  },
  performance: {
    usageCount: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    }
  },
  collaboration: {
    isShared: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      permission: {
        type: String,
        enum: ['view', 'edit', 'admin'],
        default: 'view'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    version: {
      type: Number,
      default: 1
    },
    parentVersion: {
      type: Schema.Types.ObjectId,
      ref: 'Prompt'
    },
    isFork: {
      type: Boolean,
      default: false
    },
    originalAuthor: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date
    }
  },
  metadata: {
    language: {
      type: String,
      default: 'en'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    estimatedTime: {
      type: Number,
      default: 5,
      min: 1,
      max: 120
    },
    complexity: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    industry: {
      type: String
    },
    useCase: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'flagged'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
PromptSchema.index({ title: 'text', content: 'text', description: 'text' })
PromptSchema.index({ category: 1 })
PromptSchema.index({ tags: 1 })
PromptSchema.index({ author: 1 })
PromptSchema.index({ isPublic: 1 })
PromptSchema.index({ isTemplate: 1 })
PromptSchema.index({ status: 1 })
PromptSchema.index({ 'performance.usageCount': -1 })
PromptSchema.index({ 'performance.averageRating': -1 })
PromptSchema.index({ 'analytics.views': -1 })
PromptSchema.index({ createdAt: -1 })
PromptSchema.index({ updatedAt: -1 })

// Virtual fields
PromptSchema.virtual('isPopular').get(function() {
  return this.analytics.views > 100 || this.performance.usageCount > 50
})

PromptSchema.virtual('isTrending').get(function() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return this.analytics.views > 20 && this.updatedAt > oneWeekAgo
})

PromptSchema.virtual('ratingPercentage').get(function() {
  return (this.performance.averageRating / 5) * 100
})

PromptSchema.virtual('shareCount').get(function() {
  return this.collaboration.sharedWith.length
})

// Instance methods
PromptSchema.methods.incrementUsage = async function(): Promise<void> {
  this.performance.usageCount += 1
  this.performance.lastUsed = new Date()
  await this.save()
}

PromptSchema.methods.addRating = async function(rating: number): Promise<void> {
  const totalRating = this.performance.averageRating * this.performance.totalRatings
  this.performance.totalRatings += 1
  this.performance.averageRating = (totalRating + rating) / this.performance.totalRatings
  await this.save()
}

PromptSchema.methods.addView = async function(): Promise<void> {
  this.analytics.views += 1
  this.analytics.lastViewed = new Date()
  await this.save()
}

PromptSchema.methods.addLike = async function(): Promise<void> {
  this.analytics.likes += 1
  await this.save()
}

PromptSchema.methods.addDislike = async function(): Promise<void> {
  this.analytics.dislikes += 1
  await this.save()
}

PromptSchema.methods.addShare = async function(): Promise<void> {
  this.analytics.shares += 1
  await this.save()
}

PromptSchema.methods.addDownload = async function(): Promise<void> {
  this.analytics.downloads += 1
  await this.save()
}

PromptSchema.methods.addComment = async function(): Promise<void> {
  this.analytics.comments += 1
  await this.save()
}

PromptSchema.methods.updatePerformance = async function(
  responseTime: number, 
  success: boolean
): Promise<void> {
  const totalTime = this.performance.averageResponseTime * this.performance.usageCount
  this.performance.usageCount += 1
  this.performance.averageResponseTime = (totalTime + responseTime) / this.performance.usageCount
  
  if (success) {
    const currentSuccessRate = this.performance.successRate * (this.performance.usageCount - 1)
    this.performance.successRate = (currentSuccessRate + 100) / this.performance.usageCount
  } else {
    const currentSuccessRate = this.performance.successRate * (this.performance.usageCount - 1)
    this.performance.successRate = currentSuccessRate / this.performance.usageCount
  }
  
  await this.save()
}

PromptSchema.methods.shareWithUser = async function(
  userId: string, 
  permission: 'view' | 'edit' | 'admin'
): Promise<void> {
  const existingShare = this.collaboration.sharedWith.find(
    (share: any) => share.user.toString() === userId
  )
  
  if (existingShare) {
    existingShare.permission = permission
  } else {
    this.collaboration.sharedWith.push({
      user: userId,
      permission,
      addedAt: new Date()
    })
  }
  
  this.collaboration.isShared = true
  await this.save()
}

PromptSchema.methods.removeShareWithUser = async function(userId: string): Promise<void> {
  this.collaboration.sharedWith = this.collaboration.sharedWith.filter(
    (share: any) => share.user.toString() !== userId
  )
  
  if (this.collaboration.sharedWith.length === 0) {
    this.collaboration.isShared = false
  }
  
  await this.save()
}

PromptSchema.methods.fork = async function(newAuthor: string): Promise<IPrompt> {
  const forkedPrompt = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    author: newAuthor,
    collaboration: {
      isShared: false,
      sharedWith: [],
      version: 1,
      parentVersion: this._id,
      isFork: true,
      originalAuthor: this.author
    },
    analytics: {
      views: 0,
      likes: 0,
      dislikes: 0,
      shares: 0,
      downloads: 0,
      comments: 0
    },
    performance: {
      usageCount: 0,
      averageRating: 0,
      totalRatings: 0,
      successRate: 0,
      averageResponseTime: 0
    }
  })
  
  return await forkedPrompt.save()
}

PromptSchema.methods.updateVersion = async function(): Promise<void> {
  this.collaboration.version += 1
  await this.save()
}

// Static methods
PromptSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isPublic: true, status: 'published' })
}

PromptSchema.statics.findByAuthor = function(authorId: string) {
  return this.find({ author: authorId })
}

PromptSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, status: 'published' })
}

PromptSchema.statics.findTemplates = function() {
  return this.find({ isTemplate: true, isPublic: true, status: 'published' })
}

PromptSchema.statics.findPopular = function(limit: number = 10) {
  return this.find({ isPublic: true, status: 'published' })
    .sort({ 'performance.usageCount': -1 })
    .limit(limit)
}

PromptSchema.statics.findTrending = function(limit: number = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return this.find({ 
    isPublic: true, 
    status: 'published',
    updatedAt: { $gte: oneWeekAgo }
  })
    .sort({ 'analytics.views': -1 })
    .limit(limit)
}

PromptSchema.statics.search = function(query: string) {
  return this.find({
    $text: { $search: query },
    isPublic: true,
    status: 'published'
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  })
}

export default mongoose.model<IPrompt>('Prompt', PromptSchema)
