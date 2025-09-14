import mongoose, { Document, Schema } from 'mongoose'

export interface IAnalytics extends Document {
  _id: string
  userId?: mongoose.Types.ObjectId
  sessionId?: string
  event: string
  category: string
  properties: {
    [key: string]: any
  }
  timestamp: Date
  userAgent?: string
  ip?: string
  referrer?: string
  page?: string
  duration?: number
  metadata: {
    version: string
    environment: string
    source: string
  }
  createdAt: Date
}

export interface IAnalyticsSummary extends Document {
  _id: string
  date: Date
  metrics: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    totalSessions: number
    averageSessionDuration: number
    totalEvents: number
    topEvents: Array<{
      event: string
      count: number
    }>
    topPages: Array<{
      page: string
      views: number
    }>
    userEngagement: {
      low: number
      medium: number
      high: number
    }
    deviceBreakdown: {
      desktop: number
      mobile: number
      tablet: number
    }
    browserBreakdown: {
      [browser: string]: number
    }
    countryBreakdown: {
      [country: string]: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

const AnalyticsSchema = new Schema<IAnalytics>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sessionId: {
    type: String,
    required: false
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'user', 'prompt', 'ai', 'collaboration', 'plugin', 'subscription',
      'navigation', 'error', 'performance', 'security', 'custom'
    ]
  },
  properties: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String
  },
  ip: {
    type: String
  },
  referrer: {
    type: String
  },
  page: {
    type: String
  },
  duration: {
    type: Number
  },
  metadata: {
    version: {
      type: String,
      default: '1.0.0'
    },
    environment: {
      type: String,
      default: 'production'
    },
    source: {
      type: String,
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

const AnalyticsSummarySchema = new Schema<IAnalyticsSummary>({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  metrics: {
    totalUsers: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    newUsers: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    totalEvents: {
      type: Number,
      default: 0
    },
    topEvents: [{
      event: {
        type: String,
        required: true
      },
      count: {
        type: Number,
        required: true
      }
    }],
    topPages: [{
      page: {
        type: String,
        required: true
      },
      views: {
        type: Number,
        required: true
      }
    }],
    userEngagement: {
      low: {
        type: Number,
        default: 0
      },
      medium: {
        type: Number,
        default: 0
      },
      high: {
        type: Number,
        default: 0
      }
    },
    deviceBreakdown: {
      desktop: {
        type: Number,
        default: 0
      },
      mobile: {
        type: Number,
        default: 0
      },
      tablet: {
        type: Number,
        default: 0
      }
    },
    browserBreakdown: {
      type: Schema.Types.Mixed,
      default: {}
    },
    countryBreakdown: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for Analytics
AnalyticsSchema.index({ userId: 1 })
AnalyticsSchema.index({ sessionId: 1 })
AnalyticsSchema.index({ event: 1 })
AnalyticsSchema.index({ category: 1 })
AnalyticsSchema.index({ timestamp: -1 })
AnalyticsSchema.index({ createdAt: -1 })

// Indexes for AnalyticsSummary
AnalyticsSummarySchema.index({ date: -1 })

// Static methods for Analytics
AnalyticsSchema.statics.trackEvent = function(data: {
  userId?: string
  sessionId?: string
  event: string
  category: string
  properties?: any
  userAgent?: string
  ip?: string
  referrer?: string
  page?: string
  duration?: number
}) {
  return this.create({
    ...data,
    timestamp: new Date()
  })
}

AnalyticsSchema.statics.getUserAnalytics = function(userId: string, startDate?: Date, endDate?: Date) {
  const filter: any = { userId }
  
  if (startDate && endDate) {
    filter.timestamp = { $gte: startDate, $lte: endDate }
  }
  
  return this.find(filter).sort({ timestamp: -1 })
}

AnalyticsSchema.statics.getEventAnalytics = function(event: string, startDate?: Date, endDate?: Date) {
  const filter: any = { event }
  
  if (startDate && endDate) {
    filter.timestamp = { $gte: startDate, $lte: endDate }
  }
  
  return this.find(filter).sort({ timestamp: -1 })
}

AnalyticsSchema.statics.getTopEvents = function(limit: number = 10, startDate?: Date, endDate?: Date) {
  const filter: any = {}
  
  if (startDate && endDate) {
    filter.timestamp = { $gte: startDate, $lte: endDate }
  }
  
  return this.aggregate([
    { $match: filter },
    { $group: { _id: '$event', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ])
}

AnalyticsSchema.statics.getTopPages = function(limit: number = 10, startDate?: Date, endDate?: Date) {
  const filter: any = { page: { $exists: true } }
  
  if (startDate && endDate) {
    filter.timestamp = { $gte: startDate, $lte: endDate }
  }
  
  return this.aggregate([
    { $match: filter },
    { $group: { _id: '$page', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: limit }
  ])
}

AnalyticsSchema.statics.getUserEngagement = function(startDate?: Date, endDate?: Date) {
  const filter: any = { userId: { $exists: true } }
  
  if (startDate && endDate) {
    filter.timestamp = { $gte: startDate, $lte: endDate }
  }
  
  return this.aggregate([
    { $match: filter },
    { $group: { _id: '$userId', eventCount: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
    { $project: { userId: '$_id', eventCount: 1, sessionCount: { $size: '$sessions' } } },
    {
      $bucket: {
        groupBy: '$eventCount',
        boundaries: [0, 5, 20, 100],
        default: 'high',
        output: {
          low: { $sum: { $cond: [{ $lt: ['$eventCount', 5] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $and: [{ $gte: ['$eventCount', 5] }, { $lt: ['$eventCount', 20] }] }, 1, 0] } },
          high: { $sum: { $cond: [{ $gte: ['$eventCount', 20] }, 1, 0] } }
        }
      }
    }
  ])
}

AnalyticsSchema.statics.getDeviceBreakdown = function(startDate?: Date, endDate?: Date) {
  const filter: any = { userAgent: { $exists: true } }
  
  if (startDate && endDate) {
    filter.timestamp = { $gte: startDate, $lte: endDate }
  }
  
  return this.aggregate([
    { $match: filter },
    {
      $project: {
        device: {
          $cond: {
            if: { $regexMatch: { input: '$userAgent', regex: /Mobile|Android|iPhone/i } },
            then: 'mobile',
            else: {
              $cond: {
                if: { $regexMatch: { input: '$userAgent', regex: /Tablet|iPad/i } },
                then: 'tablet',
                else: 'desktop'
              }
            }
          }
        }
      }
    },
    { $group: { _id: '$device', count: { $sum: 1 } } }
  ])
}

AnalyticsSchema.statics.getBrowserBreakdown = function(startDate?: Date, endDate?: Date) {
  const filter: any = { userAgent: { $exists: true } }
  
  if (startDate && endDate) {
    filter.timestamp = { $gte: startDate, $lte: endDate }
  }
  
  return this.aggregate([
    { $match: filter },
    {
      $project: {
        browser: {
          $cond: {
            if: { $regexMatch: { input: '$userAgent', regex: /Chrome/i } },
            then: 'Chrome',
            else: {
              $cond: {
                if: { $regexMatch: { input: '$userAgent', regex: /Firefox/i } },
                then: 'Firefox',
                else: {
                  $cond: {
                    if: { $regexMatch: { input: '$userAgent', regex: /Safari/i } },
                    then: 'Safari',
                    else: {
                      $cond: {
                        if: { $regexMatch: { input: '$userAgent', regex: /Edge/i } },
                        then: 'Edge',
                        else: 'Other'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])
}

AnalyticsSchema.statics.generateDailySummary = async function(date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  const filter = { timestamp: { $gte: startOfDay, $lte: endOfDay } }
  
  // Get basic metrics
  const totalEvents = await this.countDocuments(filter)
  const uniqueUsers = await this.distinct('userId', { ...filter, userId: { $exists: true } })
  const uniqueSessions = await this.distinct('sessionId', { ...filter, sessionId: { $exists: true } })
  
  // Get new users (users who created their first event on this date)
  const newUsers = await this.aggregate([
    { $match: { ...filter, userId: { $exists: true } } },
    { $group: { _id: '$userId', firstEvent: { $min: '$timestamp' } } },
    { $match: { firstEvent: { $gte: startOfDay, $lte: endOfDay } } },
    { $count: 'count' }
  ])
  
  // Get top events
  const topEvents = await this.getTopEvents(10, startOfDay, endOfDay)
  
  // Get top pages
  const topPages = await this.getTopPages(10, startOfDay, endOfDay)
  
  // Get user engagement
  const userEngagement = await this.getUserEngagement(startOfDay, endOfDay)
  
  // Get device breakdown
  const deviceBreakdown = await this.getDeviceBreakdown(startOfDay, endOfDay)
  
  // Get browser breakdown
  const browserBreakdown = await this.getBrowserBreakdown(startOfDay, endOfDay)
  
  // Calculate average session duration
  const sessionDurations = await this.aggregate([
    { $match: { ...filter, sessionId: { $exists: true }, duration: { $exists: true } } },
    { $group: { _id: '$sessionId', totalDuration: { $sum: '$duration' } } },
    { $group: { _id: null, averageDuration: { $avg: '$totalDuration' } } }
  ])
  
  const summary = {
    date: startOfDay,
    metrics: {
      totalUsers: uniqueUsers.length,
      activeUsers: uniqueUsers.length,
      newUsers: newUsers[0]?.count || 0,
      totalSessions: uniqueSessions.length,
      averageSessionDuration: sessionDurations[0]?.averageDuration || 0,
      totalEvents,
      topEvents: topEvents.map((item: any) => ({ event: item._id, count: item.count })),
      topPages: topPages.map((item: any) => ({ page: item._id, views: item.views })),
      userEngagement: userEngagement[0] || { low: 0, medium: 0, high: 0 },
      deviceBreakdown: {
        desktop: deviceBreakdown.find((d: any) => d._id === 'desktop')?.count || 0,
        mobile: deviceBreakdown.find((d: any) => d._id === 'mobile')?.count || 0,
        tablet: deviceBreakdown.find((d: any) => d._id === 'tablet')?.count || 0
      },
      browserBreakdown: browserBreakdown.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      countryBreakdown: {} // Would need IP geolocation service
    }
  }
  
  // Save or update summary
  await AnalyticsSummary.findOneAndUpdate(
    { date: startOfDay },
    summary,
    { upsert: true, new: true }
  )
  
  return summary
}

// Static methods for AnalyticsSummary
AnalyticsSummarySchema.statics.getSummary = function(startDate: Date, endDate: Date) {
  return this.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 })
}

AnalyticsSummarySchema.statics.getLatestSummary = function() {
  return this.findOne().sort({ date: -1 })
}

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema)
export const AnalyticsSummary = mongoose.model<IAnalyticsSummary>('AnalyticsSummary', AnalyticsSummarySchema)

export default Analytics