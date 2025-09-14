import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap, 
  Brain, 
  BarChart3,
  Plus,
  Star,
  Clock,
  ArrowRight,
  Activity,
  Target,
  Award,
  BookOpen,
  Lightbulb,
  Rocket,
  Globe,
  Shield,
  Heart
} from 'lucide-react'
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { 
      name: 'Total Prompts', 
      value: '1,234', 
      change: '+12%', 
      changeType: 'positive', 
      icon: Sparkles,
      color: 'blue',
      trend: [65, 59, 80, 81, 56, 55, 40, 45, 50, 55, 60, 65]
    },
    { 
      name: 'Active Users', 
      value: '456', 
      change: '+8%', 
      changeType: 'positive', 
      icon: Users,
      color: 'green',
      trend: [28, 48, 40, 19, 86, 27, 90, 85, 80, 75, 70, 75]
    },
    { 
      name: 'Generations Today', 
      value: '2,890', 
      change: '+23%', 
      changeType: 'positive', 
      icon: Zap,
      color: 'purple',
      trend: [12, 19, 3, 5, 2, 3, 8, 12, 15, 18, 20, 23]
    },
    { 
      name: 'Success Rate', 
      value: '94.2%', 
      change: '+2.1%', 
      changeType: 'positive', 
      icon: TrendingUp,
      color: 'orange',
      trend: [88, 90, 92, 89, 91, 93, 94, 95, 94, 93, 94, 94]
    },
  ]

  const quickActions = [
    { 
      name: 'Create New Prompt', 
      description: 'Start with a blank template or use AI assistance', 
      icon: Plus, 
      color: 'primary',
      gradient: 'from-blue-500 to-purple-600',
      action: 'create-prompt'
    },
    { 
      name: 'Browse Library', 
      description: 'Explore thousands of curated prompts', 
      icon: BookOpen, 
      color: 'accent',
      gradient: 'from-purple-500 to-pink-600',
      action: 'browse-library'
    },
    { 
      name: 'Context Engineer', 
      description: 'Optimize prompts with advanced context', 
      icon: Brain, 
      color: 'success',
      gradient: 'from-green-500 to-teal-600',
      action: 'context-engineer'
    },
    { 
      name: 'View Analytics', 
      description: 'Track performance and insights', 
      icon: BarChart3, 
      color: 'warning',
      gradient: 'from-orange-500 to-red-600',
      action: 'view-analytics'
    },
  ]

  const featuredPrompts = [
    {
      id: 1,
      title: 'Advanced Code Review Assistant',
      description: 'Comprehensive code analysis with security, performance, and best practices review',
      category: 'Development',
      rating: 4.9,
      downloads: 1234,
      tags: ['code', 'review', 'security', 'performance'],
      author: 'TechGuru',
      gradient: 'from-blue-500 to-purple-600',
      icon: Shield
    },
    {
      id: 2,
      title: 'Creative Writing Generator',
      description: 'Generate compelling stories, articles, and creative content with AI assistance',
      category: 'Writing',
      rating: 4.8,
      downloads: 987,
      tags: ['writing', 'creative', 'story', 'content'],
      author: 'WordMaster',
      gradient: 'from-purple-500 to-pink-600',
      icon: Lightbulb
    },
    {
      id: 3,
      title: 'Data Analysis Assistant',
      description: 'Advanced data analysis and visualization prompts for insights',
      category: 'Analytics',
      rating: 4.7,
      downloads: 756,
      tags: ['data', 'analysis', 'visualization', 'insights'],
      author: 'DataPro',
      gradient: 'from-green-500 to-teal-600',
      icon: Target
    },
  ]

  const recentActivity = [
    { 
      id: 1, 
      type: 'prompt_created', 
      title: 'Code Review Assistant', 
      time: '2 minutes ago', 
      user: 'John Doe',
      icon: Plus,
      color: 'blue'
    },
    { 
      id: 2, 
      type: 'prompt_shared', 
      title: 'Creative Writing Template', 
      time: '15 minutes ago', 
      user: 'Jane Smith',
      icon: Share,
      color: 'green'
    },
    { 
      id: 3, 
      type: 'context_updated', 
      title: 'Data Analysis Profile', 
      time: '1 hour ago', 
      user: 'Mike Johnson',
      icon: Brain,
      color: 'purple'
    },
    { 
      id: 4, 
      type: 'collaboration', 
      title: 'Marketing Copy Generator', 
      time: '2 hours ago', 
      user: 'Sarah Wilson',
      icon: Users,
      color: 'orange'
    },
  ]

  const achievements = [
    { name: 'First Prompt', icon: Rocket, progress: 100, unlocked: true },
    { name: 'Power User', icon: Zap, progress: 75, unlocked: false },
    { name: 'Community Helper', icon: Heart, progress: 50, unlocked: false },
    { name: 'Global Creator', icon: Globe, progress: 25, unlocked: false },
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'prompts', name: 'My Prompts', icon: Sparkles },
    { id: 'analytics', name: 'Analytics', icon: Activity },
    { id: 'achievements', name: 'Achievements', icon: Award },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6 space-y-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-10 blur-xl"
            />
            <h1 className="text-5xl font-black gradient-text relative z-10">
              AI Prompts Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            The most advanced AI prompts generator with context engineering, 
            real-time collaboration, and cutting-edge 2025 features.
          </p>
          
          {/* Quick Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <Input
              placeholder="Search prompts, templates, or categories..."
              searchable
              glow
              className="text-center"
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                variant="neural"
                className="relative overflow-hidden group cursor-pointer"
                glow
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color === 'blue' ? 'from-blue-500 to-blue-600' : 
                      stat.color === 'green' ? 'from-green-500 to-green-600' :
                      stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      'from-orange-500 to-orange-600'} shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      stat.changeType === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.name}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  variant="glass"
                  className="relative overflow-hidden group cursor-pointer h-full"
                  interactive
                  gradient={`linear-gradient(135deg, ${action.gradient})`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="relative z-10 text-center space-y-4 h-full flex flex-col justify-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${action.gradient} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card variant="neural" className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>Your latest prompt activities and collaborations</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${
                        activity.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        activity.color === 'green' ? 'from-green-500 to-green-600' :
                        activity.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        'from-orange-500 to-orange-600'
                      } flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <activity.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Featured Prompts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card variant="neural" className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>Featured Prompts</span>
                    </CardTitle>
                    <CardDescription>Top-rated prompts from the community</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    Browse All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredPrompts.map((prompt, index) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${prompt.gradient} flex items-center justify-center shadow-lg`}>
                            <prompt.icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                              {prompt.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">by {prompt.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium">{prompt.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {prompt.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {prompt.category}
                          </span>
                          <span>{prompt.downloads} downloads</span>
                        </div>
                        <div className="flex space-x-1">
                          {prompt.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard