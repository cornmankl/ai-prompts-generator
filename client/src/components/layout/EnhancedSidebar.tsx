import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
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
  Trophy,
  Search,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import Card from '../ui/Card'
import Button from '../ui/Button'

const EnhancedSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [activeSection, setActiveSection] = useState('main')
  const location = useLocation()
  const { theme, setTheme, toggleTheme } = useTheme()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard, 
      badge: null,
      section: 'main',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Advanced Dashboard', 
      href: '/advanced-dashboard', 
      icon: BarChart3, 
      badge: 'Pro',
      section: 'main',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'Generator', 
      href: '/generator', 
      icon: Sparkles, 
      badge: 'New',
      section: 'creation',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      name: 'Interactive Builder', 
      href: '/interactive-builder', 
      icon: Zap, 
      badge: 'AI',
      section: 'creation',
      gradient: 'from-orange-500 to-orange-600'
    },
    { 
      name: 'Library', 
      href: '/library', 
      icon: Library, 
      badge: null,
      section: 'content',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    { 
      name: 'Context Engineer', 
      href: '/context', 
      icon: Brain, 
      badge: 'AI',
      section: 'content',
      gradient: 'from-pink-500 to-pink-600'
    },
    { 
      name: 'AI Features', 
      href: '/ai-features', 
      icon: Brain, 
      badge: 'Advanced',
      section: 'ai',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    { 
      name: 'Collaboration', 
      href: '/collaboration', 
      icon: Users, 
      badge: null,
      section: 'social',
      gradient: 'from-teal-500 to-teal-600'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3, 
      badge: null,
      section: 'analytics',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    { 
      name: 'Performance', 
      href: '/performance', 
      icon: Zap, 
      badge: 'Optimized',
      section: 'analytics',
      gradient: 'from-violet-500 to-violet-600'
    },
    { 
      name: 'Subscription', 
      href: '/subscription', 
      icon: CreditCard, 
      badge: 'Pro',
      section: 'account',
      gradient: 'from-rose-500 to-rose-600'
    },
    { 
      name: 'Community', 
      href: '/community', 
      icon: Users, 
      badge: 'Social',
      section: 'social',
      gradient: 'from-amber-500 to-amber-600'
    },
    { 
      name: 'Achievements', 
      href: '/achievements', 
      icon: Trophy, 
      badge: 'Gamify',
      section: 'account',
      gradient: 'from-lime-500 to-lime-600'
    },
  ]

  const quickActions = [
    { name: 'New Prompt', icon: Plus, action: 'create-prompt', gradient: 'from-blue-500 to-purple-600' },
    { name: 'Favorites', icon: Star, action: 'favorites', gradient: 'from-yellow-500 to-orange-600' },
    { name: 'Recent', icon: History, action: 'recent', gradient: 'from-green-500 to-teal-600' },
    { name: 'Bookmarks', icon: Bookmark, action: 'bookmarks', gradient: 'from-purple-500 to-pink-600' },
  ]

  const recentPrompts = [
    { id: '1', title: 'Code Review Assistant', category: 'Development', gradient: 'from-blue-500 to-blue-600' },
    { id: '2', title: 'Creative Writing', category: 'Writing', gradient: 'from-purple-500 to-purple-600' },
    { id: '3', title: 'Data Analysis', category: 'Analytics', gradient: 'from-green-500 to-green-600' },
  ]

  const sections = [
    { id: 'main', name: 'Main', icon: LayoutDashboard },
    { id: 'creation', name: 'Creation', icon: Sparkles },
    { id: 'content', name: 'Content', icon: Library },
    { id: 'ai', name: 'AI', icon: Brain },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'account', name: 'Account', icon: Settings },
  ]

  const filteredNavigation = navigation.filter(item => item.section === activeSection)

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`)
  }

  const sidebarWidth = isCollapsed ? '4rem' : '18rem'
  const showExpanded = isCollapsed && isHovered

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col h-full relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold gradient-text">AI Prompts</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Generator</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {sections.slice(0, 4).map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <section.icon className="w-3 h-3" />
                  <span>{section.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredNavigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                  location.pathname === item.href 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-r ${item.gradient} shadow-lg`
                }`}>
                  <item.icon className={`w-4 h-4 ${
                    location.pathname === item.href ? 'text-white' : 'text-white'
                  }`} />
                </div>
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
                    className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full"
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
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors group"
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-3 h-3 text-white" />
                  </div>
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
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${prompt.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {prompt.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {prompt.category}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bell className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </div>
      </motion.div>

      {/* Expanded Sidebar Overlay */}
      <AnimatePresence>
        {showExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-16 top-0 w-64 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 shadow-xl z-50"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {sections.find(s => s.id === activeSection)?.name} Navigation
              </h3>
              <div className="space-y-2">
                {filteredNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${item.gradient} flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-3 h-3 text-white" />
                    </div>
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default EnhancedSidebar