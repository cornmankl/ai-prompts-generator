import React, { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neural' | 'gradient' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  hover?: boolean
  interactive?: boolean
  gradient?: string
  glow?: boolean
  animation?: 'none' | 'float' | 'glow' | 'shimmer'
}

const Card = forwardRef<HTMLDivElement, CardProps & MotionProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    rounded = 'lg',
    shadow = 'md',
    hover = false,
    interactive = false,
    gradient,
    glow = false,
    animation = 'none',
    children,
    ...props
  }, ref) => {
    const baseClasses = 'transition-all duration-300 ease-in-out'
    
    const variants = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      glass: 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20',
      neural: 'bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/10 dark:to-gray-800/5 backdrop-blur-xl border border-white/20 dark:border-gray-700/20',
      gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700',
      elevated: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl'
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    }

    const roundings = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full'
    }

    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl'
    }

    const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 hover:scale-105' : ''
    const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-xl hover:-translate-y-2' : ''
    const glowClasses = glow ? 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50' : ''

    const animationProps = {
      none: {},
      float: {
        animate: { y: [0, -5, 0] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      },
      glow: {
        animate: { 
          boxShadow: [
            '0 10px 25px rgba(59, 130, 246, 0.1)',
            '0 20px 40px rgba(59, 130, 246, 0.2)',
            '0 10px 25px rgba(59, 130, 246, 0.1)'
          ]
        },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      },
      shimmer: {
        animate: { 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      }
    }

    const gradientStyle = gradient ? { background: gradient } : {}

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          roundings[rounded],
          shadows[shadow],
          hoverClasses,
          interactiveClasses,
          glowClasses,
          className
        )}
        style={gradientStyle}
        {...animationProps[animation]}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// Card sub-components
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export default Card