import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    X,
    Copy,
    Download,
    Share2,
    Star,
    Heart
} from 'lucide-react'

export interface ToastData {
    id: string
    type: 'success' | 'error' | 'warning' | 'info' | 'custom'
    title: string
    message?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
        icon?: React.ComponentType<{ className?: string }>
    }
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

interface ToastProps {
    toast: ToastData
    onRemove: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const getIcon = () => {
        if (toast.icon) return toast.icon
        if (toast.type === 'custom') return Info

        const icons = {
            success: CheckCircle,
            error: XCircle,
            warning: AlertCircle,
            info: Info
        }
        return icons[toast.type]
    }

    const getColors = () => {
        if (toast.color) {
            return {
                bg: toast.color,
                text: 'white',
                border: toast.color
            }
        }

        const colors = {
            success: {
                bg: 'bg-green-500',
                text: 'text-white',
                border: 'border-green-500'
            },
            error: {
                bg: 'bg-red-500',
                text: 'text-white',
                border: 'border-red-500'
            },
            warning: {
                bg: 'bg-yellow-500',
                text: 'text-white',
                border: 'border-yellow-500'
            },
            info: {
                bg: 'bg-blue-500',
                text: 'text-white',
                border: 'border-blue-500'
            },
            custom: {
                bg: 'bg-gray-500',
                text: 'text-white',
                border: 'border-gray-500'
            }
        }
        return colors[toast.type]
    }

    const colors = getColors()
    const Icon = getIcon()

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className={`relative max-w-sm w-full ${colors.bg} ${colors.text} rounded-lg shadow-lg border ${colors.border} overflow-hidden`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium">{toast.title}</h4>
                        {toast.message && (
                            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
                        )}
                        {toast.action && (
                            <div className="mt-3">
                                <button
                                    onClick={toast.action.onClick}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                                >
                                    {toast.action.icon && <toast.action.icon className="w-3 h-3 mr-1" />}
                                    {toast.action.label}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={() => onRemove(toast.id)}
                            className="inline-flex text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            {toast.duration && toast.duration > 0 && (
                <motion.div
                    className="h-1 bg-white/30"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                />
            )}
        </motion.div>
    )
}

interface ToastContainerProps {
    toasts: ToastData[]
    onRemove: (id: string) => void
    position?: ToastData['position']
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onRemove,
    position = 'top-right'
}) => {
    const getPositionClasses = () => {
        const positions = {
            'top-right': 'top-4 right-4',
            'top-left': 'top-4 left-4',
            'bottom-right': 'bottom-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
            'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
        }
        return positions[position]
    }

    return (
        <div className={`fixed z-50 ${getPositionClasses()}`}>
            <div className="space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            toast={toast}
                            onRemove={onRemove}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Toast hook
export const useToast = () => {
    const [toasts, setToasts] = React.useState<ToastData[]>([])

    const addToast = (toast: Omit<ToastData, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast = { ...toast, id }

        setToasts(prev => [...prev, newToast])

        // Auto remove after duration
        if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, toast.duration)
        }
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    const clearAll = () => {
        setToasts([])
    }

    // Predefined toast types
    const success = (title: string, message?: string, options?: Partial<ToastData>) => {
        addToast({
            type: 'success',
            title,
            message,
            duration: 4000,
            ...options
        })
    }

    const error = (title: string, message?: string, options?: Partial<ToastData>) => {
        addToast({
            type: 'error',
            title,
            message,
            duration: 6000,
            ...options
        })
    }

    const warning = (title: string, message?: string, options?: Partial<ToastData>) => {
        addToast({
            type: 'warning',
            title,
            message,
            duration: 5000,
            ...options
        })
    }

    const info = (title: string, message?: string, options?: Partial<ToastData>) => {
        addToast({
            type: 'info',
            title,
            message,
            duration: 4000,
            ...options
        })
    }

    const custom = (toast: Omit<ToastData, 'id' | 'type'>) => {
        addToast({
            type: 'custom',
            ...toast
        })
    }

    // Specialized toasts
    const copySuccess = (text: string) => {
        success('Copied!', `"${text}" copied to clipboard`, {
            action: {
                label: 'Copy Again',
                onClick: () => navigator.clipboard.writeText(text),
                icon: Copy
            }
        })
    }

    const downloadSuccess = (filename: string) => {
        success('Downloaded!', `${filename} downloaded successfully`, {
            action: {
                label: 'Open',
                onClick: () => console.log('Open file'),
                icon: Download
            }
        })
    }

    const shareSuccess = (url: string) => {
        success('Shared!', 'Link copied to clipboard', {
            action: {
                label: 'Share Again',
                onClick: () => navigator.clipboard.writeText(url),
                icon: Share2
            }
        })
    }

    const favoriteAdded = (item: string) => {
        custom({
            title: 'Added to Favorites',
            message: `${item} added to your favorites`,
            icon: Star,
            color: '#f59e0b',
            action: {
                label: 'View Favorites',
                onClick: () => console.log('View favorites'),
                icon: Heart
            }
        })
    }

    return {
        toasts,
        addToast,
        removeToast,
        clearAll,
        success,
        error,
        warning,
        info,
        custom,
        copySuccess,
        downloadSuccess,
        shareSuccess,
        favoriteAdded
    }
}
