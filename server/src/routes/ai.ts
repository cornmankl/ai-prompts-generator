import express from 'express';
import { authService } from '../services/authService';
import { aiService } from '../services/aiService';
import { promptEngineeringService } from '../services/promptEngineeringService';
import { analyticsService } from '../services/analyticsService';
import { cacheService } from '../services/cacheService';
import { logger } from '../services/loggerService';
import { authRateLimit, aiRateLimit, validateApiKey } from '../middleware/security';

const router = express.Router();

// Apply rate limiting
router.use(aiRateLimit);

// Get available models
router.get('/models', async (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    res.json({ success: true, data: models });
  } catch (error) {
    logger.error('Error getting models:', error);
    res.status(500).json({ success: false, error: 'Failed to get models' });
  }
});

// Get model details
router.get('/models/:id', async (req, res) => {
  try {
    const model = aiService.getModelById(req.params.id);
    if (!model) {
      return res.status(404).json({ success: false, error: 'Model not found' });
    }
    res.json({ success: true, data: model });
  } catch (error) {
    logger.error('Error getting model details:', error);
    res.status(500).json({ success: false, error: 'Failed to get model details' });
  }
});

// Generate AI response
router.post('/generate', async (req, res) => {
  try {
    const { model, prompt, options, metadata } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!model || !prompt) {
      return res.status(400).json({ success: false, error: 'Model and prompt are required' });
    }

    // Track event
    await analyticsService.trackEvent(userId, 'ai_request', {
      model,
      promptLength: prompt.length,
      options,
      metadata
    });

    const response = await aiService.generateResponse({
      model,
      prompt,
      userId,
      options,
      metadata
    });

    // Track successful response
    await analyticsService.trackEvent(userId, 'ai_response', {
      model,
      tokens: response.usage.totalTokens,
      cost: response.usage.cost,
      responseTime: response.metadata.responseTime
    });

    res.json({ success: true, data: response });
  } catch (error) {
    logger.error('Error generating response:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate response' });
  }
});

// Stream AI response
router.post('/stream', async (req, res) => {
  try {
    const { model, prompt, options, metadata } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!model || !prompt) {
      return res.status(400).json({ success: false, error: 'Model and prompt are required' });
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Track event
    await analyticsService.trackEvent(userId, 'ai_stream_request', {
      model,
      promptLength: prompt.length,
      options,
      metadata
    });

    let totalTokens = 0;
    let totalCost = 0;
    let responseTime = Date.now();

    try {
      await aiService.streamResponse({
        model,
        prompt,
        userId,
        options: { ...options, stream: true },
        metadata
      }, {
        onChunk: (chunk: string) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        },
        onComplete: async (response: any) => {
          totalTokens = response.usage.totalTokens;
          totalCost = response.usage.cost;
          responseTime = Date.now() - responseTime;

          res.write(`data: ${JSON.stringify({
            type: 'complete',
            usage: response.usage,
            metadata: { ...response.metadata, responseTime }
          })}\n\n`);

          // Track successful response
          await analyticsService.trackEvent(userId, 'ai_stream_response', {
            model,
            tokens: totalTokens,
            cost: totalCost,
            responseTime
          });

          res.end();
        },
        onError: (error: Error) => {
          res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
          res.end();
        }
      }, req.signal);
    } catch (error) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    }
  } catch (error) {
    logger.error('Error streaming response:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to stream response' });
  }
});

// Compare models
router.post('/compare', async (req, res) => {
  try {
    const { prompt, modelIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!prompt || !modelIds || !Array.isArray(modelIds)) {
      return res.status(400).json({ success: false, error: 'Prompt and modelIds are required' });
    }

    if (modelIds.length > 5) {
      return res.status(400).json({ success: false, error: 'Maximum 5 models can be compared' });
    }

    const responses = await aiService.compareModels(prompt, modelIds, userId);

    // Track comparison event
    await analyticsService.trackEvent(userId, 'model_comparison', {
      promptLength: prompt.length,
      modelCount: modelIds.length,
      models: modelIds
    });

    res.json({ success: true, data: responses });
  } catch (error) {
    logger.error('Error comparing models:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to compare models' });
  }
});

// Get model performance
router.get('/performance', async (req, res) => {
  try {
    const performance = await aiService.getModelPerformance();
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('Error getting model performance:', error);
    res.status(500).json({ success: false, error: 'Failed to get model performance' });
  }
});

// Prompt engineering routes
router.get('/templates', async (req, res) => {
  try {
    const { category, search, tags } = req.query;
    const templates = await promptEngineeringService.getTemplates(
      category as string,
      search as string,
      tags ? (tags as string).split(',') : undefined
    );
    res.json({ success: true, data: templates });
  } catch (error) {
    logger.error('Error getting templates:', error);
    res.status(500).json({ success: false, error: 'Failed to get templates' });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const template = await promptEngineeringService.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Error getting template:', error);
    res.status(500).json({ success: false, error: 'Failed to get template' });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const template = await promptEngineeringService.createTemplate({
      ...req.body,
      author: userId
    });
    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({ success: false, error: 'Failed to create template' });
  }
});

