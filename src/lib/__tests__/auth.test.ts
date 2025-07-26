import {
  hashPassword,
  verifyPassword,
  generateJWTToken,
  verifyJWTToken,
  generateUserId,
  generateResetToken,
  isResetTokenExpired,
  generateResetTokenExpiry,
  isValidEmail,
  isValidPassword,
  getPasswordValidationError,
  getEmailValidationError,
  User,
} from '../auth'

describe('Authentication Utilities', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-01T00:00:00.000Z',
  }

  describe('Password hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)
    })

    test('should verify password correctly', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)
      const isInvalid = await verifyPassword('wrongpassword', hash)

      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })
  })

  describe('JWT tokens', () => {
    test('should generate and verify JWT token', () => {
      const token = generateJWTToken(mockUser)
      const decoded = verifyJWTToken(token)

      expect(token).toBeDefined()
      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(mockUser.id)
      expect(decoded?.email).toBe(mockUser.email)
    })

    test('should return null for invalid token', () => {
      const decoded = verifyJWTToken('invalid-token')
      expect(decoded).toBeNull()
    })
  })

  describe('ID generation', () => {
    test('should generate unique user IDs', () => {
      const id1 = generateUserId()
      const id2 = generateUserId()

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1.length).toBe(36) // UUID v4 length
    })

    test('should generate unique reset tokens', () => {
      const token1 = generateResetToken()
      const token2 = generateResetToken()

      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
      expect(token1.length).toBe(36) // UUID v4 length
    })
  })

  describe('Reset token expiry', () => {
    test('should generate future expiry date', () => {
      const expiry = generateResetTokenExpiry()
      const expiryDate = new Date(expiry)
      const now = new Date()

      expect(expiryDate > now).toBe(true)
    })

    test('should detect expired tokens', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString()
      const futureDate = new Date(Date.now() + 1000).toISOString()

      expect(isResetTokenExpired(pastDate)).toBe(true)
      expect(isResetTokenExpired(futureDate)).toBe(false)
    })
  })

  describe('Validation', () => {
    test('should validate email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })

    test('should validate password strength', () => {
      expect(isValidPassword('12345678')).toBe(true)
      expect(isValidPassword('strongpassword')).toBe(true)
      expect(isValidPassword('1234567')).toBe(false)
      expect(isValidPassword('')).toBe(false)
    })

    test('should return correct validation error messages', () => {
      expect(getPasswordValidationError('1234567')).toBe(
        'Password must be at least 8 characters long'
      )
      expect(getPasswordValidationError('12345678')).toBeNull()

      expect(getEmailValidationError('')).toBe('Email is required')
      expect(getEmailValidationError('invalid')).toBe('Please enter a valid email address')
      expect(getEmailValidationError('test@example.com')).toBeNull()
    })
  })
})
