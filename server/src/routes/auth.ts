import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { sendEmail } from '../services/email'

const router = Router()

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]

// Register
router.post('/register', registerValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password, name } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      status: 'pending',
      emailVerified: false
    })

    await user.save()

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken()
    await user.save()

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email - AI Prompts Generator',
        template: 'email-verification',
        data: {
          name,
          verificationLink: `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
        }
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    // Generate tokens
    const authToken = user.generateAuthToken()
    const refreshToken = user.generateRefreshToken()

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          preferences: user.preferences,
          subscription: user.subscription
        },
        tokens: {
          authToken,
          refreshToken
        }
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    })
  }
})

// Login
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended. Please contact support.'
      })
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please verify your email.'
      })
    }

    // Update last login
    await user.updateLastLogin()

    // Generate tokens
    const authToken = user.generateAuthToken()
    const refreshToken = user.generateRefreshToken()

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          preferences: user.preferences,
          subscription: user.subscription,
          usage: user.usage,
          limits: user.limits,
          lastLogin: user.lastLogin
        },
        tokens: {
          authToken,
          refreshToken
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    })
  }
})

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
    const user = await User.findById(decoded.userId)

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    const authToken = user.generateAuthToken()
    const newRefreshToken = user.generateRefreshToken()

    res.json({
      success: true,
      data: {
        tokens: {
          authToken,
          refreshToken: newRefreshToken
        }
      }
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }
})

// Get current user profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
    
    res.json({
      success: true,
      data: {
        user: {
          id: user!._id,
          email: user!.email,
          name: user!.name,
          avatar: user!.avatar,
          role: user!.role,
          status: user!.status,
          emailVerified: user!.emailVerified,
          preferences: user!.preferences,
          subscription: user!.subscription,
          usage: user!.usage,
          limits: user!.limits,
          social: user!.social,
          createdAt: user!.createdAt,
          updatedAt: user!.updatedAt
        }
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Update profile
router.put('/profile', authMiddleware, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('avatar').optional().isURL(),
  body('preferences.theme').optional().isIn(['light', 'dark', 'system']),
  body('preferences.language').optional().isLength({ min: 2 }),
  body('social.github').optional().isURL(),
  body('social.twitter').optional().isURL(),
  body('social.linkedin').optional().isURL(),
  body('social.website').optional().isURL()
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
    )

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user!._id,
          email: user!.email,
          name: user!.name,
          avatar: user!.avatar,
          role: user!.role,
          status: user!.status,
          emailVerified: user!.emailVerified,
          preferences: user!.preferences,
          subscription: user!.subscription,
          usage: user!.usage,
          limits: user!.limits,
          social: user!.social,
          updatedAt: user!.updatedAt
        }
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Verify email
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      })
    }

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as any
    
    if (decoded.type !== 'email-verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      })
    }

    user.emailVerified = true
    user.status = 'active'
    user.emailVerificationToken = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      })
    }

    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    const resetToken = user.generatePasswordResetToken()
    await user.save()

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset - AI Prompts Generator',
        template: 'password-reset',
        data: {
          name: user.name,
          resetLink: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
        }
      })
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Valid token and password (min 8 characters) are required'
      })
    }

    const { token, password } = req.body

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      })
    }

    const user = await User.findById(decoded.userId).select('+passwordResetToken +passwordResetExpires')
    if (!user || user.passwordResetToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    if (user.passwordResetExpires! < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      })
    }

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router