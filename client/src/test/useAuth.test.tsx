import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth, AuthProvider } from '../hooks/useAuth'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with no user', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('should login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    }

    const mockTokens = {
      authToken: 'mock-auth-token',
      refreshToken: 'mock-refresh-token'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens
        }
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(localStorage.getItem('authToken')).toBe(mockTokens.authToken)
    expect(localStorage.getItem('refreshToken')).toBe(mockTokens.refreshToken)
  })

  it('should handle login error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid credentials'
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrongpassword')
      })
    ).rejects.toThrow('Invalid credentials')
  })

  it('should register successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    }

    const mockTokens = {
      authToken: 'mock-auth-token',
      refreshToken: 'mock-refresh-token'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens
        }
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(localStorage.getItem('authToken')).toBe(mockTokens.authToken)
    expect(localStorage.getItem('refreshToken')).toBe(mockTokens.refreshToken)
  })

  it('should logout successfully', async () => {
    // Set up initial state with user logged in
    localStorage.setItem('authToken', 'mock-token')
    localStorage.setItem('refreshToken', 'mock-refresh-token')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })
})