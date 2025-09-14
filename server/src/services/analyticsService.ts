import { User } from '../models/User';
import { cacheService } from './cacheService';
import { logger } from './loggerService';
import { aiService } from './aiService';

export interface AnalyticsData {
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

export interface UserAnalytics {
    userId: string;
    totalPrompts: number;
    totalResponses: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    favoriteModels: Array<{
        model: string;
        count: number;
        percentage: number;
    }>;
    mostUsedCategories: Array<{
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
    productivity: {
        promptsPerDay: number;
        averageTokensPerPrompt: number;
        costEfficiency: number;
        responseQuality: number;
    };
    trends: {
        usageGrowth: number;
        costGrowth: number;
        efficiencyImprovement: number;
    };
}

export interface PerformanceMetrics {
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

export class AnalyticsService {
    private readonly CACHE_TTL = 3600; // 1 hour
    private readonly DAILY_RESET_HOUR = 0; // Midnight

    async getOverallAnalytics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsData> {
        const cacheKey = `analytics:overall:${timeRange}`;

        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        try {
            const startDate = this.getStartDate(timeRange);
            const endDate = new Date();

            // Get basic metrics
            const [
                totalUsers,
                activeUsers,
                totalPrompts,
                totalResponses,
                totalTokens,
                totalCost,
                averageResponseTime
            ] = await Promise.all([
                this.getTotalUsers(),
                this.getActiveUsers(startDate),
                this.getTotalPrompts(startDate),
                this.getTotalResponses(startDate),
                this.getTotalTokens(startDate),
                this.getTotalCost(startDate),
                this.getAverageResponseTime(startDate)
            ]);

            // Get detailed analytics
            const [
                popularModels,
                popularCategories,
                usageByDay,
                userGrowth,
                revenue,
                errorRate,
                averageSessionDuration,
                bounceRate,
                topFeatures
            ] = await Promise.all([
                this.getPopularModels(startDate),
                this.getPopularCategories(startDate),
                this.getUsageByDay(startDate, endDate),
                this.getUserGrowth(startDate, endDate),
                this.getRevenue(startDate, endDate),
                this.getErrorRate(startDate),
                this.getAverageSessionDuration(startDate),
                this.getBounceRate(startDate),
                this.getTopFeatures(startDate)
            ]);

            const analytics: AnalyticsData = {
                totalUsers,
                activeUsers,
                totalPrompts,
                totalResponses,
                totalTokens,
                totalCost,
                averageResponseTime,
                popularModels,
                popularCategories,
                usageByDay,
                userGrowth,
                revenue,
                errorRate,
                averageSessionDuration,
                bounceRate,
                topFeatures
            };

            // Cache the result
            await cacheService.set(cacheKey, JSON.stringify(analytics), this.CACHE_TTL);

            return analytics;
        } catch (error) {
            logger.error('Error getting overall analytics:', error);
            throw error;
        }
    }

