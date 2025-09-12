import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Sparkles,
  Library,
  Brain,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  History,
  Bookmark,
  Zap,
  CreditCard,
  Trophy
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
    { name: 'Advanced Dashboard', href: '/advanced-dashboard', icon: BarChart3, badge: 'Pro' },
    { name: 'Generator', href: '/generator', icon: Sparkles, badge: 'New' },
    { name: 'Interactive Builder', href: '/interactive-builder', icon: Zap, badge: 'AI' },
    { name: 'Library', href: '/library', icon: Library, badge: null },
    { name: 'Context Engineer', href: '/context', icon: Brain, badge: 'AI' },
    { name: 'AI Features', href: '/ai-features', icon: Brain, badge: 'Advanced' },
    { name: 'Collaboration', href: '/collaboration', icon: Users, badge: null },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
    { name: 'Performance', href: '/performance', icon: Zap, badge: 'Optimized' },
    { name: 'Subscription', href: '/subscription', icon: CreditCard, badge: 'Pro' },
    { name: 'Community', href: '/community', icon: Users, badge: 'Social' },
    { name: 'Achievements', href: '/achievements', icon: Trophy, badge: 'Gamify' },
  ]

  const quickActions = [
    { name: 'New Prompt', icon: Plus, action: 'create-prompt' },
    { name: 'Favorites', icon: Star, action: 'favorites' },
    { name: 'Recent', icon: History, action: 'recent' },
    { name: 'Bookmarks', icon: Bookmark, action: 'bookmarks' },
  ]

  const recentPrompts = [
    { id: '1', title: 'Code Review Assistant', category: 'Development' },
    { id: '2', title: 'Creative Writing', category: 'Writing' },
    { id: '3', title: 'Data Analysis', category: 'Analytics' },
  ]

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? '4rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">AI Prompts</span>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1"
                >
                  {item.name}
                </motion.span>
              )}
              {item.badge && !isCollapsed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-2 py-0.5 text-xs font-medium bg-accent-500 text-white rounded-full"
                >
                  {item.badge}
                </motion.span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 border-t border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                <action.icon className="w-4 h-4" />
                <span>{action.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Prompts */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 border-t border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Recent Prompts
          </h3>
          <div className="space-y-2">
            {recentPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {prompt.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {prompt.category}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settings */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </motion.div>
  )
}

export default Sidebar
