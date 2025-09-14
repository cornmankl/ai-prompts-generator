import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    emailVerified: boolean;
    emailVerificationToken?: string;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    lastLogin?: Date;
    preferences: {
        theme: 'light' | 'dark' | 'system';
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        ai: {
            defaultModel: string;
            temperature: number;
            maxTokens: number;
            systemPrompt?: string;
        };
        privacy: {
            profileVisibility: 'public' | 'private' | 'friends';
            showEmail: boolean;
            showActivity: boolean;
        };
    };
    subscription: {
        plan: 'free' | 'pro' | 'enterprise';
        status: 'active' | 'cancelled' | 'expired' | 'trial';
        startDate: Date;
        endDate?: Date;
        autoRenew: boolean;
        features: string[];
    };
    usage: {
        totalTokensUsed: number;
        totalCost: number;
        monthlyTokensUsed: number;
        monthlyCost: number;
        lastResetDate: Date;
        apiCalls: number;
        lastAIActivity?: Date;
    };
    social: {
        github?: string;
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
    security: {
        lastPasswordChange: Date;
        suspiciousActivity: Array<{
            type: string;
            timestamp: Date;
            ip: string;
            userAgent: string;
            resolved: boolean;
        }>;
        trustedDevices: Array<{
            deviceId: string;
            name: string;
            lastUsed: Date;
            ip: string;
            userAgent: string;
        }>;
    };
    analytics: {
        totalPrompts: number;
        totalResponses: number;
        averageResponseTime: number;
        favoriteModels: string[];
        mostUsedCategories: string[];
        lastAnalyticsUpdate: Date;
    };
    workspace: {
        currentWorkspaceId?: string;
        workspaces: Array<{
            id: string;
            name: string;
            role: 'owner' | 'admin' | 'member' | 'viewer';
            joinedAt: Date;
        }>;
    };
    apiKeys: Array<{
        id: string;
        name: string;
        key: string;
        permissions: string[];
        lastUsed?: Date;
        createdAt: Date;
        expiresAt?: Date;
    }>;
    billing: {
        customerId?: string;
        subscriptionId?: string;
        paymentMethod?: string;
        billingAddress?: {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        invoices: Array<{
            id: string;
            amount: number;
            currency: string;
            status: 'paid' | 'pending' | 'failed';
            date: Date;
            downloadUrl?: string;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
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
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    avatar: {
        type: String,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: null,
        select: false
    },
    passwordResetToken: {
        type: String,
        default: null,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: {
        type: Date,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
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
        ai: {
            defaultModel: {
                type: String,
                default: 'gpt-4o-mini'
            },
            temperature: {
                type: Number,
                default: 0.7,
                min: 0,
                max: 2
            },
            maxTokens: {
                type: Number,
                default: 2000
            },
            systemPrompt: {
                type: String,
                default: null
            }
        },
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'private', 'friends'],
                default: 'private'
            },
            showEmail: {
                type: Boolean,
                default: false
            },
            showActivity: {
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
            default: null
        },
        autoRenew: {
            type: Boolean,
            default: true
        },
        features: [{
            type: String
        }]
    },
    usage: {
        totalTokensUsed: {
            type: Number,
            default: 0
        },
        totalCost: {
            type: Number,
            default: 0
        },
        monthlyTokensUsed: {
            type: Number,
            default: 0
        },
        monthlyCost: {
            type: Number,
            default: 0
        },
        lastResetDate: {
            type: Date,
            default: Date.now
        },
        apiCalls: {
            type: Number,
            default: 0
        },
        lastAIActivity: {
            type: Date,
            default: null
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
    security: {
        lastPasswordChange: {
            type: Date,
            default: Date.now
        },
        suspiciousActivity: [{
            type: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            ip: {
                type: String,
                required: true
            },
            userAgent: {
                type: String,
                required: true
            },
            resolved: {
                type: Boolean,
                default: false
            }
        }],
        trustedDevices: [{
            deviceId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            lastUsed: {
                type: Date,
                default: Date.now
            },
            ip: {
                type: String,
                required: true
            },
            userAgent: {
                type: String,
                required: true
            }
        }]
    },
    analytics: {
        totalPrompts: {
            type: Number,
            default: 0
        },
        totalResponses: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number,
            default: 0
        },
        favoriteModels: [{
            type: String
        }],
        mostUsedCategories: [{
            type: String
        }],
        lastAnalyticsUpdate: {
            type: Date,
            default: Date.now
        }
    },
    workspace: {
        currentWorkspaceId: {
            type: String,
            default: null
        },
        workspaces: [{
            id: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'member', 'viewer'],
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    apiKeys: [{
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        key: {
            type: String,
            required: true,
            select: false
        },
        permissions: [{
            type: String
        }],
        lastUsed: {
            type: Date,
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            default: null
        }
    }],
    billing: {
        customerId: {
            type: String,
            default: null
        },
        subscriptionId: {
            type: String,
            default: null
        },
        paymentMethod: {
            type: String,
            default: null
        },
        billingAddress: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        },
        invoices: [{
            id: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            currency: {
                type: String,
                default: 'USD'
            },
            status: {
                type: String,
                enum: ['paid', 'pending', 'failed'],
                required: true
            },
            date: {
                type: Date,
                required: true
            },
            downloadUrl: String
        }]
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.twoFactorSecret;
            delete ret.passwordResetToken;
            delete ret.emailVerificationToken;
            return ret;
        }
    }
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'subscription.plan': 1 });
UserSchema.index({ 'subscription.status': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
});

// Virtual for subscription status
UserSchema.virtual('isSubscriptionActive').get(function () {
    return this.subscription.status === 'active' ||
        (this.subscription.status === 'trial' && this.subscription.endDate && this.subscription.endDate > new Date());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can use a feature
UserSchema.methods.canUseFeature = function (feature: string): boolean {
    const planFeatures = {
        free: ['basic_prompts', 'basic_models', 'limited_usage'],
        pro: ['basic_prompts', 'basic_models', 'limited_usage', 'advanced_prompts', 'all_models', 'priority_support', 'analytics'],
        enterprise: ['basic_prompts', 'basic_models', 'limited_usage', 'advanced_prompts', 'all_models', 'priority_support', 'analytics', 'custom_models', 'api_access', 'white_label', 'sso']
    };

    return planFeatures[this.subscription.plan]?.includes(feature) || false;
};

// Method to check usage limits
UserSchema.methods.checkUsageLimit = function (): { canUse: boolean; limit: number; used: number } {
    const limits = {
        free: { tokens: 10000, apiCalls: 100 },
        pro: { tokens: 100000, apiCalls: 1000 },
        enterprise: { tokens: 1000000, apiCalls: 10000 }
    };

    const limit = limits[this.subscription.plan];
    const used = this.usage.monthlyTokensUsed;

    return {
        canUse: used < limit.tokens,
        limit: limit.tokens,
        used
    };
};

// Method to add suspicious activity
UserSchema.methods.addSuspiciousActivity = function (type: string, ip: string, userAgent: string) {
    this.security.suspiciousActivity.push({
        type,
        timestamp: new Date(),
        ip,
        userAgent,
        resolved: false
    });

    // Keep only last 50 activities
    if (this.security.suspiciousActivity.length > 50) {
        this.security.suspiciousActivity = this.security.suspiciousActivity.slice(-50);
    }
};

// Method to add trusted device
UserSchema.methods.addTrustedDevice = function (deviceId: string, name: string, ip: string, userAgent: string) {
    const existingDevice = this.security.trustedDevices.find((device: any) => device.deviceId === deviceId);

    if (existingDevice) {
        existingDevice.lastUsed = new Date();
        existingDevice.ip = ip;
        existingDevice.userAgent = userAgent;
    } else {
        this.security.trustedDevices.push({
            deviceId,
            name,
            lastUsed: new Date(),
            ip,
            userAgent
        });
    }

    // Keep only last 10 devices
    if (this.security.trustedDevices.length > 10) {
        this.security.trustedDevices = this.security.trustedDevices.slice(-10);
    }
};

// Method to generate API key
UserSchema.methods.generateApiKey = function (name: string, permissions: string[]): string {
    const crypto = require('crypto');
    const key = crypto.randomBytes(32).toString('hex');

    this.apiKeys.push({
        id: crypto.randomUUID(),
        name,
        key,
        permissions,
        createdAt: new Date()
    });

    return key;
};

// Method to revoke API key
UserSchema.methods.revokeApiKey = function (keyId: string): boolean {
    const keyIndex = this.apiKeys.findIndex((key: any) => key.id === keyId);
    if (keyIndex !== -1) {
        this.apiKeys.splice(keyIndex, 1);
        return true;
    }
    return false;
};

// Method to update analytics
UserSchema.methods.updateAnalytics = function (model: string, category: string, responseTime: number) {
    this.analytics.totalPrompts += 1;
    this.analytics.totalResponses += 1;
    this.analytics.averageResponseTime =
        (this.analytics.averageResponseTime * (this.analytics.totalResponses - 1) + responseTime) / this.analytics.totalResponses;

    // Update favorite models
    if (!this.analytics.favoriteModels.includes(model)) {
        this.analytics.favoriteModels.push(model);
    }

    // Update most used categories
    if (!this.analytics.mostUsedCategories.includes(category)) {
        this.analytics.mostUsedCategories.push(category);
    }

    this.analytics.lastAnalyticsUpdate = new Date();
};

// Method to reset monthly usage
UserSchema.methods.resetMonthlyUsage = function () {
    this.usage.monthlyTokensUsed = 0;
    this.usage.monthlyCost = 0;
    this.usage.lastResetDate = new Date();
};

// Static method to find by email or username
UserSchema.statics.findByEmailOrUsername = function (identifier: string) {
    return this.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier }
        ]
    });
};

// Static method to find active users
UserSchema.statics.findActiveUsers = function (days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.find({
        lastLogin: { $gte: date }
    });
};

// Static method to find users by subscription
UserSchema.statics.findBySubscription = function (plan: string, status: string) {
    return this.find({
        'subscription.plan': plan,
        'subscription.status': status
    });
};

export const User = mongoose.model<IUser>('User', UserSchema);