    async getUserAnalytics(userId: string, timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<UserAnalytics> {
        const cacheKey = `analytics:user:${userId}:${timeRange}`;

        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        try {
            const startDate = this.getStartDate(timeRange);
            const endDate = new Date();

            // Get user metrics
            const [
                totalPrompts,
                totalResponses,
                totalTokens,
                totalCost,
                averageResponseTime,
                favoriteModels,
                mostUsedCategories,
                usageByDay
            ] = await Promise.all([
                this.getUserTotalPrompts(userId, startDate),
                this.getUserTotalResponses(userId, startDate),
                this.getUserTotalTokens(userId, startDate),
                this.getUserTotalCost(userId, startDate),
                this.getUserAverageResponseTime(userId, startDate),
                this.getUserFavoriteModels(userId, startDate),
                this.getUserMostUsedCategories(userId, startDate),
                this.getUserUsageByDay(userId, startDate, endDate)
            ]);

            // Calculate productivity metrics
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const promptsPerDay = totalPrompts / days;
            const averageTokensPerPrompt = totalPrompts > 0 ? totalTokens / totalPrompts : 0;
            const costEfficiency = totalTokens > 0 ? totalCost / totalTokens : 0;
            const responseQuality = this.calculateResponseQuality(userId, startDate);

            // Calculate trends
            const previousPeriod = this.getPreviousPeriod(startDate, timeRange);
            const [
                previousTokens,
                previousCost,
                previousEfficiency
            ] = await Promise.all([
                this.getUserTotalTokens(userId, previousPeriod.start, previousPeriod.end),
                this.getUserTotalCost(userId, previousPeriod.start, previousPeriod.end),
                this.calculateResponseQuality(userId, previousPeriod.start, previousPeriod.end)
            ]);

            const usageGrowth = previousTokens > 0 ? ((totalTokens - previousTokens) / previousTokens) * 100 : 0;
            const costGrowth = previousCost > 0 ? ((totalCost - previousCost) / previousCost) * 100 : 0;
            const efficiencyImprovement = previousEfficiency > 0 ? ((responseQuality - previousEfficiency) / previousEfficiency) * 100 : 0;

            const analytics: UserAnalytics = {
                userId,
                totalPrompts,
                totalResponses,
                totalTokens,
                totalCost,
                averageResponseTime,
                favoriteModels,
                mostUsedCategories,
                usageByDay,
                productivity: {
                    promptsPerDay,
                    averageTokensPerPrompt,
                    costEfficiency,
                    responseQuality
                },
                trends: {
                    usageGrowth,
                    costGrowth,
                    efficiencyImprovement
                }
            };

            // Cache the result
            await cacheService.set(cacheKey, JSON.stringify(analytics), this.CACHE_TTL);

            return analytics;
        } catch (error) {
            logger.error('Error getting user analytics:', error);
            throw error;
        }
    }

    async getPerformanceMetrics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<PerformanceMetrics> {
        const cacheKey = `analytics:performance:${timeRange}`;

        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        try {
            const startDate = this.getStartDate(timeRange);
            const endDate = new Date();

            // Get performance metrics
            const [
                responseTime,
                errorRate,
                throughput,
                cache,
                cost
            ] = await Promise.all([
                this.getResponseTimeMetrics(startDate),
                this.getErrorRateMetrics(startDate),
                this.getThroughputMetrics(startDate),
                this.getCacheMetrics(startDate),
                this.getCostMetrics(startDate)
            ]);

            const metrics: PerformanceMetrics = {
                responseTime,
                errorRate,
                throughput,
                cache,
                cost
            };

            // Cache the result
            await cacheService.set(cacheKey, JSON.stringify(metrics), this.CACHE_TTL);

            return metrics;
        } catch (error) {
            logger.error('Error getting performance metrics:', error);
            throw error;
        }
    }

    async trackEvent(userId: string, event: string, properties: Record<string, any> = {}): Promise<void> {
        try {
            const eventData = {
                userId,
                event,
                properties,
                timestamp: new Date(),
                sessionId: properties.sessionId || crypto.randomUUID()
            };

            // Store in cache for real-time analytics
            await cacheService.set(
                `event:${userId}:${Date.now()}`,
                JSON.stringify(eventData),
                24 * 60 * 60 // 24 hours
            );

            // Update user analytics
            await this.updateUserAnalytics(userId, event, properties);

            logger.info(`Event tracked: ${event} for user ${userId}`);
        } catch (error) {
            logger.error('Error tracking event:', error);
        }
    }

    async getRealTimeMetrics(): Promise<Record<string, any>> {
        try {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

            const [
                activeUsers,
                requestsPerMinute,
                averageResponseTime,
                errorRate,
                topModels
            ] = await Promise.all([
                this.getActiveUsers(oneHourAgo),
                this.getRequestsPerMinute(oneHourAgo),
                this.getAverageResponseTime(oneHourAgo),
                this.getErrorRate(oneHourAgo),
                this.getPopularModels(oneHourAgo)
            ]);

            return {
                activeUsers,
                requestsPerMinute,
                averageResponseTime,
                errorRate,
                topModels: topModels.slice(0, 5),
                timestamp: now
            };
        } catch (error) {
            logger.error('Error getting real-time metrics:', error);
            throw error;
        }
    }

    async generateReport(type: 'daily' | 'weekly' | 'monthly', userId?: string): Promise<Record<string, any>> {
        try {
            const timeRange = type === 'daily' ? 'day' : type === 'weekly' ? 'week' : 'month';

            let analytics: any;
            if (userId) {
                analytics = await this.getUserAnalytics(userId, timeRange);
            } else {
                analytics = await this.getOverallAnalytics(timeRange);
            }

            const performance = await this.getPerformanceMetrics(timeRange);
            const realTime = await this.getRealTimeMetrics();

            const report = {
                type,
                period: timeRange,
                generatedAt: new Date(),
                analytics,
                performance,
                realTime,
                insights: this.generateInsights(analytics, performance)
            };

            // Store report
            const reportId = crypto.randomUUID();
            await cacheService.set(
                `report:${reportId}`,
                JSON.stringify(report),
                7 * 24 * 60 * 60 // 7 days
            );

            return report;
        } catch (error) {
            logger.error('Error generating report:', error);
            throw error;
        }
    }

    // Private helper methods
    private getStartDate(timeRange: string): Date {
        const now = new Date();
        switch (timeRange) {
            case 'day':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case 'week':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'month':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case 'year':
                return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    }

    private getPreviousPeriod(startDate: Date, timeRange: string): { start: Date; end: Date } {
        const duration = startDate.getTime() - this.getStartDate(timeRange).getTime();
        return {
            start: new Date(startDate.getTime() - duration),
            end: startDate
        };
    }

    private async getTotalUsers(): Promise<number> {
        return User.countDocuments();
    }

    private async getActiveUsers(since: Date): Promise<number> {
        return User.countDocuments({
            lastLogin: { $gte: since }
        });
    }

    private async getTotalPrompts(since: Date): Promise<number> {
        const result = await User.aggregate([
            { $match: { lastAIActivity: { $gte: since } } },
            { $group: { _id: null, total: { $sum: '$analytics.totalPrompts' } } }
        ]);
        return result[0]?.total || 0;
    }

    private async getTotalResponses(since: Date): Promise<number> {
        const result = await User.aggregate([
            { $match: { lastAIActivity: { $gte: since } } },
            { $group: { _id: null, total: { $sum: '$analytics.totalResponses' } } }
        ]);
        return result[0]?.total || 0;
    }

    private async getTotalTokens(since: Date): Promise<number> {
        const result = await User.aggregate([
            { $match: { lastAIActivity: { $gte: since } } },
            { $group: { _id: null, total: { $sum: '$usage.totalTokensUsed' } } }
        ]);
        return result[0]?.total || 0;
    }

    private async getTotalCost(since: Date): Promise<number> {
        const result = await User.aggregate([
            { $match: { lastAIActivity: { $gte: since } } },
            { $group: { _id: null, total: { $sum: '$usage.totalCost' } } }
        ]);
        return result[0]?.total || 0;
    }

    private async getAverageResponseTime(since: Date): Promise<number> {
        const result = await User.aggregate([
            { $match: { lastAIActivity: { $gte: since } } },
            { $group: { _id: null, average: { $avg: '$analytics.averageResponseTime' } } }
        ]);
        return result[0]?.average || 0;
    }

    private async getPopularModels(since: Date): Promise<Array<{ model: string; count: number; percentage: number }>> {
        // This would typically come from a separate analytics collection
        // For now, return mock data
        return [
            { model: 'gpt-4o', count: 1000, percentage: 40 },
            { model: 'gpt-4o-mini', count: 800, percentage: 32 },
            { model: 'claude-3-5-sonnet', count: 500, percentage: 20 },
            { model: 'gemini-1.5-pro', count: 200, percentage: 8 }
        ];
    }

    private async getPopularCategories(since: Date): Promise<Array<{ category: string; count: number; percentage: number }>> {
        // This would typically come from a separate analytics collection
        return [
            { category: 'general', count: 1200, percentage: 48 },
            { category: 'code', count: 800, percentage: 32 },
            { category: 'creative', count: 300, percentage: 12 },
            { category: 'analysis', count: 200, percentage: 8 }
        ];
    }

    private async getUsageByDay(startDate: Date, endDate: Date): Promise<Array<{ date: string; prompts: number; tokens: number; cost: number }>> {
        // This would typically come from a separate analytics collection
        const days = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            days.push({
                date: current.toISOString().split('T')[0],
                prompts: Math.floor(Math.random() * 100),
                tokens: Math.floor(Math.random() * 10000),
                cost: Math.random() * 10
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    }

    private async getUserGrowth(startDate: Date, endDate: Date): Promise<Array<{ date: string; newUsers: number; totalUsers: number }>> {
        // This would typically come from a separate analytics collection
        const days = [];
        const current = new Date(startDate);
        let totalUsers = 0;

        while (current <= endDate) {
            const newUsers = Math.floor(Math.random() * 10);
            totalUsers += newUsers;
            days.push({
                date: current.toISOString().split('T')[0],
                newUsers,
                totalUsers
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    }

    private async getRevenue(startDate: Date, endDate: Date): Promise<Array<{ date: string; amount: number; currency: string }>> {
        // This would typically come from a separate analytics collection
        const days = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            days.push({
                date: current.toISOString().split('T')[0],
                amount: Math.random() * 1000,
                currency: 'USD'
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    }

    private async getErrorRate(since: Date): Promise<number> {
        // This would typically come from a separate analytics collection
        return Math.random() * 0.05; // 0-5% error rate
    }

    private async getAverageSessionDuration(since: Date): Promise<number> {
        // This would typically come from a separate analytics collection
        return Math.random() * 1800; // 0-30 minutes in seconds
    }

    private async getBounceRate(since: Date): Promise<number> {
        // This would typically come from a separate analytics collection
        return Math.random() * 0.3; // 0-30% bounce rate
    }

    private async getTopFeatures(since: Date): Promise<Array<{ feature: string; usage: number; satisfaction: number }>> {
        // This would typically come from a separate analytics collection
        return [
            { feature: 'AI Chat', usage: 1000, satisfaction: 4.5 },
            { feature: 'Prompt Templates', usage: 800, satisfaction: 4.2 },
            { feature: 'Model Comparison', usage: 600, satisfaction: 4.0 },
            { feature: 'Analytics', usage: 400, satisfaction: 3.8 }
        ];
    }

    // User-specific methods
    private async getUserTotalPrompts(userId: string, since: Date): Promise<number> {
        const user = await User.findById(userId);
        return user?.analytics.totalPrompts || 0;
    }

    private async getUserTotalResponses(userId: string, since: Date): Promise<number> {
        const user = await User.findById(userId);
        return user?.analytics.totalResponses || 0;
    }

    private async getUserTotalTokens(userId: string, since: Date): Promise<number> {
        const user = await User.findById(userId);
        return user?.usage.totalTokensUsed || 0;
    }

    private async getUserTotalCost(userId: string, since: Date): Promise<number> {
        const user = await User.findById(userId);
        return user?.usage.totalCost || 0;
    }

    private async getUserAverageResponseTime(userId: string, since: Date): Promise<number> {
        const user = await User.findById(userId);
        return user?.analytics.averageResponseTime || 0;
    }

    private async getUserFavoriteModels(userId: string, since: Date): Promise<Array<{ model: string; count: number; percentage: number }>> {
        const user = await User.findById(userId);
        const models = user?.analytics.favoriteModels || [];

        return models.map(model => ({
            model,
            count: Math.floor(Math.random() * 100),
            percentage: Math.random() * 100
        }));
    }

    private async getUserMostUsedCategories(userId: string, since: Date): Promise<Array<{ category: string; count: number; percentage: number }>> {
        const user = await User.findById(userId);
        const categories = user?.analytics.mostUsedCategories || [];

        return categories.map(category => ({
            category,
            count: Math.floor(Math.random() * 50),
            percentage: Math.random() * 100
        }));
    }

    private async getUserUsageByDay(userId: string, startDate: Date, endDate: Date): Promise<Array<{ date: string; prompts: number; tokens: number; cost: number }>> {
        // This would typically come from a separate analytics collection
        const days = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            days.push({
                date: current.toISOString().split('T')[0],
                prompts: Math.floor(Math.random() * 20),
                tokens: Math.floor(Math.random() * 2000),
                cost: Math.random() * 2
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    }

    private calculateResponseQuality(userId: string, startDate: Date, endDate?: Date): number {
        // This would typically be calculated based on user feedback, response relevance, etc.
        return Math.random() * 5; // 0-5 rating
    }

    private async updateUserAnalytics(userId: string, event: string, properties: Record<string, any>): Promise<void> {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            // Update analytics based on event
            switch (event) {
                case 'prompt_sent':
                    user.analytics.totalPrompts += 1;
                    break;
                case 'response_received':
                    user.analytics.totalResponses += 1;
                    if (properties.responseTime) {
                        user.analytics.averageResponseTime =
                            (user.analytics.averageResponseTime * (user.analytics.totalResponses - 1) + properties.responseTime) / user.analytics.totalResponses;
                    }
                    break;
                case 'model_used':
                    if (properties.model) {
                        if (!user.analytics.favoriteModels.includes(properties.model)) {
                            user.analytics.favoriteModels.push(properties.model);
                        }
                    }
                    break;
                case 'category_used':
                    if (properties.category) {
                        if (!user.analytics.mostUsedCategories.includes(properties.category)) {
                            user.analytics.mostUsedCategories.push(properties.category);
                        }
                    }
                    break;
            }

            user.analytics.lastAnalyticsUpdate = new Date();
            await user.save();
        } catch (error) {
            logger.error('Error updating user analytics:', error);
        }
    }

    private generateInsights(analytics: AnalyticsData, performance: PerformanceMetrics): string[] {
        const insights = [];

        if (analytics.totalUsers > 0) {
            const growthRate = analytics.userGrowth.length > 1 ?
                ((analytics.userGrowth[analytics.userGrowth.length - 1].totalUsers - analytics.userGrowth[0].totalUsers) / analytics.userGrowth[0].totalUsers) * 100 : 0;

            if (growthRate > 10) {
                insights.push(`User growth is strong at ${growthRate.toFixed(1)}%`);
            } else if (growthRate < 0) {
                insights.push(`User growth is declining at ${growthRate.toFixed(1)}%`);
            }
        }

        if (performance.responseTime.average > 5000) {
            insights.push('Average response time is high. Consider optimizing model selection.');
        }

        if (performance.errorRate.total > 0.05) {
            insights.push('Error rate is elevated. Check system health and model availability.');
        }

        if (analytics.popularModels.length > 0) {
            const topModel = analytics.popularModels[0];
            insights.push(`${topModel.model} is the most popular model with ${topModel.percentage.toFixed(1)}% usage`);
        }

        return insights;
    }

    // Additional helper methods for performance metrics
    private async getResponseTimeMetrics(since: Date): Promise<{ average: number; p50: number; p95: number; p99: number }> {
        // This would typically come from a separate analytics collection
        return {
            average: Math.random() * 2000 + 1000,
            p50: Math.random() * 1500 + 800,
            p95: Math.random() * 3000 + 2000,
            p99: Math.random() * 5000 + 3000
        };
    }

    private async getErrorRateMetrics(since: Date): Promise<{ total: number; byModel: Record<string, number>; byCategory: Record<string, number> }> {
        // This would typically come from a separate analytics collection
        return {
            total: Math.random() * 0.05,
            byModel: {
                'gpt-4o': Math.random() * 0.03,
                'gpt-4o-mini': Math.random() * 0.02,
                'claude-3-5-sonnet': Math.random() * 0.04
            },
            byCategory: {
                'general': Math.random() * 0.02,
                'code': Math.random() * 0.03,
                'creative': Math.random() * 0.04
            }
        };
    }

    private async getThroughputMetrics(since: Date): Promise<{ requestsPerSecond: number; tokensPerSecond: number; peakLoad: number }> {
        // This would typically come from a separate analytics collection
        return {
            requestsPerSecond: Math.random() * 10 + 5,
            tokensPerSecond: Math.random() * 1000 + 500,
            peakLoad: Math.random() * 20 + 10
        };
    }

    private async getCacheMetrics(since: Date): Promise<{ hitRate: number; missRate: number; averageCacheTime: number }> {
        // This would typically come from a separate analytics collection
        const hitRate = Math.random() * 0.3 + 0.6; // 60-90% hit rate
        return {
            hitRate,
            missRate: 1 - hitRate,
            averageCacheTime: Math.random() * 100 + 50 // 50-150ms
        };
    }

    private async getCostMetrics(since: Date): Promise<{ total: number; byModel: Record<string, number>; byUser: Record<string, number>; efficiency: number }> {
        // This would typically come from a separate analytics collection
        return {
            total: Math.random() * 1000 + 500,
            byModel: {
                'gpt-4o': Math.random() * 400 + 200,
                'gpt-4o-mini': Math.random() * 200 + 100,
                'claude-3-5-sonnet': Math.random() * 300 + 150
            },
            byUser: {}, // Would be populated with actual user data
            efficiency: Math.random() * 0.5 + 0.5 // 50-100% efficiency
        };
    }

    private async getRequestsPerMinute(since: Date): Promise<number> {
        // This would typically come from a separate analytics collection
        return Math.random() * 100 + 50;
    }
}

export const analyticsService = new AnalyticsService();
