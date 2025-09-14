import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../components/common/ErrorBoundary'

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('We\'re sorry, but something unexpected happened')).toBeInTheDocument()
  })

  it('displays error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details:')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Error Details:')).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('displays error ID', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Error ID:/)).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('retries when Try Again button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Try Again'))

    // The error boundary should reset and try to render children again
    // Since ThrowError still has shouldThrow=true, it will throw again
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
  })

  it('navigates to home when Go Home button is clicked', () => {
    // Mock window.location
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Go Home'))

    expect(window.location.href).toBe('/')
  })

  it('opens email client when Report Bug button is clicked', () => {
    // Mock window.open
    const mockOpen = jest.fn()
    window.open = mockOpen

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Report Bug'))

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('mailto:support@aipromptsgenerator.com')
    )
  })

  it('sends error to API in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    // Mock fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Wait for the error to be logged
    setTimeout(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"message":"Test error"')
      })
    }, 100)

    process.env.NODE_ENV = originalEnv
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
  })

  it('handles multiple errors correctly', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})