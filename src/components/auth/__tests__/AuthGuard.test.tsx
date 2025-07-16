import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthGuard from '../AuthGuard'

// Mock the AuthContext
const mockAuthContext = {
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
  isLoading: false,
  error: null,
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const TestComponent = () => <div>Protected Content</div>

  it('should render children when user is authenticated', () => {
    mockAuthContext.user = {
      id: '123',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: '2024-01-01T00:00:00.000Z'
    }

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show loading state when authentication is loading', () => {
    mockAuthContext.user = null
    mockAuthContext.isLoading = true

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    mockAuthContext.user = null
    mockAuthContext.isLoading = false

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to custom redirect path when provided', () => {
    mockAuthContext.user = null
    mockAuthContext.isLoading = false

    render(
      <AuthGuard redirectTo="/custom-login">
        <TestComponent />
      </AuthGuard>
    )

    expect(mockPush).toHaveBeenCalledWith('/custom-login')
  })

  it('should show fallback component when user is not authenticated', () => {
    mockAuthContext.user = null
    mockAuthContext.isLoading = false

    const CustomFallback = () => <div>Custom Fallback</div>

    render(
      <AuthGuard fallback={<CustomFallback />}>
        <TestComponent />
      </AuthGuard>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should handle authentication state changes', () => {
    mockAuthContext.user = null
    mockAuthContext.isLoading = false

    const { rerender } = render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')

    // Simulate user logging in
    mockAuthContext.user = {
      id: '123',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: '2024-01-01T00:00:00.000Z'
    }

    rerender(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})