import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus, Menu, Home, Sparkles, Library, Users, BarChart3, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import Card from '../ui/Card'

// Mobile detection hook
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Mobile Search Component
interface MobileSearchProps {
  isOpen: boolean
  onToggle: () => void
  onSearch: (query: string) => void
  placeholder?: string
}

export const MobileSearch: React.FC<MobileSearchProps> = ({
  isOpen,
  onToggle,
  onSearch,
  placeholder = "Search..."
}) => {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    onSearch(query)
    setQuery('')
    onToggle()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          onClick={onToggle}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant="glass" className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={onToggle}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <Button
                onClick={handleSearch}
                className="w-full"
                disabled={!query.trim()}
              >
                Search
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Mobile FAB (Floating Action Button)
interface MobileFABProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

export const MobileFAB: React.FC<MobileFABProps> = ({
  onClick,
  icon,
  label,
  position = 'bottom-right'
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  }

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`fixed ${positionClasses[position]} w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-40 touch-manipulation`}
      aria-label={label}
    >
      {icon}
    </motion.button>
  )
}

// Mobile Bottom Navigation
interface MobileBottomNavProps {
  currentPath: string
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/generator', icon: Sparkles, label: 'Generator' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/collaboration', icon: Users, label: 'Collaborate' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors touch-manipulation ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Mobile Menu Component
interface MobileMenuProps {
  isOpen: boolean
  onToggle: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home, description: 'Overview and stats' },
    { name: 'Generator', path: '/generator', icon: Sparkles, description: 'Create new prompts' },
    { name: 'Library', path: '/library', icon: Library, description: 'Browse prompts' },
    { name: 'Context Engineer', path: '/context', icon: Settings, description: 'Optimize context' },
    { name: 'Collaboration', path: '/collaboration', icon: Users, description: 'Work together' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, description: 'Track performance' },
  ]

  const handleItemClick = (path: string) => {
    navigate(path)
    onToggle()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={onToggle}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 h-full bg-white dark:bg-gray-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold gradient-text">Menu</h2>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleItemClick(item.path)}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => {
                    navigate('/settings')
                    onToggle()
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Touch-friendly Swipe Gestures
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 50
) => {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = threshold

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

// Mobile-optimized Card Component
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const MobileCard: React.FC<MobileCardProps> = ({ children, className, onClick }) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 touch-manipulation ${className || ''}`}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  )
}

// Mobile Pull-to-Refresh
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 60
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return

    const touchY = e.touches[0].clientY
    const pullDistance = Math.max(0, touchY - e.currentTarget.getBoundingClientRect().top)
    
    if (pullDistance > 0) {
      e.preventDefault()
      setPullDistance(pullDistance)
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    
    setPullDistance(0)
    setIsPulling(false)
  }

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isPulling && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-gradient-to-b from-blue-500 to-purple-600 text-white"
          style={{ height: Math.min(pullDistance, threshold * 2) }}
          animate={{ height: Math.min(pullDistance, threshold * 2) }}
        >
          {pullDistance > threshold ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-6 h-6" />
            </motion.div>
          ) : (
            <div className="text-sm">Pull to refresh</div>
          )}
        </motion.div>
      )}
      
      <div style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)` }}>
        {children}
      </div>
    </div>
  )
}

export default {
  useMobile,
  MobileSearch,
  MobileFAB,
  MobileBottomNav,
  MobileMenu,
  useSwipeGesture,
  MobileCard,
  PullToRefresh
}