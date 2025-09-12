import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    Users,
    Zap,
    Brain,
    Clock,
    Star,
    Plus,
    Settings,
    RefreshCw,
    Download,
    Share2,
    Filter,
    Search,
    Grid,
    List,
    Calendar,
    Target,
    Award,
    Activity
} from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useAuth } from '../../hooks/useAuth'
import { aiOrchestration, FREE_AI_MODELS } from '../../services/aiOrchestration'
import { pluginManager } from '../../services/pluginSystem'

interface DashboardWidget {
    id: string
    title: string
    type: 'chart' | 'metric' | 'list' | 'ai-status' | 'plugin-status'
    data: any
    size: 'small' | 'medium' | 'large'
    position: { x: number; y: number; w: number; h: number }
}

const AdvancedDashboard: React.FC = () => {
    const { analytics, isLoading: analyticsLoading } = useAnalytics()
    const { user } = useAuth()
    const [widgets, setWidgets] = useState<DashboardWidget[]>([])
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

    // Initialize dashboard widgets
    useEffect(() => {
        initializeWidgets()
    }, [analytics])

    const initializeWidgets = () => {
        const defaultWidgets: DashboardWidget[] = [
            {
                id: 'usage-stats',
                title: 'Usage Statistics',
                type: 'metric',
                data: {
                    totalPrompts: analytics.totalPrompts,
                    totalGenerations: analytics.totalGenerations,
                    avgSessionTime: analytics.userEngagement.avgSessionTime
                },
                size: 'medium',
                position: { x: 0, y: 0, w: 2, h: 1 }
            },
            {
                id: 'ai-models-status',
                title: 'AI Models Status',
                type: 'ai-status',
                data: FREE_AI_MODELS,
                size: 'large',
                position: { x: 2, y: 0, w: 2, h: 2 }
            },
            {
                id: 'popular-categories',
                title: 'Popular Categories',
                type: 'chart',
                data: analytics.popularCategories,
                size: 'medium',
                position: { x: 0, y: 1, w: 2, h: 1 }
            },
            {
                id: 'recent-activity',
                title: 'Recent Activity',
                type: 'list',
                data: analytics.recentActivity,
                size: 'medium',
                position: { x: 2, y: 2, w: 2, h: 1 }
            },
            {
                id: 'plugin-status',
                title: 'Plugin Status',
                type: 'plugin-status',
                data: pluginManager.getInstalledPlugins(),
                size: 'medium',
                position: { x: 0, y: 2, w: 2, h: 1 }
            }
        ]
        setWidgets(defaultWidgets)
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsRefreshing(false)
    }

    const handleExport = () => {
        // Export dashboard data
        const data = {
            widgets,
            analytics,
            timestamp: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleShare = () => {
        // Share dashboard
        if (navigator.share) {
            navigator.share({
                title: 'AI Prompts Generator Dashboard',
                text: 'Check out my AI Prompts Generator dashboard!',
                url: window.location.href
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
        }
    }

    const renderWidget = (widget: DashboardWidget) => {
        switch (widget.type) {
            case 'metric':
                return <MetricWidget widget={widget} />
            case 'chart':
                return <ChartWidget widget={widget} />
            case 'list':
                return <ListWidget widget={widget} />
            case 'ai-status':
                return <AIStatusWidget widget={widget} />
            case 'plugin-status':
                return <PluginStatusWidget widget={widget} />
            default:
                return null
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Advanced Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back, {user?.name}! Here's your AI Prompts Generator overview.
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Time Range Selector */}
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    >
                        <option value="24h">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                ? 'bg-white dark:bg-gray-700 shadow-sm'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                ? 'bg-white dark:bg-gray-700 shadow-sm'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={handleExport}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleShare}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickActionCard
                    icon={Plus}
                    title="New Prompt"
                    description="Create a new AI prompt"
                    onClick={() => console.log('New prompt')}
                    color="primary"
                />
                <QuickActionCard
                    icon={Brain}
                    title="AI Optimization"
                    description="Optimize existing prompts"
                    onClick={() => console.log('AI optimization')}
                    color="accent"
                />
                <QuickActionCard
                    icon={Users}
                    title="Collaborate"
                    description="Start team collaboration"
                    onClick={() => console.log('Collaborate')}
                    color="success"
                />
                <QuickActionCard
                    icon={Settings}
                    title="Settings"
                    description="Configure your workspace"
                    onClick={() => console.log('Settings')}
                    color="warning"
                />
            </div>

            {/* Dashboard Widgets */}
            <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                <AnimatePresence>
                    {widgets.map((widget) => (
                        <motion.div
                            key={widget.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-neural p-6 ${widget.size === 'large' ? 'md:col-span-2' : ''
                                }`}
                        >
                            {renderWidget(widget)}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Widget Components
const MetricWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
    const { data } = widget

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">{data.totalPrompts}</div>
                    <div className="text-sm text-gray-500">Total Prompts</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-accent-500">{data.totalGenerations}</div>
                    <div className="text-sm text-gray-500">Generations</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-success-500">{Math.round(data.avgSessionTime)}m</div>
                    <div className="text-sm text-gray-500">Avg Session</div>
                </div>
            </div>
        </div>
    )
}

const ChartWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
    const { data } = widget

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="space-y-2">
                {data.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.category}</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-primary-500 h-2 rounded-full"
                                    style={{ width: `${(item.count / Math.max(...data.map((d: any) => d.count))) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium">{item.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const ListWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
    const { data } = widget

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="space-y-2">
                {data.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.type}</div>
                            <div className="text-xs text-gray-500">{item.action}</div>
                        </div>
                        <div className="text-xs text-gray-400">
                            {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const AIStatusWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
    const { data } = widget

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="grid grid-cols-2 gap-3">
                {data.map((model: any) => (
                    <div key={model.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl">{model.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{model.name}</div>
                            <div className="text-xs text-gray-500">{model.provider}</div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${model.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                    </div>
                ))}
            </div>
        </div>
    )
}

const PluginStatusWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
    const { data } = widget

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="space-y-2">
                {data.map((plugin: any) => (
                    <div key={plugin.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        <div className="text-lg">{plugin.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{plugin.name}</div>
                            <div className="text-xs text-gray-500">{plugin.description}</div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${plugin.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                    </div>
                ))}
            </div>
        </div>
    )
}

const QuickActionCard: React.FC<{
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    onClick: () => void
    color: 'primary' | 'accent' | 'success' | 'warning'
}> = ({ icon: Icon, title, description, onClick, color }) => {
    const colorClasses = {
        primary: 'bg-primary-500 hover:bg-primary-600',
        accent: 'bg-accent-500 hover:bg-accent-600',
        success: 'bg-success-500 hover:bg-success-600',
        warning: 'bg-warning-500 hover:bg-warning-600'
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`${colorClasses[color]} text-white p-4 rounded-xl shadow-lg transition-all duration-200`}
        >
            <Icon className="w-8 h-8 mb-2" />
            <div className="text-left">
                <div className="font-semibold">{title}</div>
                <div className="text-sm opacity-90">{description}</div>
            </div>
        </motion.button>
    )
}

export default AdvancedDashboard
