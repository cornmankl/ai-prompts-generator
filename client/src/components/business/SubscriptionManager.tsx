import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Crown,
    Star,
    Zap,
    Shield,
    Check,
    X,
    ArrowRight,
    CreditCard,
    Calendar,
    Users,
    BarChart3,
    Settings,
    Download,
    Upload,
    Globe,
    Lock,
    Unlock,
    Gift,
    Award,
    Trophy,
    Diamond,
    Sparkles,
    Rocket,
    Target,
    TrendingUp,
    Clock,
    Infinity,
    CheckCircle,
    AlertCircle,
    Info,
    ExternalLink,
    RefreshCw,
    Play,
    Pause,
    Square,
    RotateCcw,
    Maximize,
    Minimize,
    Layers,
    Code,
    Database,
    Network,
    Shield as ShieldIcon,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    Key,
    Fingerprint,
    QrCode,
    Barcode,
    CreditCard as CreditCardIcon,
    DollarSign,
    Euro,
    PoundSterling,
    Yen,
    Bitcoin,
    TrendingUp as TrendingUpIcon,
    TrendingDown,
    BarChart,
    PieChart,
    LineChart,
    AreaChart,
    Scatter,
    Radar,
    Gauge
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../common/EnhancedToast'

interface SubscriptionPlan {
    id: string
    name: string
    description: string
    price: number
    currency: string
    interval: 'month' | 'year'
    features: string[]
    limits: {
        prompts: number
        tokens: number
        apiCalls: number
        teamMembers: number
        storage: number
        priority: boolean
    }
    popular?: boolean
    recommended?: boolean
    color: string
    icon: React.ComponentType<{ className?: string }>
}

interface Subscription {
    id: string
    plan: string
    status: 'active' | 'cancelled' | 'expired' | 'trial'
    startDate: Date
    endDate: Date
    autoRenew: boolean
    paymentMethod: string
    nextBilling: Date
}

