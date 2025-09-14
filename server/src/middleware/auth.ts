import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      })
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.'
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    })
  }
}

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }
  next()
}

export const premiumMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.subscription.plan === 'free' && req.user.subscription.status !== 'active')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Premium subscription required.'
    })
  }
  next()
}

export const rateLimitMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next()
  }

  const { limits, usage } = req.user
  
  // Check daily prompts limit
  if (req.path.includes('/prompts') && req.method === 'POST') {
    if (usage.promptsGenerated >= limits.dailyPrompts) {
      return res.status(429).json({
        success: false,
        message: 'Daily prompt limit exceeded.',
        limit: limits.dailyPrompts,
        used: usage.promptsGenerated
      })
    }
  }

  // Check monthly tokens limit
  if (req.path.includes('/ai/generate')) {
    if (usage.tokensUsed >= limits.monthlyTokens) {
      return res.status(429).json({
        success: false,
        message: 'Monthly token limit exceeded.',
        limit: limits.monthlyTokens,
        used: usage.tokensUsed
      })
    }
  }

  next()
}