import { useState, useEffect, useCallback } from 'react'

interface AnalyticsEvent {
    id: string
    type: string
    category: string
    action: string
    label?: string
    value?: number
    timestamp: Date
    metadata?: Record<string, any>
}

interface AnalyticsData {
    totalPrompts: number
    totalTemplates: number
    totalGenerations: number
    popularCategories: Array<{ category: string; count: number }>
    recentActivity: AnalyticsEvent[]
    dailyStats: Array<{ date: string; prompts: number; generations: number }>
    userEngagement: {
        avgSessionTime: number
        totalSessions: number
        bounceRate: number
    }
}

export const useAnalytics = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalPrompts: 0,
        totalTemplates: 0,
        totalGenerations: 0,
        popularCategories: [],
        recentActivity: [],
        dailyStats: [],
        userEngagement: {
            avgSessionTime: 0,
            totalSessions: 0,
            bounceRate: 0
        }
    })

    const [isLoading, setIsLoading] = useState(true)

    // Track event
    const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
        const newEvent: AnalyticsEvent = {
            ...event,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date()
        }

        // Save to localStorage
        const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
        const updatedEvents = [...existingEvents, newEvent].slice(-1000) // Keep last 1000 events
        localStorage.setItem('analytics_events', JSON.stringify(updatedEvents))

        // Update analytics state
        setAnalytics(prev => ({
            ...prev,
            recentActivity: [newEvent, ...prev.recentActivity].slice(0, 50)
        }))

        // Update specific counters
        if (event.type === 'prompt') {
            setAnalytics(prev => ({
                ...prev,
                totalPrompts: prev.totalPrompts + 1
            }))
        } else if (event.type === 'generation') {
            setAnalytics(prev => ({
                ...prev,
                totalGenerations: prev.totalGenerations + 1
            }))
        }
    }, [])

    // Track page view
    const trackPageView = useCallback((page: string) => {
        trackEvent({
            type: 'navigation',
            category: 'page',
            action: 'view',
            label: page
        })
    }, [trackEvent])

    // Track prompt creation
    const trackPromptCreation = useCallback((category: string, template?: string) => {
        trackEvent({
            type: 'prompt',
            category: 'creation',
            action: 'create',
            label: category,
            metadata: { template }
        })
    }, [trackEvent])

    // Track prompt generation
    const trackPromptGeneration = useCallback((model: string, tokens: number) => {
        trackEvent({
            type: 'generation',
            category: 'ai',
            action: 'generate',
            label: model,
            value: tokens
        })
    }, [trackEvent])

    // Track optimization
    const trackOptimization = useCallback((type: string, improvement: number) => {
        trackEvent({
            type: 'optimization',
            category: 'ai',
            action: 'optimize',
            label: type,
            value: improvement
        })
    }, [trackEvent])

    // Load analytics data
    useEffect(() => {
        const loadAnalytics = () => {
            try {
                // Load from localStorage
                const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
                const prompts = JSON.parse(localStorage.getItem('prompts') || '[]')
                const templates = JSON.parse(localStorage.getItem('templates') || '[]')

                // Calculate popular categories
                const categoryCount: Record<string, number> = {}
                prompts.forEach((prompt: any) => {
                    categoryCount[prompt.category] = (categoryCount[prompt.category] || 0) + 1
                })

                const popularCategories = Object.entries(categoryCount)
                    .map(([category, count]) => ({ category, count: count as number }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                // Calculate daily stats (last 7 days)
                const dailyStats = []
                for (let i = 6; i >= 0; i--) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toISOString().split('T')[0]

                    const dayEvents = events.filter((event: AnalyticsEvent) =>
                        event.timestamp && new Date(event.timestamp).toISOString().split('T')[0] === dateStr
                    )

                    dailyStats.push({
                        date: dateStr,
                        prompts: dayEvents.filter((e: AnalyticsEvent) => e.type === 'prompt').length,
                        generations: dayEvents.filter((e: AnalyticsEvent) => e.type === 'generation').length
                    })
                }

                // Calculate user engagement
                const sessions = JSON.parse(localStorage.getItem('user_sessions') || '[]')
                const avgSessionTime = sessions.length > 0
                    ? sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / sessions.length
                    : 0

                setAnalytics({
                    totalPrompts: prompts.length,
                    totalTemplates: templates.length,
                    totalGenerations: events.filter((e: AnalyticsEvent) => e.type === 'generation').length,
                    popularCategories,
                    recentActivity: events.slice(-50).reverse(),
                    dailyStats,
                    userEngagement: {
                        avgSessionTime,
                        totalSessions: sessions.length,
                        bounceRate: 0.3 // Placeholder
                    }
                })
            } catch (error) {
                console.error('Failed to load analytics:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadAnalytics()
    }, [])

    // Track session time
    useEffect(() => {
        const sessionStart = Date.now()

        const trackSession = () => {
            const duration = Date.now() - sessionStart
            const sessions = JSON.parse(localStorage.getItem('user_sessions') || '[]')
            sessions.push({
                startTime: new Date(sessionStart).toISOString(),
                duration: Math.round(duration / 1000), // in seconds
                endTime: new Date().toISOString()
            })
            localStorage.setItem('user_sessions', JSON.stringify(sessions.slice(-100))) // Keep last 100 sessions
        }

        // Track session on page unload
        window.addEventListener('beforeunload', trackSession)
        return () => {
            trackSession()
            window.removeEventListener('beforeunload', trackSession)
        }
    }, [])

    return {
        analytics,
        isLoading,
        trackEvent,
        trackPageView,
        trackPromptCreation,
        trackPromptGeneration,
        trackOptimization
    }
}

export default useAnalytics
