'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { validateAuthForm, formatValidationErrors } from '@/lib/errorHandling'
import { ErrorDisplay, FieldError, SuccessDisplay } from '@/components/auth/ErrorDisplay'

// Prevent static generation for this page
export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({})
  const { resetPassword } = useAuth()

  const validateForm = () => {
    const validationErrors = validateAuthForm({ email })
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

    setIsLoading(true)

    try {
      await resetPassword(email)
      setIsSubmitted(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              If the email exists in our system, we&apos;ve sent you a password reset link.
            </p>
            <div className="mt-6">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                ← Back to sign in
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                fieldErrors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Email address"
            />
            <FieldError error={fieldErrors.email} />
          </div>

          {error && <ErrorDisplay error={error} variant="banner" />}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>

        <div className="text-center space-y-2">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            ← Back to sign in
          </Link>
          <br />
          <Link href="/" className="font-medium text-gray-600 hover:text-gray-500">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
