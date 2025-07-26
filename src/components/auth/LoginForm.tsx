'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { validateAuthForm, formatValidationErrors } from '@/lib/errorHandling'
import { ErrorDisplay, FieldError } from '@/components/auth/ErrorDisplay'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const { login } = useAuth()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Password validation (only check if required for login)
    if (!password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({ general: undefined }) // Only clear general errors, keep field errors

    try {
      await login(email, password)
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password'
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          <FieldError error={errors.email} />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          <FieldError error={errors.password} />
        </div>
      </div>

      {errors.general && (
        <ErrorDisplay error={errors.general} variant="banner" />
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  )
}