router.put('/templates/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const template = await promptEngineeringService.updateTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({ success: false, error: 'Failed to update template' });
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const deleted = await promptEngineeringService.deleteTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({ success: false, error: 'Failed to delete template' });
  }
});

router.post('/templates/:id/use', async (req, res) => {
  try {
    const { variables } = req.body;
    const prompt = await promptEngineeringService.useTemplate(req.params.id, variables);
    res.json({ success: true, data: { prompt } });
  } catch (error) {
    logger.error('Error using template:', error);
    res.status(500).json({ success: false, error: 'Failed to use template' });
  }
});

router.post('/templates/:id/rate', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const success = await promptEngineeringService.rateTemplate(req.params.id, rating, userId);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    logger.error('Error rating template:', error);
    res.status(500).json({ success: false, error: 'Failed to rate template' });
  }
});

// Prompt optimization
router.post('/optimize', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const optimization = await promptEngineeringService.optimizePrompt(prompt);
    res.json({ success: true, data: optimization });
  } catch (error) {
    logger.error('Error optimizing prompt:', error);
    res.status(500).json({ success: false, error: 'Failed to optimize prompt' });
  }
});

// Prompt analysis
router.post('/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const analysis = await promptEngineeringService.analyzePrompt(prompt);
    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('Error analyzing prompt:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze prompt' });
  }
});

// Prompt chains
router.get('/chains', async (req, res) => {
  try {
    const chains = await promptEngineeringService.getPromptChains();
    res.json({ success: true, data: chains });
  } catch (error) {
    logger.error('Error getting prompt chains:', error);
    res.status(500).json({ success: false, error: 'Failed to get prompt chains' });
  }
});

router.post('/chains', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const chain = await promptEngineeringService.createPromptChain({
      ...req.body,
      author: userId
    });
    res.json({ success: true, data: chain });
  } catch (error) {
    logger.error('Error creating prompt chain:', error);
    res.status(500).json({ success: false, error: 'Failed to create prompt chain' });
  }
});

router.post('/chains/:id/execute', async (req, res) => {
  try {
    const { variables } = req.body;
    const results = await promptEngineeringService.executePromptChain(req.params.id, variables);
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Error executing prompt chain:', error);
    res.status(500).json({ success: false, error: 'Failed to execute prompt chain' });
  }
});

// Prompt library
router.get('/library', async (req, res) => {
  try {
    const userId = req.user?.id;
    const library = await promptEngineeringService.getPromptLibrary(userId);
    res.json({ success: true, data: library });
  } catch (error) {
    logger.error('Error getting prompt library:', error);
    res.status(500).json({ success: false, error: 'Failed to get prompt library' });
  }
});

// Analytics routes
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { timeRange = 'month' } = req.query;
    const analytics = await analyticsService.getUserAnalytics(userId, timeRange as any);
    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error getting user analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

router.get('/analytics/overall', async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const analytics = await analyticsService.getOverallAnalytics(timeRange as any);
    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error getting overall analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to get overall analytics' });
  }
});

router.get('/analytics/performance', async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const performance = await analyticsService.getPerformanceMetrics(timeRange as any);
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to get performance metrics' });
  }
});

router.get('/analytics/realtime', async (req, res) => {
  try {
    const metrics = await analyticsService.getRealTimeMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    logger.error('Error getting real-time metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to get real-time metrics' });
  }
});

router.post('/analytics/track', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { event, properties } = req.body;
    if (!event) {
      return res.status(400).json({ success: false, error: 'Event is required' });
    }

    await analyticsService.trackEvent(userId, event, properties);
    res.json({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    logger.error('Error tracking event:', error);
    res.status(500).json({ success: false, error: 'Failed to track event' });
  }
});

router.post('/analytics/report', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { type = 'monthly' } = req.body;
    const report = await analyticsService.generateReport(type, userId);
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

// Usage tracking
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const usage = await aiService.getUserUsage(userId);
    res.json({ success: true, data: usage });
  } catch (error) {
    logger.error('Error getting usage:', error);
    res.status(500).json({ success: false, error: 'Failed to get usage' });
  }
});

// Cache management
router.post('/cache/clear', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Clear user-specific cache
    const pattern = `*:${userId}:*`;
    const keys = await cacheService.getKeys(pattern);
    for (const key of keys) {
      await cacheService.del(key);
    }

    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cache' });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        ai: 'operational',
        cache: 'operational',
        analytics: 'operational'
      }
    };
    res.json({ success: true, data: health });
  } catch (error) {
    logger.error('Error checking health:', error);
    res.status(500).json({ success: false, error: 'Health check failed' });
  }
});

export default router;