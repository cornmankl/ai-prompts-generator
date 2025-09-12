import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    Users,
    Zap,
    Clock,
    Star,
    Download,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Target,
    Award,
    Calendar,
    Filter,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Brain,
    Code,
    PenTool
} from 'lucide-react'

interface AnalyticsData {
    overview: {
        totalPrompts: number
        totalGenerations: number
        totalUsers: number
        totalViews: number
        avgRating: number
        successRate: number
    }
    trends: {
        daily: Array<{ date: string; prompts: number; generations: number; users: number }>
        weekly: Array<{ week: string; prompts: number; generations: number; users: number }>
        monthly: Array<{ month: string; prompts: number; generations: number; users: number }>
    }
    topPrompts: Array<{
        id: string
        title: string
        category: string
        views: number
        generations: number
        rating: number
        author: string
    }>
    categories: Array<{
        name: string
        count: number
        growth: number
        color: string
    }>
    performance: {
        avgGenerationTime: number
        avgPromptLength: number
        mostUsedModel: string
        errorRate: number
    }
    userEngagement: {
        activeUsers: number
        newUsers: number
        returningUsers: number
        avgSessionDuration: number
    }
}

const AnalyticsDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
    const [selectedMetric, setSelectedMetric] = useState<'prompts' | 'generations' | 'users'>('prompts')
    const [showDetails, setShowDetails] = useState<string | null>(null)

    // Mock data - in a real app, this would come from an API
    const [data, setData] = useState<AnalyticsData>({
        overview: {
            totalPrompts: 1247,
            totalGenerations: 15623,
            totalUsers: 892,
            totalViews: 45678,
            avgRating: 4.7,
            successRate: 94.2
        },
        trends: {
            daily: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                prompts: Math.floor(Math.random() * 50) + 20,
                generations: Math.floor(Math.random() * 200) + 100,
                users: Math.floor(Math.random() * 30) + 10
            })),
            weekly: Array.from({ length: 12 }, (_, i) => ({
                week: `Week ${i + 1}`,
                prompts: Math.floor(Math.random() * 300) + 150,
                generations: Math.floor(Math.random() * 1200) + 600,
                users: Math.floor(Math.random() * 150) + 50
            })),
            monthly: Array.from({ length: 12 }, (_, i) => ({
                month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
                prompts: Math.floor(Math.random() * 1000) + 500,
                generations: Math.floor(Math.random() * 5000) + 2500,
                users: Math.floor(Math.random() * 500) + 200
            }))
        },
        topPrompts: [
            {
                id: '1',
                title: 'Advanced Code Review Assistant',
                category: 'Code Generation',
                views: 1234,
                generations: 567,
                rating: 4.9,
                author: 'John Doe'
            },
            {
                id: '2',
                title: 'Creative Writing Generator',
                category: 'Creative Writing',
                views: 987,
                generations: 432,
                rating: 4.7,
                author: 'Jane Smith'
            },
            {
                id: '3',
                title: 'Data Analysis Assistant',
                category: 'Analysis',
                views: 876,
                generations: 321,
                rating: 4.8,
                author: 'Mike Johnson'
            }
        ],
        categories: [
            { name: 'Code Generation', count: 456, growth: 12.5, color: '#3B82F6' },
            { name: 'Creative Writing', count: 234, growth: 8.3, color: '#10B981' },
            { name: 'Analysis', count: 198, growth: 15.2, color: '#F59E0B' },
            { name: 'AI Assistants', count: 156, growth: 22.1, color: '#8B5CF6' },
            { name: 'Collaboration', count: 123, growth: 5.7, color: '#EF4444' },
            { name: 'Specialized', count: 80, growth: 18.9, color: '#06B6D4' }
        ],
        performance: {
            avgGenerationTime: 2.3,
            avgPromptLength: 156,
            mostUsedModel: 'GPT-4',
            errorRate: 2.1
        },
        userEngagement: {
            activeUsers: 234,
            newUsers: 45,
            returningUsers: 189,
            avgSessionDuration: 18.5
        }
    })

    const getCurrentTrendData = () => {
        switch (timeRange) {
            case '7d':
                return data.trends.daily.slice(-7)
            case '30d':
                return data.trends.daily
            case '90d':
                return data.trends.weekly.slice(-12)
            case '1y':
                return data.trends.monthly
            default:
                return data.trends.daily
        }
    }

    const getMetricValue = (item: any) => {
        switch (selectedMetric) {
            case 'prompts':
                return item.prompts
            case 'generations':
                return item.generations
            case 'users':
                return item.users
            default:
                return item.prompts
        }
    }

    const getMetricLabel = () => {
        switch (selectedMetric) {
            case 'prompts':
                return 'Prompts Created'
            case 'generations':
                return 'Generations'
            case 'users':
                return 'Active Users'
            default:
                return 'Prompts Created'
        }
    }

    const getMetricIcon = () => {
        switch (selectedMetric) {
            case 'prompts':
                return PenTool
            case 'generations':
                return Zap
            case 'users':
                return Users
            default:
                return PenTool
        }
    }

    const MetricCard: React.FC<{
        title: string
        value: string | number
        change: number
        icon: any
        color: string
        subtitle?: string
    }> = ({ title, value, change, icon: Icon, color, subtitle }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                    {change > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {Math.abs(change)}%
                    </span>
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {title}
                </p>
                {subtitle && (
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    )

    const ChartCard: React.FC<{
        title: string
        children: React.ReactNode
        className?: string
    }> = ({ title, children, className = '' }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-neural ${className}`}
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {title}
            </h3>
            {children}
        </motion.div>
    )

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4"
            >
                <h1 className="text-3xl font-bold gradient-text">
                    Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Track performance, usage patterns, and user engagement
                </p>
            </motion.div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>

                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="prompts">Prompts</option>
                        <option value="generations">Generations</option>
                        <option value="users">Users</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Prompts"
                    value={data.overview.totalPrompts}
                    change={12.5}
                    icon={PenTool}
                    color="bg-primary-500"
                />
                <MetricCard
                    title="Generations"
                    value={data.overview.totalGenerations}
                    change={8.3}
                    icon={Zap}
                    color="bg-accent-500"
                />
                <MetricCard
                    title="Active Users"
                    value={data.overview.totalUsers}
                    change={15.2}
                    icon={Users}
                    color="bg-success-500"
                />
                <MetricCard
                    title="Success Rate"
                    value={`${data.overview.successRate}%`}
                    change={2.1}
                    icon={Target}
                    color="bg-warning-500"
                    subtitle="Avg. rating: 4.7/5"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trends Chart */}
                <ChartCard title={`${getMetricLabel()} Over Time`}>
                    <div className="h-64 flex items-end space-x-1">
                        {getCurrentTrendData().map((item, index) => {
                            const value = getMetricValue(item)
                            const maxValue = Math.max(...getCurrentTrendData().map(getMetricValue))
                            const height = (value / maxValue) * 100

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-t transition-all duration-300 hover:from-primary-600 hover:to-accent-600"
                                        style={{ height: `${height}%` }}
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {timeRange === '7d' || timeRange === '30d'
                                            ? new Date(item.date).getDate()
                                            : timeRange === '90d'
                                                ? item.week.split(' ')[1]
                                                : item.month
                                        }
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </ChartCard>

                {/* Categories Distribution */}
                <ChartCard title="Categories Distribution">
                    <div className="space-y-4">
                        {data.categories.map((category, index) => (
                            <div key={category.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {category.name}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {category.count}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${category.growth > 0
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                            }`}>
                                            {category.growth > 0 ? '+' : ''}{category.growth}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(category.count / Math.max(...data.categories.map(c => c.count))) * 100}%`,
                                            backgroundColor: category.color
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Prompts */}
                <ChartCard title="Top Performing Prompts" className="lg:col-span-2">
                    <div className="space-y-4">
                        {data.topPrompts.map((prompt, index) => (
                            <div key={prompt.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {prompt.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {prompt.category} • {prompt.author}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center space-x-1">
                                        <Eye className="w-4 h-4" />
                                        <span>{prompt.views}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Zap className="w-4 h-4" />
                                        <span>{prompt.generations}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4" />
                                        <span>{prompt.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Performance Metrics */}
                <ChartCard title="Performance Metrics">
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {data.performance.avgGenerationTime}s
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Avg Generation Time
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Prompt Length</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {data.performance.avgPromptLength} chars
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Most Used Model</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {data.performance.mostUsedModel}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {data.performance.errorRate}%
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {data.userEngagement.activeUsers}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Active Users Today
                                </div>
                            </div>
                        </div>
                    </div>
                </ChartCard>
            </div>
        </div>
    )
}

export default AnalyticsDashboard
