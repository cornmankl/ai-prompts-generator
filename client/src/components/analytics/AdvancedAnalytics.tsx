import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    Zap,
    DollarSign,
    Clock,
    Activity,
    Download,
    RefreshCw,
    Filter,
    Calendar,
    Target,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../hooks/useTheme';

interface AnalyticsData {
    totalUsers: number;
    activeUsers: number;
    totalPrompts: number;
    totalResponses: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    popularModels: Array<{
        model: string;
        count: number;
        percentage: number;
    }>;
    popularCategories: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
    usageByDay: Array<{
        date: string;
        prompts: number;
        tokens: number;
        cost: number;
    }>;
    userGrowth: Array<{
        date: string;
        newUsers: number;
        totalUsers: number;
    }>;
    revenue: Array<{
        date: string;
        amount: number;
        currency: string;
    }>;
    errorRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    topFeatures: Array<{
        feature: string;
        usage: number;
        satisfaction: number;
    }>;
}

interface PerformanceMetrics {
    responseTime: {
        average: number;
        p50: number;
        p95: number;
        p99: number;
    };
    errorRate: {
        total: number;
        byModel: Record<string, number>;
        byCategory: Record<string, number>;
    };
    throughput: {
        requestsPerSecond: number;
        tokensPerSecond: number;
        peakLoad: number;
    };
    cache: {
        hitRate: number;
        missRate: number;
        averageCacheTime: number;
    };
    cost: {
        total: number;
        byModel: Record<string, number>;
        byUser: Record<string, number>;
        efficiency: number;
    };
}

interface RealTimeMetrics {
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    topModels: Array<{
        model: string;
        count: number;
        percentage: number;
    }>;
    timestamp: Date;
}

