'use client'

import React from 'react'
import { AuthError, isNetworkError, isServerError } from '@/lib/errorHandling'

interface ErrorDisplayProps {
  error: string | AuthError | null
  className?: string
  showRetry?: boolean
  onRetry?: () => void
  variant?: 'inline' | 'banner' | 'modal'
}

/**
 * Reusable error display component for authentication forms
 */
export function ErrorDisplay({ 
  error, 
  className = '', 
  showRetry = false, 
  onRetry,
  variant = 'inline'
}: ErrorDisplayProps) {
  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message
  const errorCode = typeof error === 'object' ? error.code : undefined
  
  // Determine error type for styling
  const isNetwork = typeof error === 'object' && isNetworkError(error)
  const isServer = typeof error === 'object' && isServerError(error)
  
  const getErrorIcon = () => {
    if (isNetwork) {
      return (
        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
    
    if (isServer) {
      return (
        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
    
    return (
      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  }

  const getErrorStyles = () => {
    const baseStyles = "rounded-md p-4"
    
    if (isNetwork) {
      return `${baseStyles} bg-yellow-50 border border-yellow-200`
    }
    
    if (isServer) {
      return `${baseStyles} bg-red-50 border border-red-200`
    }
    
    return `${baseStyles} bg-red-50 border border-red-200`
  }

  const getTextStyles = () => {
    if (isNetwork) return "text-yellow-800"
    if (isServer) return "text-red-800"
    return "text-red-800"
  }

  if (variant === 'banner') {
    return (
      <div className={`${getErrorStyles()} ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {getErrorIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTextStyles()}`}>
              {errorMessage}
            </p>
            {showRetry && onRetry && (
              <div className="mt-2">
                <button
                  onClick={onRetry}
                  className={`text-sm underline hover:no-underline ${getTextStyles()}`}
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              {getErrorIcon()}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              Error
            </h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">
                {errorMessage}
              </p>
            </div>
            <div className="items-center px-4 py-3">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-hover hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mr-2"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default inline variant
  return (
    <div className={`${getErrorStyles()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3">
          <p className={`text-sm ${getTextStyles()}`}>
            {errorMessage}
          </p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className={`mt-2 text-sm underline hover:no-underline ${getTextStyles()}`}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Field-specific error display for form validation
 */
interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null

  return (
    <p className={`mt-2 text-sm text-red-600 ${className}`}>
      {error}
    </p>
  )
}

/**
 * Success message display component
 */
interface SuccessDisplayProps {
  message: string | null
  className?: string
  variant?: 'inline' | 'banner'
}

export function SuccessDisplay({ message, className = '', variant = 'inline' }: SuccessDisplayProps) {
  if (!message) return null

  const successIcon = (
    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )

  if (variant === 'banner') {
    return (
      <div className={`rounded-md bg-green-50 border border-green-200 p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {successIcon}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-md bg-green-50 border border-green-200 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {successIcon}
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-800">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}