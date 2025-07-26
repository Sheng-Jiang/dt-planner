/**
 * Error handling utilities for authentication system
 */

export interface AuthError {
  code: string
  message: string
  field?: string
  statusCode?: number
}

export interface ValidationError {
  field: string
  message: string
}

/**
 * Maps API error responses to user-friendly messages
 */
export function mapApiError(error: any): AuthError {
  // Handle network errors
  if (!error.response && error.message) {
    if (error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message:
          'Unable to connect to the server. Please check your internet connection and try again.',
        statusCode: 0,
      }
    }
  }

  // Handle HTTP errors with response data
  if (error.response?.data) {
    const { error: errorCode, message, statusCode } = error.response.data
    return {
      code: errorCode || 'UNKNOWN_ERROR',
      message: message || 'An unexpected error occurred',
      statusCode: statusCode || error.response.status,
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      statusCode: 400,
    }
  }

  // Fallback for unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    statusCode: 500,
  }
}

/**
 * Maps authentication error codes to user-friendly messages
 */
export function getAuthErrorMessage(errorCode: string, defaultMessage?: string): string {
  const errorMessages: Record<string, string> = {
    // Login errors
    INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
    MISSING_CREDENTIALS: 'Please enter both email and password.',
    ACCOUNT_LOCKED: 'Your account has been temporarily locked. Please try again later.',
    ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',

    // Registration errors
    EMAIL_EXISTS:
      'An account with this email already exists. Please use a different email or try logging in.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD:
      'Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.',
    PASSWORD_MISMATCH:
      'Passwords do not match. Please make sure both password fields are identical.',
    MISSING_REQUIRED_FIELDS: 'Please fill in all required fields.',

    // Password reset errors
    INVALID_RESET_TOKEN:
      'This password reset link is invalid or has expired. Please request a new one.',
    EXPIRED_RESET_TOKEN: 'This password reset link has expired. Please request a new one.',
    RESET_TOKEN_USED:
      'This password reset link has already been used. Please request a new one if needed.',
    USER_NOT_FOUND: "If an account with this email exists, we've sent you a password reset link.",

    // Session errors
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
    TOKEN_REFRESH_FAILED: 'Unable to refresh your session. Please log in again.',

    // Network and server errors
    NETWORK_ERROR:
      'Unable to connect to the server. Please check your internet connection and try again.',
    SERVER_ERROR: 'A server error occurred. Please try again in a few moments.',
    SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
    RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',

    // Validation errors
    VALIDATION_ERROR: 'Please check your input and try again.',
    FORM_INVALID: 'Please correct the errors in the form and try again.',

    // Generic errors
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    CLIENT_ERROR: 'There was a problem with your request. Please try again.',
  }

  return errorMessages[errorCode] || defaultMessage || errorMessages['UNKNOWN_ERROR']
}

/**
 * Validates form fields and returns validation errors
 */
export function validateAuthForm(formData: {
  email?: string
  password?: string
  confirmPassword?: string
  currentPassword?: string
}): ValidationError[] {
  const errors: ValidationError[] = []
  const { email, password, confirmPassword, currentPassword } = formData

  // Email validation
  if (email !== undefined) {
    if (!email.trim()) {
      errors.push({ field: 'email', message: 'Email is required' })
    } else if (!isValidEmailFormat(email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' })
    }
  }

  // Password validation
  if (password !== undefined) {
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' })
    } else {
      const passwordErrors = validatePasswordStrength(password)
      if (passwordErrors.length > 0) {
        errors.push({ field: 'password', message: passwordErrors[0] })
      }
    }
  }

  // Current password validation (for password change)
  if (currentPassword !== undefined) {
    if (!currentPassword) {
      errors.push({ field: 'currentPassword', message: 'Current password is required' })
    }
  }

  // Confirm password validation
  if (confirmPassword !== undefined) {
    if (!confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Please confirm your password' })
    } else if (password && password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' })
    }
  }

  return errors
}

/**
 * Validates email format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates password strength and returns error messages
 */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return errors
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formattedErrors: Record<string, string> = {}

  errors.forEach(error => {
    formattedErrors[error.field] = error.message
  })

  return formattedErrors
}

/**
 * Checks if an error is a network connectivity issue
 */
export function isNetworkError(error: any): boolean {
  return (
    !error.response &&
    (error.code === 'NETWORK_ERROR' ||
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.name === 'NetworkError')
  )
}

/**
 * Checks if an error is a server error (5xx)
 */
export function isServerError(error: any): boolean {
  return error.response?.status >= 500 || error.statusCode >= 500 || error.code === 'SERVER_ERROR'
}

/**
 * Checks if an error is a client error (4xx)
 */
export function isClientError(error: any): boolean {
  return (
    (error.response?.status >= 400 && error.response?.status < 500) ||
    (error.statusCode >= 400 && error.statusCode < 500)
  )
}

/**
 * Creates a standardized error response for API endpoints
 */
export function createErrorResponse(
  errorCode: string,
  message: string,
  statusCode: number,
  field?: string
) {
  return {
    error: errorCode,
    message,
    field,
    statusCode,
    timestamp: new Date().toISOString(),
  }
}
