import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '../types/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshToken: () => Promise<void>
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.data.user)
          } else {
            // Token might be expired, try to refresh
            await refreshToken()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.data.tokens.authToken)
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
        
        // Get user profile with new token
        const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${data.data.tokens.authToken}`
          }
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setUser(profileData.data.user)
        }
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store tokens
      localStorage.setItem('authToken', data.data.tokens.authToken)
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
      
      setUser(data.data.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required')
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Store tokens
      localStorage.setItem('authToken', data.data.tokens.authToken)
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
      
      setUser(data.data.user)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Profile update failed')
      }

      setUser(responseData.data.user)
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
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}