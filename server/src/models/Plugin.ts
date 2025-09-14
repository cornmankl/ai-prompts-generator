import mongoose, { Document, Schema } from 'mongoose'

export interface IPlugin extends Document {
  _id: string
  name: string
  description: string
  version: string
  author: mongoose.Types.ObjectId
  category: string
  tags: string[]
  isPublic: boolean
  isActive: boolean
  isInstalled: boolean
  installCount: number
  rating: number
  totalRatings: number
  configuration: {
    settings: Array<{
      key: string
      type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
      value: any
      required: boolean
      description?: string
      options?: string[]
    }>
    permissions: string[]
    apiEndpoints: Array<{
      method: string
      path: string
      description: string
      parameters?: Array<{
        name: string
        type: string
        required: boolean
        description?: string
      }>
    }>
  }
  files: {
    main: string
    dependencies: string[]
    assets: string[]
    documentation: string
  }
  metadata: {
    size: number
    lastUpdated: Date
    compatibility: {
      minVersion: string
      maxVersion?: string
    }
    dependencies: Array<{
      name: string
      version: string
      type: 'required' | 'optional'
    }>
  }
  status: 'draft' | 'published' | 'deprecated' | 'flagged'
  createdAt: Date
  updatedAt: Date

  // Methods
  install(): Promise<void>
  uninstall(): Promise<void>
  updateRating(rating: number): Promise<void>
  incrementInstallCount(): Promise<void>
  updateConfiguration(settings: any): Promise<void>
  validateConfiguration(): boolean
  getCompatibilityStatus(): 'compatible' | 'incompatible' | 'unknown'
}

const PluginSchema = new Schema<IPlugin>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  version: {
    type: String,
    required: true,
    match: /^\d+\.\d+\.\d+$/
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'ai-integration', 'productivity', 'analytics', 'collaboration',
      'automation', 'data-processing', 'visualization', 'export',
      'import', 'notification', 'security', 'custom'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isInstalled: {
    type: Boolean,
    default: false
  },
  installCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  configuration: {
    settings: [{
      key: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'select', 'multiselect'],
        required: true
      },
      value: {
        type: Schema.Types.Mixed,
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      },
      options: [{
        type: String
      }]
    }],
    permissions: [{
      type: String,
      enum: [
        'read-prompts', 'write-prompts', 'delete-prompts',
        'read-users', 'write-users', 'read-analytics',
        'write-analytics', 'read-settings', 'write-settings',
        'send-notifications', 'access-files', 'execute-commands'
      ]
    }],
    apiEndpoints: [{
      method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        required: true
      },
      path: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      parameters: [{
        name: {
          type: String,
          required: true
        },
        type: {
          type: String,
          required: true
        },
        required: {
          type: Boolean,
          default: false
        },
        description: {
          type: String
        }
      }]
    }]
  },
  files: {
    main: {
      type: String,
      required: true
    },
    dependencies: [{
      type: String
    }],
    assets: [{
      type: String
    }],
    documentation: {
      type: String
    }
  },
  metadata: {
    size: {
      type: Number,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    compatibility: {
      minVersion: {
        type: String,
        required: true
      },
      maxVersion: {
        type: String
      }
    },
    dependencies: [{
      name: {
        type: String,
        required: true
      },
      version: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['required', 'optional'],
        default: 'required'
      }
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'deprecated', 'flagged'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
PluginSchema.index({ name: 1 })
PluginSchema.index({ category: 1 })
PluginSchema.index({ tags: 1 })
PluginSchema.index({ author: 1 })
PluginSchema.index({ isPublic: 1 })
PluginSchema.index({ isActive: 1 })
PluginSchema.index({ installCount: -1 })
PluginSchema.index({ rating: -1 })
PluginSchema.index({ status: 1 })
PluginSchema.index({ createdAt: -1 })

// Virtual fields
PluginSchema.virtual('isPopular').get(function() {
  return this.installCount > 100 || this.rating > 4.0
})

PluginSchema.virtual('isTrending').get(function() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return this.installCount > 10 && this.updatedAt > oneWeekAgo
})

PluginSchema.virtual('ratingPercentage').get(function() {
  return (this.rating / 5) * 100
})

// Instance methods
PluginSchema.methods.install = async function(): Promise<void> {
  this.isInstalled = true
  this.installCount += 1
  await this.save()
}

PluginSchema.methods.uninstall = async function(): Promise<void> {
  this.isInstalled = false
  await this.save()
}

PluginSchema.methods.updateRating = async function(rating: number): Promise<void> {
  const totalRating = this.rating * this.totalRatings
  this.totalRatings += 1
  this.rating = (totalRating + rating) / this.totalRatings
  await this.save()
}

PluginSchema.methods.incrementInstallCount = async function(): Promise<void> {
  this.installCount += 1
  await this.save()
}

PluginSchema.methods.updateConfiguration = async function(settings: any): Promise<void> {
  this.configuration.settings = settings
  await this.save()
}

PluginSchema.methods.validateConfiguration = function(): boolean {
  return this.configuration.settings.every((setting: any) => {
    if (setting.required && (setting.value === undefined || setting.value === null)) {
      return false
    }
    return true
  })
}

PluginSchema.methods.getCompatibilityStatus = function(): 'compatible' | 'incompatible' | 'unknown' {
  const currentVersion = process.env.npm_package_version || '1.0.0'
  
  if (this.metadata.compatibility.minVersion && currentVersion < this.metadata.compatibility.minVersion) {
    return 'incompatible'
  }
  
  if (this.metadata.compatibility.maxVersion && currentVersion > this.metadata.compatibility.maxVersion) {
    return 'incompatible'
  }
  
  return 'compatible'
}

// Static methods
PluginSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isPublic: true, status: 'published' })
}

PluginSchema.statics.findByAuthor = function(authorId: string) {
  return this.find({ author: authorId })
}

PluginSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, status: 'published' })
}

PluginSchema.statics.findPopular = function(limit: number = 10) {
  return this.find({ isPublic: true, status: 'published' })
    .sort({ installCount: -1 })
    .limit(limit)
}

PluginSchema.statics.findTrending = function(limit: number = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return this.find({ 
    isPublic: true, 
    status: 'published',
    updatedAt: { $gte: oneWeekAgo }
  })
    .sort({ installCount: -1 })
    .limit(limit)
}

PluginSchema.statics.search = function(query: string) {
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

export default mongoose.model<IPlugin>('Plugin', PluginSchema)