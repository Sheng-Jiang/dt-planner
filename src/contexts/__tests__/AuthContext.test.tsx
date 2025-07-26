import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth()

  const handleLogin = async () => {
    try {
      await auth.login('test@example.com', 'password123')
    } catch (error) {
      // Error is already handled by the context
    }
  }

  const handleRegister = async () => {
    try {
      await auth.register('test@example.com', 'password123')
    } catch (error) {
      // Error is already handled by the context
    }
  }

  const handleResetPassword = async () => {
    try {
      await auth.resetPassword('test@example.com')
    } catch (error) {
      // Error is already handled by the context
    }
  }

  const handleUpdatePassword = async () => {
    try {
      await auth.updatePassword('token123', 'newpassword123')
    } catch (error) {
      // Error is already handled by the context
    }
  }

  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : 'No user'}</div>
      <div data-testid="loading">{auth.isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{auth.error || 'No error'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={handleResetPassword}>Reset Password</button>
      <button onClick={handleUpdatePassword}>Update Password</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  const renderWithProvider = () => {
    return render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
  }

  describe('Initial State', () => {
    it('should initialize with loading state and check auth', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

      renderWithProvider()

      // Should start in loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')

      // Wait for auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
        expect(screen.getByTestId('error')).toHaveTextContent('No error')
      })
    })

    it('should check for existing session on mount', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: '2024-01-01T00:00:00.000Z',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })

      renderWithProvider()

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })
    })
  })

  describe('Login', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: '2024-01-01T00:00:00.000Z',
      }

      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Mock login call (succeeds)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser, message: 'Login successful' }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const loginButton = screen.getByText('Login')

      await act(async () => {
        loginButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('error')).toHaveTextContent('No error')
      })

      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    })

    it('should handle login failure', async () => {
      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Mock login call (fails)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials',
          }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const loginButton = screen.getByText('Login')

      await act(async () => {
        try {
          loginButton.click()
        } catch (error) {
          // Expected to throw
        }
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Invalid email or password. Please check your credentials and try again.'
        )
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
      })
    })

    it('should show loading state during login', async () => {
      // Mock initial auth check (fails)
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

      let resolvePromise: (value: any) => void
      const loginPromise = new Promise(resolve => {
        resolvePromise = resolve
      })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      // Mock login call with delayed promise
      ;(fetch as jest.Mock).mockReturnValueOnce(loginPromise)

      const loginButton = screen.getByText('Login')

      act(() => {
        loginButton.click()
      })

      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')

      // Resolve the promise
      act(() => {
        resolvePromise!({
          ok: true,
          json: async () => ({ user: { email: 'test@example.com' } }),
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
    })
  })

  describe('Register', () => {
    it('should handle successful registration', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: '2024-01-01T00:00:00.000Z',
      }

      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Mock register call (succeeds)
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ user: mockUser, message: 'User created successfully' }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const registerButton = screen.getByText('Register')

      await act(async () => {
        registerButton.click()
      })

      // Registration doesn't automatically log in or redirect
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
        expect(screen.getByTestId('error')).toHaveTextContent('No error')
      })

      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    })

    it('should handle registration failure', async () => {
      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Mock register call (fails)
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({
            error: 'EMAIL_EXISTS',
            message: 'Email already exists',
          }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const registerButton = screen.getByText('Register')

      await act(async () => {
        registerButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'An account with this email already exists. Please use a different email or try logging in.'
        )
      })
    })
  })

  describe('Logout', () => {
    it('should handle successful logout', async () => {
      // First set up a logged-in state
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: '2024-01-01T00:00:00.000Z',
      }

      ;(fetch as jest.Mock)
        // Mock initial auth check (succeeds - user is logged in)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        })
        // Mock logout call (succeeds)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Successfully logged out' }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete (user should be logged in)
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      // Now logout
      const logoutButton = screen.getByText('Logout')
      await act(async () => {
        logoutButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
      })

      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    })
  })

  describe('Password Reset', () => {
    it('should handle successful password reset request', async () => {
      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Mock reset password call (succeeds)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Reset email sent' }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const resetButton = screen.getByText('Reset Password')

      await act(async () => {
        resetButton.click()
      })

      expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      })
    })

    it('should handle password update with token', async () => {
      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Mock update password call (succeeds)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Password updated successfully' }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const updateButton = screen.getByText('Update Password')

      await act(async () => {
        updateButton.click()
      })

      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'token123',
          newPassword: 'newpassword123',
        }),
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Mock login call (network error - use 'Failed to fetch' which is the standard fetch error)
        .mockRejectedValueOnce(new Error('Failed to fetch'))

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const loginButton = screen.getByText('Login')

      await act(async () => {
        loginButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Unable to connect to the server. Please check your internet connection and try again.'
        )
      })
    })

    it('should clear errors on successful operations', async () => {
      // Mock initial auth check (fails)
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // First cause an error
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        // Then successful operation
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: { email: 'test@example.com' } }),
        })

      renderWithProvider()

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      const loginButton = screen.getByText('Login')

      await act(async () => {
        loginButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Unable to connect to the server. Please check your internet connection and try again.'
        )
      })

      // Then perform successful operation
      await act(async () => {
        loginButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('No error')
      })
    })
  })
})
