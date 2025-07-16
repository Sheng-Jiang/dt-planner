'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { validateAuthForm, formatValidationErrors } from '@/lib/errorHandling'
import { ErrorDisplay, FieldError, SuccessDisplay } from '@/components/auth/ErrorDisplay'

// Prevent static generation for this page
export const dynamic = 'force-dynamic'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [token, setToken] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setError('Invalid or missing reset token')
      return
    }
    setToken(tokenParam)
  }, [searchParams])

  const validateForm = () => {
    const validationErrors = validateAuthForm({ password, confirmPassword })
    const formattedErrors = formatValidationErrors(validationErrors)
    
    setFieldErrors(formattedErrors)
    return validationErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)

    try {
      await updatePassword(token, password)
      setIsSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Password updated successfully
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been updated. You will be redirected to the login page shortly.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Go to sign in →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This password reset link is invalid or has expired.
            </p>
            <div className="mt-6 space-y-2">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Request a new reset link
              </Link>
              <br />
              <Link
                href="/login"
                className="font-medium text-gray-600 hover:text-gray-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="New password"
              />
              <FieldError error={fieldErrors.password} />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              <FieldError error={fieldErrors.confirmPassword} />
            </div>
          </div>

          {error && (
            <ErrorDisplay error={error} variant="banner" />
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !token}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}