const express = require('express')
const router = express.Router()

// Mock analytics data
const analytics = {
  overview: {
    totalPrompts: 1234,
    totalGenerations: 4567,
    totalUsers: 234,
    successRate: 94.2,
    averageResponseTime: 1.2,
    totalCost: 123.45
  },
  trends: {
    daily: [
      { date: '2024-01-01', prompts: 45, generations: 123, users: 12 },
      { date: '2024-01-02', prompts: 52, generations: 145, users: 15 },
      { date: '2024-01-03', prompts: 38, generations: 98, users: 10 },
      { date: '2024-01-04', prompts: 61, generations: 167, users: 18 },
      { date: '2024-01-05', prompts: 47, generations: 134, users: 14 },
      { date: '2024-01-06', prompts: 55, generations: 156, users: 16 },
      { date: '2024-01-07', prompts: 43, generations: 121, users: 13 }
    ],
    weekly: [
      { week: '2024-W01', prompts: 340, generations: 944, users: 98 },
      { week: '2024-W02', prompts: 387, generations: 1089, users: 112 },
      { week: '2024-W03', prompts: 421, generations: 1234, users: 125 },
      { week: '2024-W04', prompts: 456, generations: 1345, users: 138 }
    ],
    monthly: [
      { month: '2023-10', prompts: 1200, generations: 3400, users: 180 },
      { month: '2023-11', prompts: 1350, generations: 3800, users: 195 },
      { month: '2023-12', prompts: 1500, generations: 4200, users: 210 },
      { month: '2024-01', prompts: 1650, generations: 4600, users: 225 }
    ]
  },
  topPrompts: [
    { id: '1', title: 'Code Review Assistant', generations: 456, rating: 4.9, category: 'Development' },
    { id: '2', title: 'Creative Writing Generator', generations: 389, rating: 4.8, category: 'Writing' },
    { id: '3', title: 'Data Analysis Assistant', generations: 234, rating: 4.7, category: 'Analytics' },
    { id: '4', title: 'Marketing Copy Generator', generations: 198, rating: 4.6, category: 'Marketing' },
    { id: '5', title: 'Educational Content Creator', generations: 167, rating: 4.5, category: 'Education' }
  ],
  categories: [
    { name: 'Development', count: 456, percentage: 37.0, trend: '+12%' },
    { name: 'Writing', count: 234, percentage: 19.0, trend: '+8%' },
    { name: 'Analytics', count: 198, percentage: 16.0, trend: '+15%' },
    { name: 'Marketing', count: 156, percentage: 12.6, trend: '+5%' },
    { name: 'Education', count: 123, percentage: 10.0, trend: '+3%' },
    { name: 'Business', count: 67, percentage: 5.4, trend: '+2%' }
  ],
  models: [
    { name: 'GPT-4', usage: 45.2, cost: 67.89, avgTokens: 1250 },
    { name: 'GPT-3.5 Turbo', usage: 32.1, cost: 23.45, avgTokens: 890 },
    { name: 'Claude 3 Opus', usage: 15.3, cost: 18.76, avgTokens: 1100 },
    { name: 'Claude 3 Sonnet', usage: 7.4, cost: 13.35, avgTokens: 950 }
  ],
  performance: {
    responseTime: {
      p50: 0.8,
      p90: 2.1,
      p95: 3.5,
      p99: 8.2
    },
    successRate: {
      overall: 94.2,
      byModel: {
        'GPT-4': 96.1,
        'GPT-3.5 Turbo': 93.8,
        'Claude 3 Opus': 95.5,
        'Claude 3 Sonnet': 92.3
      }
    },
    errorRate: {
      overall: 5.8,
      byType: {
        'Rate Limit': 2.1,
        'Invalid Input': 1.8,
        'Model Error': 1.2,
        'Network Error': 0.7
      }
    }
  },
  userActivity: [
    { hour: 0, activeUsers: 12, generations: 45 },
    { hour: 1, activeUsers: 8, generations: 32 },
    { hour: 2, activeUsers: 5, generations: 18 },
    { hour: 3, activeUsers: 3, generations: 12 },
    { hour: 4, activeUsers: 4, generations: 15 },
    { hour: 5, activeUsers: 6, generations: 22 },
    { hour: 6, activeUsers: 15, generations: 58 },
    { hour: 7, activeUsers: 28, generations: 89 },
    { hour: 8, activeUsers: 45, generations: 134 },
    { hour: 9, activeUsers: 67, generations: 198 },
    { hour: 10, activeUsers: 78, generations: 234 },
    { hour: 11, activeUsers: 82, generations: 256 },
    { hour: 12, activeUsers: 75, generations: 223 },
    { hour: 13, activeUsers: 89, generations: 267 },
    { hour: 14, activeUsers: 95, generations: 289 },
    { hour: 15, activeUsers: 98, generations: 298 },
    { hour: 16, activeUsers: 92, generations: 276 },
    { hour: 17, activeUsers: 87, generations: 261 },
    { hour: 18, activeUsers: 76, generations: 228 },
    { hour: 19, activeUsers: 68, generations: 204 },
    { hour: 20, activeUsers: 54, generations: 162 },
    { hour: 21, activeUsers: 42, generations: 126 },
    { hour: 22, activeUsers: 28, generations: 84 },
    { hour: 23, activeUsers: 18, generations: 54 }
  ],
  recentActivity: [
    { id: '1', type: 'prompt_created', user: 'John Doe', prompt: 'Code Review Assistant', timestamp: new Date('2024-01-15T10:30:00Z') },
    { id: '2', type: 'prompt_shared', user: 'Jane Smith', prompt: 'Creative Writing Generator', timestamp: new Date('2024-01-15T09:15:00Z') },
    { id: '3', type: 'generation_completed', user: 'Mike Johnson', prompt: 'Data Analysis Assistant', timestamp: new Date('2024-01-15T08:45:00Z') },
    { id: '4', type: 'collaboration_started', user: 'Sarah Wilson', prompt: 'Marketing Copy Generator', timestamp: new Date('2024-01-15T07:30:00Z') },
    { id: '5', type: 'template_created', user: 'David Brown', prompt: 'Educational Content Creator', timestamp: new Date('2024-01-15T06:20:00Z') }
  ]
}

