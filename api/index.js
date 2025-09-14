// Main API handler for Vercel
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// AI Routes
app.get('/api/ai/models', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Most capable GPT-4 model',
        maxTokens: 128000,
        costPerToken: 0.00003
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Faster, cheaper GPT-4 model',
        maxTokens: 128000,
        costPerToken: 0.000015
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Most intelligent Claude model',
        maxTokens: 200000,
        costPerToken: 0.00003
      }
    ]
  });
});

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { model, prompt, options = {} } = req.body;
    
    if (!model || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Model and prompt are required'
      });
    }

    // Mock AI response for demo
    const response = {
      success: true,
      data: {
        content: `This is a mock response for the prompt: "${prompt}" using model: ${model}`,
        model,
        usage: {
          promptTokens: prompt.length / 4,
          completionTokens: 50,
          totalTokens: (prompt.length / 4) + 50,
          cost: 0.001
        },
        metadata: {
          responseTime: 1500,
          timestamp: new Date().toISOString()
        }
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate response'
    });
  }
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Mock authentication
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        email,
        name: 'Demo User',
        avatar: null,
        subscription: {
          plan: 'free',
          status: 'active'
        }
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and name are required'
    });
  }

  // Mock registration
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        email,
        name,
        avatar: null,
        subscription: {
          plan: 'free',
          status: 'active'
        }
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    }
  });
});

// Analytics Routes
app.get('/api/analytics/overall', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 1250,
      activeUsers: 890,
      totalPrompts: 15600,
      totalResponses: 14800,
      totalTokens: 2500000,
      totalCost: 125.50,
      averageResponseTime: 1200,
      popularModels: [
        { model: 'gpt-4o', count: 8500, percentage: 57.4 },
        { model: 'claude-3-5-sonnet', count: 4200, percentage: 26.9 },
        { model: 'gpt-4o-mini', count: 2100, percentage: 13.5 }
      ],
      popularCategories: [
        { category: 'Creative Writing', count: 4200, percentage: 26.9 },
        { category: 'Code Generation', count: 3800, percentage: 24.4 },
        { category: 'Analysis', count: 3200, percentage: 20.5 }
      ],
      usageByDay: [],
      userGrowth: [],
      revenue: [],
      errorRate: 0.02,
      averageSessionDuration: 1800,
      bounceRate: 0.15,
      topFeatures: []
    }
  });
});

// Catch all handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

module.exports = app;
