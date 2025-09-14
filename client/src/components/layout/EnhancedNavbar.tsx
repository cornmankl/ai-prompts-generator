import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Menu,
  X,
  Plus,
  Zap,
  ChevronDown,
  Command,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'

const EnhancedNavbar: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, setTheme, toggleTheme, themeIcon, themeLabel } = useTheme()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New prompt shared', message: 'John shared "Code Review Assistant"', time: '2m ago', unread: true },
    { id: 2, title: 'Achievement unlocked', message: 'You earned "Power User" badge', time: '1h ago', unread: true },
    { id: 3, title: 'Weekly report', message: 'Your usage stats are ready', time: '1d ago', unread: false },
  ])

  const quickActions = [
    { name: 'New Prompt', icon: Plus, shortcut: '⌘N', action: 'create-prompt' },
    { name: 'Search', icon: Search, shortcut: '⌘K', action: 'search' },
    { name: 'Analytics', icon: BarChart3, shortcut: '⌘A', action: 'analytics' },
    { name: 'Collaborate', icon: Users, shortcut: '⌘C', action: 'collaborate' },
  ]

  const handleThemeChange = () => {
    toggleTheme()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log(`Searching for: ${query}`)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-prompt':
        console.log('Creating new prompt...')
        break
      case 'search':
        setIsSearchOpen(true)
        break
      case 'analytics':
        console.log('Opening analytics...')
        break
      case 'collaborate':
        console.log('Starting collaboration...')
        break
      default:
        break
    }
  }

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => n.unread).length

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            setIsSearchOpen(true)
            break
          case 'n':
            e.preventDefault()
            handleQuickAction('create-prompt')
            break
          case 'a':
            e.preventDefault()
            handleQuickAction('analytics')
            break
          case 'c':
            e.preventDefault()
            handleQuickAction('collaborate')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center space-x-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
              >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                <span className="text-gray-500 dark:text-gray-400 flex-1">Search prompts, templates...</span>
                <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-1">
              {quickActions.slice(0, 2).map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  title={`${action.name} (${action.shortcut})`}
                >
                  <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={handleThemeChange}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={themeLabel}
            >
              {themeIcon && React.createElement(themeIcon, { className: "w-4 h-4" })}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-110 transition-transform">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.subscription?.plan || 'Free'} Plan
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.email || 'user@example.com'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user?.subscription?.plan === 'pro' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {user?.subscription?.plan || 'Free'} Plan
                            </span>
                            {user?.subscription?.plan === 'pro' && (
                              <Sparkles className="w-3 h-3 text-purple-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">1.2K</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Prompts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">456</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Generated</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">94%</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <a
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </a>
                      <a
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </a>
                      <a
                        href="/subscription"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 mr-3" />
                        Upgrade Plan
                      </a>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-2 space-y-1">
              {quickActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{action.shortcut}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card variant="glass" className="p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <Input
                    placeholder="Search prompts, templates, categories, or users..."
                    searchable
                    glow
                    autoFocus
                    className="text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Quick Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.action}
                        onClick={() => {
                          handleQuickAction(action.action)
                          setIsSearchOpen(false)
                        }}
                        className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <action.icon className="w-4 h-4" />
                        <span>{action.name}</span>
                        <span className="ml-auto text-xs text-gray-400">{action.shortcut}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default EnhancedNavbar