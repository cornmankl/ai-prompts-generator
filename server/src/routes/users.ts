import { Router, Request, Response } from 'express'
import { body, validationResult, query } from 'express-validator'
import User from '../models/User'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Validation middleware
const updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be valid URL'),
  body('preferences.theme').optional().isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system'),
  body('preferences.language').optional().isLength({ min: 2, max: 10 }).withMessage('Language must be 2-10 characters'),
  body('preferences.timezone').optional().isString().withMessage('Timezone must be string'),
  body('social.github').optional().isURL().withMessage('GitHub must be valid URL'),
  body('social.twitter').optional().isURL().withMessage('Twitter must be valid URL'),
  body('social.linkedin').optional().isURL().withMessage('LinkedIn must be valid URL'),
  body('social.website').optional().isURL().withMessage('Website must be valid URL')
]

// Get user profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret -twoFactorBackupCodes')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Update user profile
router.put('/profile', authMiddleware, updateUserValidation, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const allowedUpdates = ['name', 'avatar', 'preferences', 'social']
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key))
    
    const updateData: any = {}
    updates.forEach(key => {
      updateData[key] = req.body[key]
    })

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret -twoFactorBackupCodes')

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get user statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
      .select('usage limits subscription createdAt')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Calculate usage percentages
    const usageStats = {
      prompts: {
        used: user.usage.promptsGenerated,
        limit: user.limits.dailyPrompts,
        percentage: Math.round((user.usage.promptsGenerated / user.limits.dailyPrompts) * 100)
      },
      tokens: {
        used: user.usage.tokensUsed,
        limit: user.limits.monthlyTokens,
        percentage: Math.round((user.usage.tokensUsed / user.limits.monthlyTokens) * 100)
      },
      apiCalls: {
        used: user.usage.apiCalls,
        limit: user.limits.apiCallsPerHour,
        percentage: Math.round((user.usage.apiCalls / user.limits.apiCallsPerHour) * 100)
      }
    }

    res.json({
      success: true,
      data: {
        usage: usageStats,
        subscription: user.subscription,
        memberSince: user.createdAt
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get user's prompts
router.get('/prompts', authMiddleware, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
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

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const filter: any = { author: req.user!._id }
    if (req.query.status) {
      filter.status = req.query.status
    }

    const prompts = await Prompt.find(filter)
      .sort({ createdAt: -1 })
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
    console.error('Error fetching user prompts:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get user's shared prompts
router.get('/shared', authMiddleware, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
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

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const prompts = await Prompt.find({
      'collaboration.sharedWith.user': req.user!._id
    })
      .populate('author', 'name email avatar')
      .sort({ 'collaboration.sharedWith.addedAt': -1 })
      .skip(skip)
      .limit(limit)

    const total = await Prompt.countDocuments({
      'collaboration.sharedWith.user': req.user!._id
    })

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
    console.error('Error fetching shared prompts:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Update user preferences
router.put('/preferences', authMiddleware, [
  body('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system'),
  body('language').optional().isLength({ min: 2, max: 10 }).withMessage('Language must be 2-10 characters'),
  body('timezone').optional().isString().withMessage('Timezone must be string'),
  body('notifications.email').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('notifications.push').optional().isBoolean().withMessage('Push notifications must be boolean'),
  body('notifications.sms').optional().isBoolean().withMessage('SMS notifications must be boolean'),
  body('privacy.profileVisibility').optional().isIn(['public', 'private', 'friends']).withMessage('Profile visibility must be public, private, or friends'),
  body('privacy.showEmail').optional().isBoolean().withMessage('Show email must be boolean'),
  body('privacy.showActivity').optional().isBoolean().withMessage('Show activity must be boolean'),
  body('ai.defaultModel').optional().isString().withMessage('Default model must be string'),
  body('ai.temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be 0-2'),
  body('ai.maxTokens').optional().isInt({ min: 1, max: 8192 }).withMessage('Max tokens must be 1-8192'),
  body('ai.enableChainOfThought').optional().isBoolean().withMessage('Enable chain of thought must be boolean'),
  body('ai.enableFewShot').optional().isBoolean().withMessage('Enable few shot must be boolean')
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

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { preferences: req.body },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret -twoFactorBackupCodes')

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user }
    })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Delete user account
router.delete('/account', authMiddleware, [
  body('password').notEmpty().withMessage('Password is required for account deletion')
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

    const user = await User.findById(req.user!._id).select('+password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const isPasswordValid = await user.comparePassword(req.body.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      })
    }

    // Delete user's prompts
    await Prompt.deleteMany({ author: user._id })

    // Delete user account
    await User.findByIdAndDelete(user._id)

    res.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user account:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get user activity
router.get('/activity', authMiddleware, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('type').optional().isIn(['created', 'updated', 'shared', 'forked']).withMessage('Invalid activity type')
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

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    // This would typically come from an Activity model
    // For now, we'll return a placeholder response
    const activities = []

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user activity:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router