export const AdvancedAnalytics: React.FC = () => {
    const { theme } = useTheme();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
    const [realTime, setRealTime] = useState<RealTimeMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
    const [view, setView] = useState<'overview' | 'performance' | 'realtime'>('overview');
    const [showExportModal, setShowExportModal] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30); // seconds

    // Load analytics data
    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    // Auto-refresh for real-time data
    useEffect(() => {
        if (autoRefresh && view === 'realtime') {
            const interval = setInterval(() => {
                loadRealTimeMetrics();
            }, refreshInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, view]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const [analyticsRes, performanceRes] = await Promise.all([
                fetch(`/api/analytics/overall?timeRange=${timeRange}`),
                fetch(`/api/analytics/performance?timeRange=${timeRange}`)
            ]);

            if (!analyticsRes.ok || !performanceRes.ok) {
                throw new Error('Failed to load analytics data');
            }

            const [analyticsData, performanceData] = await Promise.all([
                analyticsRes.json(),
                performanceRes.json()
            ]);

            setAnalytics(analyticsData.data);
            setPerformance(performanceData.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const loadRealTimeMetrics = async () => {
        try {
            const response = await fetch('/api/analytics/realtime');
            if (response.ok) {
                const data = await response.json();
                setRealTime(data.data);
            }
        } catch (err) {
            console.error('Error loading real-time metrics:', err);
        }
    };

    const exportData = async (format: 'json' | 'csv' | 'pdf') => {
        try {
            const response = await fetch(`/api/analytics/export?format=${format}&timeRange=${timeRange}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error('Error exporting data:', err);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDuration = (ms: number) => {
        if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
        return `${ms}ms`;
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadAnalytics}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comprehensive insights into your AI platform performance
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <Select
                        value={timeRange}
                        onChange={(value) => setTimeRange(value as any)}
                        options={[
                            { value: 'day', label: 'Last 24 Hours' },
                            { value: 'week', label: 'Last 7 Days' },
                            { value: 'month', label: 'Last 30 Days' },
                            { value: 'year', label: 'Last Year' }
                        ]}
                    />

                    <Button
                        variant="outline"
                        onClick={() => setShowExportModal(true)}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>

                    <Button
                        variant="outline"
                        onClick={loadAnalytics}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'performance', label: 'Performance', icon: Zap },
                    { id: 'realtime', label: 'Real-time', icon: Activity }
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setView(id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${view === id
                                ? 'bg-white dark:bg-gray-700 shadow-sm'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {view === 'overview' && analytics && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                    <p className="text-2xl font-bold">{formatNumber(analytics.totalUsers)}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="mt-2">
                                <Badge variant="success">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +12.5%
                                </Badge>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                                    <p className="text-2xl font-bold">{formatNumber(analytics.activeUsers)}</p>
                                </div>
                                <Activity className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="mt-2">
                                <Badge variant="success">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +8.2%
                                </Badge>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prompts</p>
                                    <p className="text-2xl font-bold">{formatNumber(analytics.totalPrompts)}</p>
                                </div>
                                <Target className="w-8 h-8 text-purple-500" />
                            </div>
                            <div className="mt-2">
                                <Badge variant="success">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +15.3%
                                </Badge>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalCost)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-yellow-500" />
                            </div>
                            <div className="mt-2">
                                <Badge variant="warning">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +5.7%
                                </Badge>
                            </div>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Usage Over Time */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <BarChart3 className="w-12 h-12" />
                                <span className="ml-2">Chart placeholder</span>
                            </div>
                        </Card>

                        {/* Popular Models */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Popular Models</h3>
                            <div className="space-y-3">
                                {analytics.popularModels.slice(0, 5).map((model, index) => (
                                    <div key={model.model} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-medium">
                                                {index + 1}
                                            </div>
                                            <span className="font-medium">{model.model}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${model.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatNumber(model.count)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                                    <p className="text-2xl font-bold">{formatDuration(analytics.averageResponseTime)}</p>
                                </div>
                                <Clock className="w-8 h-8 text-blue-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                                    <p className="text-2xl font-bold">{formatPercentage(analytics.errorRate)}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Session Duration</p>
                                    <p className="text-2xl font-bold">{formatDuration(analytics.averageSessionDuration * 1000)}</p>
                                </div>
                                <Activity className="w-8 h-8 text-green-500" />
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Performance Tab */}
            {view === 'performance' && performance && (
                <div className="space-y-6">
                    {/* Response Time Metrics */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Response Time Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{formatDuration(performance.responseTime.average)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{formatDuration(performance.responseTime.p50)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">P50</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{formatDuration(performance.responseTime.p95)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">P95</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{formatDuration(performance.responseTime.p99)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">P99</p>
                            </div>
                        </div>
                    </Card>

                    {/* Throughput Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Requests/sec</p>
                                    <p className="text-2xl font-bold">{performance.throughput.requestsPerSecond.toFixed(1)}</p>
                                </div>
                                <Zap className="w-8 h-8 text-blue-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tokens/sec</p>
                                    <p className="text-2xl font-bold">{formatNumber(performance.throughput.tokensPerSecond)}</p>
                                </div>
                                <Target className="w-8 h-8 text-green-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Peak Load</p>
                                    <p className="text-2xl font-bold">{performance.throughput.peakLoad.toFixed(1)}</p>
                                </div>
                                <Activity className="w-8 h-8 text-yellow-500" />
                            </div>
                        </Card>
                    </div>

                    {/* Cache Performance */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{formatPercentage(performance.cache.hitRate)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{formatPercentage(performance.cache.missRate)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Miss Rate</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{formatDuration(performance.cache.averageCacheTime)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Cache Time</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Real-time Tab */}
            {view === 'realtime' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Real-time Metrics</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Toggle
                                    checked={autoRefresh}
                                    onChange={setAutoRefresh}
                                />
                                <span className="text-sm">Auto-refresh</span>
                            </div>
                            <Select
                                value={refreshInterval.toString()}
                                onChange={(value) => setRefreshInterval(parseInt(value))}
                                options={[
                                    { value: '10', label: '10 seconds' },
                                    { value: '30', label: '30 seconds' },
                                    { value: '60', label: '1 minute' },
                                    { value: '300', label: '5 minutes' }
                                ]}
                            />
                        </div>
                    </div>

                    {realTime ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                                        <p className="text-2xl font-bold">{realTime.activeUsers}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-500" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Requests/min</p>
                                        <p className="text-2xl font-bold">{realTime.requestsPerMinute}</p>
                                    </div>
                                    <Activity className="w-8 h-8 text-green-500" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                                        <p className="text-2xl font-bold">{formatDuration(realTime.averageResponseTime)}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-500" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                                        <p className="text-2xl font-bold">{formatPercentage(realTime.errorRate)}</p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Loading real-time data...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Export Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Export Analytics Data"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose the format for exporting your analytics data:
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <Button
                            onClick={() => exportData('json')}
                            className="justify-start"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export as JSON
                        </Button>

                        <Button
                            onClick={() => exportData('csv')}
                            className="justify-start"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export as CSV
                        </Button>

                        <Button
                            onClick={() => exportData('pdf')}
                            className="justify-start"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export as PDF
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
