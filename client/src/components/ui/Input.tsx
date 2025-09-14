import React, { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Search, X, Check, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass' | 'neural' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  state?: 'default' | 'success' | 'error' | 'warning'
  label?: string
  helperText?: string
  errorText?: string
  successText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  clearable?: boolean
  searchable?: boolean
  password?: boolean
  rounded?: boolean
  glow?: boolean
  animation?: 'none' | 'focus' | 'shake'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    state = 'default',
    label,
    helperText,
    errorText,
    successText,
    icon,
    iconPosition = 'left',
    clearable = false,
    searchable = false,
    password = false,
    rounded = false,
    glow = false,
    animation = 'none',
    value,
    onChange,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [internalValue, setInternalValue] = useState(value || '')

    const baseClasses = 'w-full transition-all duration-300 ease-in-out focus:outline-none'
    
    const variants = {
      default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
      glass: 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-400',
      neural: 'bg-gradient-to-r from-white/5 to-white/10 dark:from-gray-800/5 dark:to-gray-800/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-400',
      outline: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }

    const states = {
      default: 'focus:border-blue-500 focus:ring-blue-500/20',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20'
    }

    const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg'
    const glowClasses = glow && isFocused ? 'shadow-lg shadow-blue-500/25' : ''

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onChange?.(e)
    }

    const handleClear = () => {
      setInternalValue('')
      onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    }

    const getStateIcon = () => {
      switch (state) {
        case 'success':
          return <Check className="w-4 h-4 text-green-500" />
        case 'error':
          return <AlertCircle className="w-4 h-4 text-red-500" />
        case 'warning':
          return <AlertCircle className="w-4 h-4 text-yellow-500" />
        default:
          return null
      }
    }

    const getStateText = () => {
      if (state === 'error' && errorText) return errorText
      if (state === 'success' && successText) return successText
      if (helperText) return helperText
      return null
    }

    const getStateTextColor = () => {
      switch (state) {
        case 'success':
          return 'text-green-600 dark:text-green-400'
        case 'error':
          return 'text-red-600 dark:text-red-400'
        case 'warning':
          return 'text-yellow-600 dark:text-yellow-400'
        default:
          return 'text-gray-500 dark:text-gray-400'
      }
    }

    const inputType = password ? (showPassword ? 'text' : 'password') : props.type || 'text'

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500">
                {icon}
              </span>
            </div>
          )}
          
          <motion.input
            ref={ref}
            type={inputType}
            value={internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[size],
              states[state],
              roundedClasses,
              glowClasses,
              icon && iconPosition === 'left' ? 'pl-10' : '',
              (icon && iconPosition === 'right') || clearable || password || searchable ? 'pr-10' : '',
              className
            )}
            animate={animation === 'shake' && state === 'error' ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            {...props}
          />
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
            {getStateIcon()}
            
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            
            {searchable && (
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
            
            {clearable && internalValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {icon && iconPosition === 'right' && !password && !clearable && !searchable && (
              <span className="text-gray-400 dark:text-gray-500">
                {icon}
              </span>
            )}
          </div>
        </div>
        
        {getStateText() && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('mt-2 text-sm', getStateTextColor())}
          >
            {getStateText()}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input