import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu,
    X,
    Search,
    Plus,
    Settings,
    User,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Menu */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl"
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Menu</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

interface MobileFABProps {
    onClick: () => void
    icon?: React.ReactNode
    label?: string
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export const MobileFAB: React.FC<MobileFABProps> = ({
    onClick,
    icon = <Plus className="w-6 h-6" />,
    label,
    position = 'bottom-right'
}) => {
    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`fixed ${positionClasses[position]} z-30 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg`}
        >
            {icon}
            {label && (
                <span className="sr-only">{label}</span>
            )}
        </motion.button>
    )
}

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
    placeholder = 'Search...'
}) => {
    const [query, setQuery] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(query)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4"
                >
                    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholder}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
                                autoFocus
                            />
                        </div>
                        <button
                            type="button"
                            onClick={onToggle}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

interface MobileAccordionProps {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
}

export const MobileAccordion: React.FC<MobileAccordionProps> = ({
    title,
    children,
    defaultOpen = false
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <span className="font-medium">{title}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

interface MobileBottomNavProps {
    items: Array<{
        id: string
        label: string
        icon: React.ComponentType<{ className?: string }>
        active?: boolean
        onClick: () => void
        badge?: string | number
    }>
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ items }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30">
            <div className="flex">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`flex-1 flex flex-col items-center py-2 px-1 ${item.active
                            ? 'text-primary-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <div className="relative">
                            <item.icon className="w-5 h-5 mx-auto" />
                            {item.badge && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// Hook for mobile detection
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

// Hook for touch gestures
export const useTouchGestures = () => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        })
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        })
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distanceX = touchStart.x - touchEnd.x
        const distanceY = touchStart.y - touchEnd.y
        const isLeftSwipe = distanceX > minSwipeDistance
        const isRightSwipe = distanceX < -minSwipeDistance
        const isUpSwipe = distanceY > minSwipeDistance
        const isDownSwipe = distanceY < -minSwipeDistance

        return {
            isLeftSwipe,
            isRightSwipe,
            isUpSwipe,
            isDownSwipe,
            distanceX,
            distanceY
        }
    }

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    }
}
