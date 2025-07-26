'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { validateAuthForm, formatValidationErrors, validatePasswordStrength } from '@/lib/errorHandling'
import { ErrorDisplay, FieldError } from '@/components/auth/ErrorDisplay'

interface RegisterFormProps {
  onSuccess?: () => void
}

interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ 
    email?: string
    password?: string
    confirmPassword?: string
    general?: string 
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false
  })
  
  const { register } = useAuth()

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback = validatePasswordStrength(password)
    const score = Math.max(0, 5 - feedback.length)
    
    return {
      score,
      feedback,
      isValid: feedback.length === 0
    }
  }

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500'
    if (score <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Weak'
    if (score <= 3) return 'Medium'
    return 'Strong'
  }

  const validateForm = () => {
    const validationErrors = validateAuthForm({ email, password, confirmPassword })
    const formattedErrors = formatValidationErrors(validationErrors)
    
    // Add password strength validation
    if (password && !passwordStrength.isValid) {
      formattedErrors.password = 'Password does not meet minimum requirements'
    }
    
    setErrors(formattedErrors)
    return validationErrors.length === 0 && passwordStrength.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({ general: undefined }) // Only clear general errors, keep field errors

    try {
      await register(email, password, confirmPassword)
      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Create a password"
          />
          <FieldError error={errors.password} />
        </div>
        
        {password && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {getPasswordStrengthText(passwordStrength.score)}
              </span>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                {passwordStrength.feedback.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          <FieldError error={errors.confirmPassword} />
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  )
}