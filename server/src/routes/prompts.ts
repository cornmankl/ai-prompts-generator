import { Router, Request, Response } from 'express'
import { body, validationResult, query } from 'express-validator'
import Prompt from '../models/Prompt'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Validation middleware
const createPromptValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('content').trim().isLength({ min: 1, max: 50000 }).withMessage('Content must be 1-50000 characters'),
  body('category').isIn([
    'general', 'coding', 'writing', 'analysis', 'creative', 'business',
    'education', 'research', 'marketing', 'sales', 'customer-service',
    'technical', 'design', 'strategy', 'planning', 'review', 'optimization'
  ]).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('isTemplate').optional().isBoolean().withMessage('isTemplate must be boolean')
]

const updatePromptValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('content').optional().trim().isLength({ min: 1, max: 50000 }).withMessage('Content must be 1-50000 characters'),
  body('category').optional().isIn([
    'general', 'coding', 'writing', 'analysis', 'creative', 'business',
    'education', 'research', 'marketing', 'sales', 'customer-service',
    'technical', 'design', 'strategy', 'planning', 'review', 'optimization'
  ]).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('isTemplate').optional().isBoolean().withMessage('isTemplate must be boolean')
]

// Get all prompts (with pagination and filtering)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('category').optional().isString().withMessage('Category must be string'),
  query('tags').optional().isString().withMessage('Tags must be string'),
  query('search').optional().isString().withMessage('Search must be string'),
  query('author').optional().isMongoId().withMessage('Author must be valid MongoDB ID'),
  query('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  query('isTemplate').optional().isBoolean().withMessage('isTemplate must be boolean'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'usageCount', 'rating', 'views']).withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    
    if (req.query.category) filter.category = req.query.category
    if (req.query.tags) filter.tags = { $in: (req.query.tags as string).split(',') }
    if (req.query.author) filter.author = req.query.author
    if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true'
    if (req.query.isTemplate !== undefined) filter.isTemplate = req.query.isTemplate === 'true'
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string }
    }

    // Build sort
    const sortBy = req.query.sortBy as string || 'createdAt'
    const sortOrder = req.query.sortOrder as string || 'desc'
    const sort: any = {}
    
    if (sortBy === 'usageCount') {
      sort['performance.usageCount'] = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'rating') {
      sort['performance.averageRating'] = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'views') {
      sort['analytics.views'] = sortOrder === 'asc' ? 1 : -1
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    }

    const prompts = await Prompt.find(filter)
      .populate('author', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Prompt.countDocuments(filter)

    res.json({
      success: true,
      data: {
        prompts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get prompt by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const prompt = await Prompt.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('collaboration.sharedWith.user', 'name email avatar')

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      })
    }

    // Increment view count
    await prompt.addView()

    res.json({
      success: true,
      data: { prompt }
    })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Create new prompt
router.post('/', authMiddleware, createPromptValidation, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const promptData = {
      ...req.body,
      author: req.user!._id
    }

    const prompt = new Prompt(promptData)
    await prompt.save()

    await prompt.populate('author', 'name email avatar')

    res.status(201).json({
      success: true,
      message: 'Prompt created successfully',
      data: { prompt }
    })
  } catch (error) {
    console.error('Error creating prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Update prompt
router.put('/:id', authMiddleware, updatePromptValidation, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const prompt = await Prompt.findById(req.params.id)

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      })
    }

    // Check if user owns the prompt or has edit permission
    const hasPermission = prompt.author.toString() === req.user!._id.toString() ||
      prompt.collaboration.sharedWith.some((share: any) => 
        share.user.toString() === req.user!._id.toString() && 
        ['edit', 'admin'].includes(share.permission)
      )

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    // Update prompt
    Object.assign(prompt, req.body)
    await prompt.updateVersion()
    await prompt.save()

    await prompt.populate('author', 'name email avatar')

    res.json({
      success: true,
      message: 'Prompt updated successfully',
      data: { prompt }
    })
  } catch (error) {
    console.error('Error updating prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Delete prompt
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const prompt = await Prompt.findById(req.params.id)

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      })
    }

    // Check if user owns the prompt or has admin permission
    const hasPermission = prompt.author.toString() === req.user!._id.toString() ||
      prompt.collaboration.sharedWith.some((share: any) => 
        share.user.toString() === req.user!._id.toString() && 
        share.permission === 'admin'
      )

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    await Prompt.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Prompt deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Rate prompt
router.post('/:id/rate', authMiddleware, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const prompt = await Prompt.findById(req.params.id)

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      })
    }

    await prompt.addRating(req.body.rating)

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: {
        averageRating: prompt.performance.averageRating,
        totalRatings: prompt.performance.totalRatings
      }
    })
  } catch (error) {
    console.error('Error rating prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Like/Unlike prompt
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const prompt = await Prompt.findById(req.params.id)

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      })
    }

    await prompt.addLike()

    res.json({
      success: true,
      message: 'Prompt liked successfully',
      data: {
        likes: prompt.analytics.likes
      }
    })
  } catch (error) {
    console.error('Error liking prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Share prompt with user
router.post('/:id/share', authMiddleware, [
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('permission').isIn(['view', 'edit', 'admin']).withMessage('Permission must be view, edit, or admin')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const prompt = await Prompt.findById(req.params.id)

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      })
    }

    // Check if user owns the prompt
    if (prompt.author.toString() !== req.user!._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the prompt owner can share it'
      })
    }

    await prompt.shareWithUser(req.body.userId, req.body.permission)

    res.json({
      success: true,
      message: 'Prompt shared successfully'
    })
  } catch (error) {
    console.error('Error sharing prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Fork prompt
router.post('/:id/fork', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const prompt = await Prompt.findById(req.params.id)

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      })
    }

    if (!prompt.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Cannot fork private prompt'
      })
    }

    const forkedPrompt = await prompt.fork(req.user!._id.toString())
    await forkedPrompt.populate('author', 'name email avatar')

    res.status(201).json({
      success: true,
      message: 'Prompt forked successfully',
      data: { prompt: forkedPrompt }
    })
  } catch (error) {
    console.error('Error forking prompt:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get popular prompts
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const prompts = await Prompt.findPopular(limit)
      .populate('author', 'name email avatar')

    res.json({
      success: true,
      data: { prompts }
    })
  } catch (error) {
    console.error('Error fetching popular prompts:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get trending prompts
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const prompts = await Prompt.findTrending(limit)
      .populate('author', 'name email avatar')

    res.json({
      success: true,
      data: { prompts }
    })
  } catch (error) {
    console.error('Error fetching trending prompts:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router