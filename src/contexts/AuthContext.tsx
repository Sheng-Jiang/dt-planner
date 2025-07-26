'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthContextType } from '@/types/auth'
import { mapApiError, getAuthErrorMessage, AuthError } from '@/lib/errorHandling'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        const authError = mapApiError({ response: { data, status: response.status } })
        const userMessage = getAuthErrorMessage(authError.code, authError.message)
        setError(userMessage)
        throw new Error(userMessage)
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      if (err instanceof Error && err.message !== 'Failed to fetch') {
        // Error already handled above
        throw err
      }

      // Handle network errors
      const authError = mapApiError(err)
      const userMessage = getAuthErrorMessage(authError.code, authError.message)
      setError(userMessage)
      throw new Error(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
      // Even if logout fails on server, clear local state
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, confirmPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        const authError = mapApiError({ response: { data, status: response.status } })
        const userMessage = getAuthErrorMessage(authError.code, authError.message)
        setError(userMessage)
        throw new Error(userMessage)
      }

      // Registration successful - user needs to login
      // Don't automatically log them in for security
    } catch (err) {
      if (err instanceof Error && err.message !== 'Failed to fetch') {
        // Error already handled above
        throw err
      }

      // Handle network errors
      const authError = mapApiError(err)
      const userMessage = getAuthErrorMessage(authError.code, authError.message)
      setError(userMessage)
      throw new Error(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        const authError = mapApiError({ response: { data, status: response.status } })
        const userMessage = getAuthErrorMessage(authError.code, authError.message)
        setError(userMessage)
        throw new Error(userMessage)
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'Failed to fetch') {
        // Error already handled above
        throw err
      }

      // Handle network errors
      const authError = mapApiError(err)
      const userMessage = getAuthErrorMessage(authError.code, authError.message)
      setError(userMessage)
      throw new Error(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        const authError = mapApiError({ response: { data, status: response.status } })
        const userMessage = getAuthErrorMessage(authError.code, authError.message)
        setError(userMessage)
        throw new Error(userMessage)
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'Failed to fetch') {
        // Error already handled above
        throw err
      }

      // Handle network errors
      const authError = mapApiError(err)
      const userMessage = getAuthErrorMessage(authError.code, authError.message)
      setError(userMessage)
      throw new Error(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    isLoading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
