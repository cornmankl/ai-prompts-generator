import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '../types/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token && token.startsWith('demo-token-')) {
          // Demo mode - restore user from localStorage
          const savedUser = localStorage.getItem('demoUser')
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('demoUser')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Demo mode - accept any email/password combination
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create demo user data
      const userData: User = {
        id: '1',
        email: email,
        name: email.split('@')[0] || 'Demo User',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0] || 'User')}&background=0ea5e9&color=fff`,
        role: 'user',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        }
      }

      // Store demo token and user data
      const demoToken = 'demo-token-' + Date.now()
      localStorage.setItem('authToken', demoToken)
      localStorage.setItem('demoUser', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      // Demo mode - accept any registration
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required')
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create demo user data
      const userData: User = {
        id: '1',
        email: email,
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`,
        role: 'user',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        }
      }

      // Store demo token and user data
      const demoToken = 'demo-token-' + Date.now()
      localStorage.setItem('authToken', demoToken)
      localStorage.setItem('demoUser', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('demoUser')
    setUser(null)
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Profile update failed')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
