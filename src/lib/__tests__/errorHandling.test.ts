import {
  mapApiError,
  getAuthErrorMessage,
  validateAuthForm,
  isValidEmailFormat,
  validatePasswordStrength,
  formatValidationErrors,
  isNetworkError,
  isServerError,
  isClientError,
  createErrorResponse
} from '../errorHandling'

describe('Error Handling Utilities', () => {
  describe('mapApiError', () => {
    it('should map network errors correctly', () => {
      const networkError = { message: 'fetch failed' }
      const result = mapApiError(networkError)

      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.message).toContain('Unable to connect to the server')
      expect(result.statusCode).toBe(0)
    })

    it('should map HTTP errors with response data', () => {
      const httpError = {
        response: {
          data: {
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            statusCode: 401
          },
          status: 401
        }
      }
      const result = mapApiError(httpError)

      expect(result.code).toBe('INVALID_CREDENTIALS')
      expect(result.message).toBe('Invalid email or password')
      expect(result.statusCode).toBe(401)
    })

    it('should handle standard Error objects', () => {
      const error = new Error('Something went wrong')
      const result = mapApiError(error)

      expect(result.code).toBe('CLIENT_ERROR')
      expect(result.message).toBe('Something went wrong')
      expect(result.statusCode).toBe(400)
    })

    it('should provide fallback for unknown errors', () => {
      const unknownError = { someProperty: 'value' }
      const result = mapApiError(unknownError)

      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('An unexpected error occurred. Please try again.')
      expect(result.statusCode).toBe(500)
    })
  })

  describe('getAuthErrorMessage', () => {
    it('should return correct message for known error codes', () => {
      expect(getAuthErrorMessage('INVALID_CREDENTIALS')).toBe(
        'Invalid email or password. Please check your credentials and try again.'
      )
      expect(getAuthErrorMessage('EMAIL_EXISTS')).toBe(
        'An account with this email already exists. Please use a different email or try logging in.'
      )
      expect(getAuthErrorMessage('SESSION_EXPIRED')).toBe(
        'Your session has expired. Please log in again.'
      )
    })

    it('should return default message for unknown error codes', () => {
      expect(getAuthErrorMessage('UNKNOWN_CODE')).toBe(
        'An unexpected error occurred. Please try again.'
      )
    })

    it('should use provided default message', () => {
      const customDefault = 'Custom error message'
      expect(getAuthErrorMessage('UNKNOWN_CODE', customDefault)).toBe(customDefault)
    })
  })

  describe('validateAuthForm', () => {
    it('should validate email field correctly', () => {
      const errors = validateAuthForm({ email: '' })
      expect(errors).toContainEqual({ field: 'email', message: 'Email is required' })

      const invalidEmailErrors = validateAuthForm({ email: 'invalid-email' })
      expect(invalidEmailErrors).toContainEqual({ 
        field: 'email', 
        message: 'Please enter a valid email address' 
      })

      const validEmailErrors = validateAuthForm({ email: 'test@example.com' })
      expect(validEmailErrors.filter(e => e.field === 'email')).toHaveLength(0)
    })

    it('should validate password field correctly', () => {
      const errors = validateAuthForm({ password: '' })
      expect(errors).toContainEqual({ field: 'password', message: 'Password is required' })

      const weakPasswordErrors = validateAuthForm({ password: '123' })
      expect(weakPasswordErrors.some(e => e.field === 'password')).toBe(true)

      const strongPasswordErrors = validateAuthForm({ password: 'StrongPass123!' })
      expect(strongPasswordErrors.filter(e => e.field === 'password')).toHaveLength(0)
    })

    it('should validate confirm password field correctly', () => {
      const errors = validateAuthForm({ 
        password: 'password123', 
        confirmPassword: '' 
      })
      expect(errors).toContainEqual({ 
        field: 'confirmPassword', 
        message: 'Please confirm your password' 
      })

      const mismatchErrors = validateAuthForm({ 
        password: 'password123', 
        confirmPassword: 'different123' 
      })
      expect(mismatchErrors).toContainEqual({ 
        field: 'confirmPassword', 
        message: 'Passwords do not match' 
      })

      const matchingErrors = validateAuthForm({ 
        password: 'StrongPass123!', 
        confirmPassword: 'StrongPass123!' 
      })
      expect(matchingErrors.filter(e => e.field === 'confirmPassword')).toHaveLength(0)
    })

    it('should validate current password field correctly', () => {
      const errors = validateAuthForm({ currentPassword: '' })
      expect(errors).toContainEqual({ 
        field: 'currentPassword', 
        message: 'Current password is required' 
      })

      const validErrors = validateAuthForm({ currentPassword: 'currentpass' })
      expect(validErrors.filter(e => e.field === 'currentPassword')).toHaveLength(0)
    })
  })

  describe('isValidEmailFormat', () => {
    it('should validate email formats correctly', () => {
      expect(isValidEmailFormat('test@example.com')).toBe(true)
      expect(isValidEmailFormat('user@domain.co.uk')).toBe(true)
      expect(isValidEmailFormat('user.name+tag@example.com')).toBe(true)
      
      expect(isValidEmailFormat('invalid-email')).toBe(false)
      expect(isValidEmailFormat('test@')).toBe(false)
      expect(isValidEmailFormat('@example.com')).toBe(false)
      expect(isValidEmailFormat('')).toBe(false)
      expect(isValidEmailFormat('  test@example.com  ')).toBe(true) // Should trim
    })
  })

  describe('validatePasswordStrength', () => {
    it('should validate password length', () => {
      const errors = validatePasswordStrength('1234567')
      expect(errors).toContain('Password must be at least 8 characters long')

      const validLength = validatePasswordStrength('12345678')
      expect(validLength.filter(e => e.includes('8 characters'))).toHaveLength(0)
    })

    it('should validate password character requirements', () => {
      const noLowercase = validatePasswordStrength('PASSWORD123!')
      expect(noLowercase).toContain('Password must contain at least one lowercase letter')

      const noUppercase = validatePasswordStrength('password123!')
      expect(noUppercase).toContain('Password must contain at least one uppercase letter')

      const noNumber = validatePasswordStrength('Password!')
      expect(noNumber).toContain('Password must contain at least one number')

      const noSpecial = validatePasswordStrength('Password123')
      expect(noSpecial).toContain('Password must contain at least one special character')

      const strongPassword = validatePasswordStrength('StrongPass123!')
      expect(strongPassword).toHaveLength(0)
    })
  })

  describe('formatValidationErrors', () => {
    it('should format validation errors correctly', () => {
      const errors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is too weak' }
      ]

      const formatted = formatValidationErrors(errors)
      expect(formatted).toEqual({
        email: 'Email is required',
        password: 'Password is too weak'
      })
    })
  })

  describe('Error type checking functions', () => {
    it('should identify network errors', () => {
      expect(isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true)
      expect(isNetworkError({ message: 'fetch failed' })).toBe(true)
      expect(isNetworkError({ name: 'NetworkError' })).toBe(true)
      expect(isNetworkError({ response: { status: 500 } })).toBe(false)
    })

    it('should identify server errors', () => {
      expect(isServerError({ response: { status: 500 } })).toBe(true)
      expect(isServerError({ statusCode: 503 } )).toBe(true)
      expect(isServerError({ code: 'SERVER_ERROR' })).toBe(true)
      expect(isServerError({ response: { status: 400 } })).toBe(false)
    })

    it('should identify client errors', () => {
      expect(isClientError({ response: { status: 400 } })).toBe(true)
      expect(isClientError({ statusCode: 404 })).toBe(true)
      expect(isClientError({ response: { status: 500 } })).toBe(false)
      expect(isClientError({ statusCode: 500 })).toBe(false)
    })
  })

  describe('createErrorResponse', () => {
    it('should create standardized error response', () => {
      const response = createErrorResponse('INVALID_INPUT', 'Invalid data', 400, 'email')

      expect(response.error).toBe('INVALID_INPUT')
      expect(response.message).toBe('Invalid data')
      expect(response.statusCode).toBe(400)
      expect(response.field).toBe('email')
      expect(response.timestamp).toBeDefined()
      expect(new Date(response.timestamp)).toBeInstanceOf(Date)
    })

    it('should create error response without field', () => {
      const response = createErrorResponse('SERVER_ERROR', 'Internal error', 500)

      expect(response.error).toBe('SERVER_ERROR')
      expect(response.message).toBe('Internal error')
      expect(response.statusCode).toBe(500)
      expect(response.field).toBeUndefined()
      expect(response.timestamp).toBeDefined()
    })
  })
})