// Get analytics overview
router.get('/overview', (req, res) => {
  res.json(analytics.overview)
})

// Get trends data
router.get('/trends', (req, res) => {
  const { period = 'daily' } = req.query
  
  let trendsData
  switch (period) {
    case 'daily':
      trendsData = analytics.trends.daily
      break
    case 'weekly':
      trendsData = analytics.trends.weekly
      break
    case 'monthly':
      trendsData = analytics.trends.monthly
      break
    default:
      trendsData = analytics.trends.daily
  }
  
  res.json(trendsData)
})

// Get top prompts
router.get('/top-prompts', (req, res) => {
  const { limit = 10, category } = req.query
  
  let topPrompts = analytics.topPrompts
  
  if (category) {
    topPrompts = topPrompts.filter(p => p.category === category)
  }
  
  topPrompts = topPrompts.slice(0, parseInt(limit))
  
  res.json(topPrompts)
})

// Get category distribution
router.get('/categories', (req, res) => {
  res.json(analytics.categories)
})

// Get model usage
router.get('/models', (req, res) => {
  res.json(analytics.models)
})

// Get performance metrics
router.get('/performance', (req, res) => {
  res.json(analytics.performance)
})

// Get user activity
router.get('/user-activity', (req, res) => {
  const { period = 'hourly' } = req.query
  
  if (period === 'hourly') {
    res.json(analytics.userActivity)
  } else {
    // For other periods, you would aggregate the data differently
    res.json(analytics.userActivity)
  }
})

// Get recent activity
router.get('/recent-activity', (req, res) => {
  const { limit = 20, type } = req.query
  
  let recentActivity = analytics.recentActivity
  
  if (type) {
    recentActivity = recentActivity.filter(a => a.type === type)
  }
  
  recentActivity = recentActivity.slice(0, parseInt(limit))
  
  res.json(recentActivity)
})

// Get custom analytics query
router.post('/query', (req, res) => {
  try {
    const { metrics, dimensions, filters, dateRange } = req.body
    
    // In a real application, this would query the actual database
    // For now, return mock data based on the query parameters
    
    const mockResult = {
      data: [],
      metadata: {
        query: { metrics, dimensions, filters, dateRange },
        totalRows: 0,
        executionTime: 0.123
      }
    }
    
    res.json(mockResult)
  } catch (error) {
    console.error('Analytics query error:', error)
    res.status(500).json({ error: 'Analytics query failed' })
  }
})

// Export analytics data
router.get('/export', (req, res) => {
  const { format = 'json', type = 'overview' } = req.query
  
  let data
  switch (type) {
    case 'overview':
      data = analytics.overview
      break
    case 'trends':
      data = analytics.trends
      break
    case 'prompts':
      data = analytics.topPrompts
      break
    case 'categories':
      data = analytics.categories
      break
    case 'models':
      data = analytics.models
      break
    case 'performance':
      data = analytics.performance
      break
    default:
      data = analytics.overview
  }
  
  if (format === 'csv') {
    // Convert to CSV format
    const csv = convertToCSV(data)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"')
    res.send(csv)
  } else {
    res.json(data)
  }
})

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (Array.isArray(data)) {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value}"` : value
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  } else {
    // For single objects, convert to key-value pairs
    const rows = Object.entries(data).map(([key, value]) => ({ key, value }))
    return convertToCSV(rows)
  }
}

module.exports = router
