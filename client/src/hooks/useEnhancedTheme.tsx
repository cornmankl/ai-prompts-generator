import { useState, useEffect, createContext, useContext } from 'react'
import { motion } from 'framer-motion'

type Theme = 'light' | 'dark' | 'system'
type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan'

interface ThemeContextType {
  theme: Theme
  colorScheme: ColorScheme
  setTheme: (theme: Theme) => void
  setColorScheme: (scheme: ColorScheme) => void
  toggleTheme: () => void
  themeIcon: React.ComponentType<{ className?: string }> | null
  themeLabel: string
  isDark: boolean
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const colorSchemes = {
  blue: {
    light: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#a78bfa',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155'
    }
  },
  purple: {
    light: {
      primary: '#8b5cf6',
      secondary: '#64748b',
      accent: '#ec4899',
      background: '#ffffff',
      surface: '#faf5ff',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#a78bfa',
      secondary: '#94a3b8',
      accent: '#f472b6',
      background: '#0f172a',
      surface: '#1e1b2e',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155'
    }
  },
  green: {
    light: {
      primary: '#10b981',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#34d399',
      secondary: '#94a3b8',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#0c1f1a',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155'
    }
  },
  orange: {
    light: {
      primary: '#f59e0b',
      secondary: '#64748b',
      accent: '#ef4444',
      background: '#ffffff',
      surface: '#fffbeb',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#fbbf24',
      secondary: '#94a3b8',
      accent: '#f87171',
      background: '#0f172a',
      surface: '#1f1611',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155'
    }
  },
  pink: {
    light: {
      primary: '#ec4899',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      surface: '#fdf2f8',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#f472b6',
      secondary: '#94a3b8',
      accent: '#a78bfa',
      background: '#0f172a',
      surface: '#1e1a1d',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155'
    }
  },
  cyan: {
    light: {
      primary: '#06b6d4',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f0fdfa',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#22d3ee',
      secondary: '#94a3b8',
      accent: '#34d399',
      background: '#0f172a',
      surface: '#0c1f1e',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155'
    }
  }
}

export const useEnhancedTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}

export const EnhancedThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system')
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('blue')
  const [isDark, setIsDark] = useState(false)

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches)
      }
    }

    updateSystemTheme()
    mediaQuery.addEventListener('change', updateSystemTheme)
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [theme])

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme
    
    if (savedTheme) {
      setThemeState(savedTheme)
    }
    if (savedColorScheme) {
      setColorSchemeState(savedColorScheme)
    }
  }, [])

  // Update dark mode based on theme
  useEffect(() => {
    switch (theme) {
      case 'light':
        setIsDark(false)
        break
      case 'dark':
        setIsDark(true)
        break
      case 'system':
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
        break
    }
  }, [theme])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const colors = colorSchemes[colorScheme][isDark ? 'dark' : 'light']
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-secondary', colors.secondary)
    root.style.setProperty('--color-accent', colors.accent)
    root.style.setProperty('--color-background', colors.background)
    root.style.setProperty('--color-surface', colors.surface)
    root.style.setProperty('--color-text', colors.text)
    root.style.setProperty('--color-text-secondary', colors.textSecondary)
    root.style.setProperty('--color-border', colors.border)
    
    // Set theme class
    root.classList.toggle('dark', isDark)
    
    // Save preferences
    localStorage.setItem('theme', theme)
    localStorage.setItem('colorScheme', colorScheme)
  }, [theme, colorScheme, isDark])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme)
  }

  const toggleTheme = () => {
    setThemeState(prev => {
      switch (prev) {
        case 'light':
          return 'dark'
        case 'dark':
          return 'system'
        case 'system':
          return 'light'
        default:
          return 'light'
      }
    })
  }

  const themeIcon = isDark ? 
    (props: { className?: string }) => <motion.div {...props}>🌙</motion.div> :
    (props: { className?: string }) => <motion.div {...props}>☀️</motion.div>

  const themeLabel = theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'

  const colors = colorSchemes[colorScheme][isDark ? 'dark' : 'light']

  const value: ThemeContextType = {
    theme,
    colorScheme,
    setTheme,
    setColorScheme,
    toggleTheme,
    themeIcon,
    themeLabel,
    isDark,
    colors
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Theme Toggle Component
interface ThemeToggleProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'switch' | 'dropdown'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = 'md',
  variant = 'button'
}) => {
  const { theme, setTheme, themeIcon, themeLabel, isDark } = useEnhancedTheme()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  if (variant === 'switch') {
    return (
      <div className="flex items-center space-x-3">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </span>
        )}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`relative inline-flex ${sizeClasses[size]} rounded-full border-2 border-gray-300 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <motion.div
            className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center`}
            animate={{ x: isDark ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {themeIcon && React.createElement(themeIcon, { className: 'w-3 h-3' })}
          </motion.div>
        </button>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="system">💻 System</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`${sizeClasses[size]} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {themeIcon && React.createElement(themeIcon, { className: 'w-5 h-5' })}
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {themeLabel}
        </span>
      )}
    </button>
  )
}

// Color Scheme Selector
export const ColorSchemeSelector: React.FC = () => {
  const { colorScheme, setColorScheme } = useEnhancedTheme()

  const schemes = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6' },
    { id: 'green', name: 'Green', color: '#10b981' },
    { id: 'orange', name: 'Orange', color: '#f59e0b' },
    { id: 'pink', name: 'Pink', color: '#ec4899' },
    { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
  ] as const

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Color Scheme
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {schemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => setColorScheme(scheme.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              colorScheme === scheme.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div
              className="w-full h-8 rounded-md mb-2"
              style={{ backgroundColor: scheme.color }}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {scheme.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Theme Preview Component
export const ThemePreview: React.FC = () => {
  const { colors, isDark } = useEnhancedTheme()

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Theme Preview
      </h3>
      <div className="space-y-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
          <div className="flex items-center space-x-3 mb-2">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: colors.text }}
              >
                Sample Card
              </div>
              <div
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                This is how your content will look
              </div>
            </div>
          </div>
          <div
            className="text-xs p-2 rounded"
            style={{ 
              backgroundColor: colors.background,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            Preview text with current theme colors
          </div>
        </div>
      </div>
    </div>
  )
}

export default useEnhancedTheme