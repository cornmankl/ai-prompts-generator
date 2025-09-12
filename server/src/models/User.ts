import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export interface IUser extends Document {
    _id: string
    email: string
    password: string
    name: string
    avatar?: string
    role: 'user' | 'admin' | 'moderator' | 'premium'
    status: 'active' | 'inactive' | 'suspended' | 'pending'
    emailVerified: boolean
    emailVerificationToken?: string
    passwordResetToken?: string
    passwordResetExpires?: Date
    twoFactorEnabled: boolean
    twoFactorSecret?: string
    twoFactorBackupCodes?: string[]
    lastLogin?: Date
    loginCount: number
    preferences: {
        theme: 'light' | 'dark' | 'system'
        language: string
        timezone: string
        notifications: {
            email: boolean
            push: boolean
            sms: boolean
        }
        privacy: {
            profileVisibility: 'public' | 'private' | 'friends'
            showEmail: boolean
            showActivity: boolean
        }
        ai: {
            defaultModel: string
            temperature: number
            maxTokens: number
            enableChainOfThought: boolean
            enableFewShot: boolean
        }
    }
    subscription: {
        plan: 'free' | 'pro' | 'enterprise'
        status: 'active' | 'cancelled' | 'expired' | 'trial'
        startDate?: Date
        endDate?: Date
        autoRenew: boolean
        stripeCustomerId?: string
        stripeSubscriptionId?: string
    }
    usage: {
        promptsGenerated: number
        tokensUsed: number
        apiCalls: number
        lastReset: Date
    }
    limits: {
        dailyPrompts: number
        monthlyTokens: number
        apiCallsPerHour: number
    }
    social: {
        github?: string
        twitter?: string
        linkedin?: string
        website?: string
    }
    teams: mongoose.Types.ObjectId[]
    createdAt: Date
    updatedAt: Date

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>
    generateAuthToken(): string
    generateRefreshToken(): string
    generateEmailVerificationToken(): string
    generatePasswordResetToken(): string
    updateLastLogin(): Promise<void>
    incrementUsage(type: 'prompts' | 'tokens' | 'apiCalls', amount?: number): Promise<void>
    checkUsageLimit(type: 'prompts' | 'tokens' | 'apiCalls'): boolean
    resetUsage(): Promise<void>
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator', 'premium'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending'],
        default: 'pending'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    twoFactorBackupCodes: [{
        type: String,
        select: false
    }],
    lastLogin: {
        type: Date,
        default: null
    },
    loginCount: {
        type: Number,
        default: 0
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        },
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'private', 'friends'],
                default: 'public'
            },
            showEmail: {
                type: Boolean,
                default: false
            },
            showActivity: {
                type: Boolean,
                default: true
            }
        },
        ai: {
            defaultModel: {
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
                default: true
            },
            enableFewShot: {
                type: Boolean,
                default: true
            }
        }
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'expired', 'trial'],
            default: 'trial'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
        },
        autoRenew: {
            type: Boolean,
            default: true
        },
        stripeCustomerId: {
            type: String,
            default: null
        },
        stripeSubscriptionId: {
            type: String,
            default: null
        }
    },
    usage: {
        promptsGenerated: {
            type: Number,
            default: 0
        },
        tokensUsed: {
            type: Number,
            default: 0
        },
        apiCalls: {
            type: Number,
            default: 0
        },
        lastReset: {
            type: Date,
            default: Date.now
        }
    },
    limits: {
        dailyPrompts: {
            type: Number,
            default: 100
        },
        monthlyTokens: {
            type: Number,
            default: 100000
        },
        apiCallsPerHour: {
            type: Number,
            default: 1000
        }
    },
    social: {
        github: {
            type: String,
            default: null
        },
        twitter: {
            type: String,
            default: null
        },
        linkedin: {
            type: String,
            default: null
        },
        website: {
            type: String,
            default: null
        }
    },
    teams: [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Indexes
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ status: 1 })
UserSchema.index({ 'subscription.plan': 1 })
UserSchema.index({ createdAt: -1 })

// Virtual fields
UserSchema.virtual('isActive').get(function () {
    return this.status === 'active'
})

UserSchema.virtual('isPremium').get(function () {
    return this.subscription.plan !== 'free' && this.subscription.status === 'active'
})

UserSchema.virtual('isTrialExpired').get(function () {
    return this.subscription.status === 'trial' && this.subscription.endDate < new Date()
})

// Pre-save middleware
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    try {
        const salt = await bcrypt.genSalt(12)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error as Error)
    }
})

// Instance methods
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
}

UserSchema.methods.generateAuthToken = function (): string {
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '15m' }
    )
}

UserSchema.methods.generateRefreshToken = function (): string {
    return jwt.sign(
        { userId: this._id },
        process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
        { expiresIn: '7d' }
    )
}

UserSchema.methods.generateEmailVerificationToken = function (): string {
    const token = jwt.sign(
        { userId: this._id, type: 'email-verification' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
    )
    this.emailVerificationToken = token
    return token
}

UserSchema.methods.generatePasswordResetToken = function (): string {
    const token = jwt.sign(
        { userId: this._id, type: 'password-reset' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
    )
    this.passwordResetToken = token
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    return token
}

UserSchema.methods.updateLastLogin = async function (): Promise<void> {
    this.lastLogin = new Date()
    this.loginCount += 1
    await this.save()
}

UserSchema.methods.incrementUsage = async function (
    type: 'prompts' | 'tokens' | 'apiCalls',
    amount: number = 1
): Promise<void> {
    this.usage[type] += amount
    await this.save()
}

UserSchema.methods.checkUsageLimit = function (type: 'prompts' | 'tokens' | 'apiCalls'): boolean {
    const limits = {
        prompts: this.limits.dailyPrompts,
        tokens: this.limits.monthlyTokens,
        apiCalls: this.limits.apiCallsPerHour
    }

    return this.usage[type] < limits[type]
}

UserSchema.methods.resetUsage = async function (): Promise<void> {
    this.usage = {
        promptsGenerated: 0,
        tokensUsed: 0,
        apiCalls: 0,
        lastReset: new Date()
    }
    await this.save()
}

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase() })
}

UserSchema.statics.findByRole = function (role: string) {
    return this.find({ role })
}

UserSchema.statics.findActiveUsers = function () {
    return this.find({ status: 'active' })
}

UserSchema.statics.findPremiumUsers = function () {
    return this.find({
        'subscription.plan': { $ne: 'free' },
        'subscription.status': 'active'
    })
}

export default mongoose.model<IUser>('User', UserSchema)