const SubscriptionManager: React.FC = () => {
    const { user } = useAuth()
    const { success, error, info } = useToast()
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [showBilling, setShowBilling] = useState(false)
    const [showUsage, setShowUsage] = useState(false)

    const plans: SubscriptionPlan[] = [
        {
            id: 'free',
            name: 'Free',
            description: 'Perfect for getting started with AI prompts',
            price: 0,
            currency: 'USD',
            interval: 'month',
            features: [
                '100 prompts per day',
                '10,000 tokens per month',
                'Basic AI models',
                'Community support',
                'Public prompt library access',
                'Basic analytics'
            ],
            limits: {
                prompts: 100,
                tokens: 10000,
                apiCalls: 1000,
                teamMembers: 1,
                storage: 100,
                priority: false
            },
            color: 'gray',
            icon: Gift
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'Advanced features for power users',
            price: 29,
            currency: 'USD',
            interval: 'month',
            features: [
                'Unlimited prompts',
                '100,000 tokens per month',
                'All AI models (GLM-4.5, QWEN, etc.)',
                'Priority support',
                'Private prompt library',
                'Advanced analytics',
                'Team collaboration',
                'API access',
                'Custom templates',
                'Export/Import features'
            ],
            limits: {
                prompts: -1,
                tokens: 100000,
                apiCalls: 10000,
                teamMembers: 5,
                storage: 1000,
                priority: true
            },
            popular: true,
            color: 'blue',
            icon: Crown
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Complete solution for organizations',
            price: 99,
            currency: 'USD',
            interval: 'month',
            features: [
                'Everything in Pro',
                'Unlimited tokens',
                'Custom AI model training',
                'Dedicated support',
                'SSO integration',
                'Advanced security',
                'Custom integrations',
                'White-label options',
                'On-premise deployment',
                'SLA guarantee',
                'Custom billing',
                'Dedicated account manager'
            ],
            limits: {
                prompts: -1,
                tokens: -1,
                apiCalls: -1,
                teamMembers: -1,
                storage: -1,
                priority: true
            },
            recommended: true,
            color: 'purple',
            icon: Diamond
        }
    ]

    useEffect(() => {
        loadSubscription()
    }, [])

    const loadSubscription = async () => {
        setIsLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Mock subscription data
            const mockSubscription: Subscription = {
                id: 'sub_123',
                plan: 'pro',
                status: 'active',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-02-01'),
                autoRenew: true,
                paymentMethod: 'card_****1234',
                nextBilling: new Date('2024-02-01')
            }

            setSubscription(mockSubscription)
        } catch (err) {
            error('Failed to load subscription', 'Please try again later')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpgrade = async (planId: string) => {
        setSelectedPlan(planId)
        setIsLoading(true)

        try {
            // Simulate upgrade process
            await new Promise(resolve => setTimeout(resolve, 2000))

            success('Subscription Updated', `Successfully upgraded to ${plans.find(p => p.id === planId)?.name} plan`)
            setShowBilling(false)
        } catch (err) {
            error('Upgrade Failed', 'Please try again later')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) return

        setIsLoading(true)
        try {
            // Simulate cancellation
            await new Promise(resolve => setTimeout(resolve, 1000))

            success('Subscription Cancelled', 'Your subscription has been cancelled')
            setSubscription(null)
        } catch (err) {
            error('Cancellation Failed', 'Please try again later')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRenew = async () => {
        setIsLoading(true)
        try {
            // Simulate renewal
            await new Promise(resolve => setTimeout(resolve, 1000))

            success('Subscription Renewed', 'Your subscription has been renewed')
        } catch (err) {
            error('Renewal Failed', 'Please try again later')
        } finally {
            setIsLoading(false)
        }
    }

    const getCurrentPlan = () => {
        if (!subscription) return plans[0] // Free plan
        return plans.find(p => p.id === subscription.plan) || plans[0]
    }

    const getUsagePercentage = (type: 'prompts' | 'tokens' | 'apiCalls') => {
        const currentPlan = getCurrentPlan()
        const limit = currentPlan.limits[type]
        if (limit === -1) return 0 // Unlimited

        // Mock usage data
        const usage = {
            prompts: 45,
            tokens: 25000,
            apiCalls: 500
        }

        return Math.min((usage[type] / limit) * 100, 100)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Subscription Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your subscription and billing preferences
                    </p>
                </div>

                {/* Current Subscription */}
                {subscription && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                    <Crown className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{getCurrentPlan().name} Plan</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {subscription.status === 'active' ? 'Active' : 'Inactive'} •
                                        Next billing: {subscription.nextBilling.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowBilling(true)}
                                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
                                >
                                    Manage Billing
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Usage Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prompts</span>
                                    <span className="text-sm text-gray-500">
                                        {getCurrentPlan().limits.prompts === -1 ? '∞' : '45 / ' + getCurrentPlan().limits.prompts}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                        className="bg-primary-500 h-2 rounded-full"
                                        style={{ width: `${getUsagePercentage('prompts')}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tokens</span>
                                    <span className="text-sm text-gray-500">
                                        {getCurrentPlan().limits.tokens === -1 ? '∞' : '25K / ' + getCurrentPlan().limits.tokens.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                        className="bg-accent-500 h-2 rounded-full"
                                        style={{ width: `${getUsagePercentage('tokens')}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">API Calls</span>
                                    <span className="text-sm text-gray-500">
                                        {getCurrentPlan().limits.apiCalls === -1 ? '∞' : '500 / ' + getCurrentPlan().limits.apiCalls.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                        className="bg-success-500 h-2 rounded-full"
                                        style={{ width: `${getUsagePercentage('apiCalls')}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Available Plans */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                whileHover={{ scale: 1.02 }}
                                className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${plan.popular
                                        ? 'border-primary-500 shadow-lg'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            Recommended
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <div className={`inline-flex p-3 rounded-lg mb-4 ${plan.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' :
                                            plan.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                                                'bg-purple-100 dark:bg-purple-900'
                                        }`}>
                                        <plan.icon className={`w-8 h-8 ${plan.color === 'gray' ? 'text-gray-600 dark:text-gray-400' :
                                                plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                                    'text-purple-600 dark:text-purple-400'
                                            }`} />
                                    </div>

                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>

                                    <div className="mb-4">
                                        <span className="text-4xl font-bold">${plan.price}</span>
                                        <span className="text-gray-500">/{plan.interval}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={isLoading || (subscription && subscription.plan === plan.id)}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.popular
                                            ? 'bg-primary-500 hover:bg-primary-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isLoading && selectedPlan === plan.id ? (
                                        <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                                    ) : subscription && subscription.plan === plan.id ? (
                                        'Current Plan'
                                    ) : (
                                        'Choose Plan'
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold mb-4">Billing History</h2>
                    <div className="space-y-4">
                        {[
                            { date: '2024-01-01', amount: 29, status: 'paid', invoice: 'INV-001' },
                            { date: '2023-12-01', amount: 29, status: 'paid', invoice: 'INV-002' },
                            { date: '2023-11-01', amount: 29, status: 'paid', invoice: 'INV-003' }
                        ].map((bill, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Pro Plan - {bill.date}</div>
                                        <div className="text-sm text-gray-500">Invoice #{bill.invoice}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">${bill.amount}</div>
                                    <div className="text-sm text-green-600 dark:text-green-400 capitalize">{bill.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SubscriptionManager
