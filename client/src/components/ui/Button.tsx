import React, { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rounded?: boolean
  gradient?: boolean
  glow?: boolean
  animation?: 'none' | 'bounce' | 'pulse' | 'float'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps & MotionProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    rounded = false,
    gradient = false,
    glow = false,
    animation = 'none',
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'relative inline-flex items-center justify-center font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 hover:border-gray-400 focus:ring-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-600',
      outline: 'bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100',
      destructive: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
      success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    }

    const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg'
    const widthClasses = fullWidth ? 'w-full' : ''
    const gradientClasses = gradient ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600' : ''
    const glowClasses = glow ? 'shadow-lg hover:shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/50' : ''

    const animationProps = {
      none: {},
      bounce: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      },
      pulse: {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      },
      float: {
        animate: { y: [0, -5, 0] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      }
    }

    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          roundedClasses,
          widthClasses,
          gradientClasses,
          glowClasses,
          className
        )}
        disabled={isDisabled}
        {...animationProps[animation]}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        
        {icon && iconPosition === 'left' && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children && (
          <span className={loading ? 'opacity-0' : 'opacity-100'}>
            {children}
          </span>
        )}
        
        {icon && iconPosition === 'right' && !loading && (
          <span className="ml-2">{icon}</span>
        )}
        
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-lg overflow-hidden">
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </span>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button