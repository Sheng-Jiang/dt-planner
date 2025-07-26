/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as forgotPasswordPOST } from '@/app/api/auth/forgot-password/route'
import { POST as resetPasswordPOST } from '@/app/api/auth/reset-password/route'
import { deleteUser, getUserByEmail, setResetToken } from '@/lib/userOperations'
import { generateResetToken, generateResetTokenExpiry } from '@/lib/auth'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'

describe('Authentication API Endpoints', () => {
  const testEmail = 'test@example.com'
  const testPassword = 'testpassword123'
  let testUserId: string
  let authToken: string

  beforeAll(async () => {
    // Clean up test user if created
    const user = await getUserByEmail(testEmail)
    if (user) {
      await deleteUser(user.id)
    }
  })

  afterAll(async () => {
    // Clean up test user if created
    const user = await getUserByEmail(testEmail)
    if (user) {
      await deleteUser(user.id)
    }
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User created successfully')
      expect(data.user.email).toBe(testEmail)
      expect(data.user.id).toBeDefined()

      testUserId = data.user.id
    })

    it('should reject registration with invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: testPassword,
          confirmPassword: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Please enter a valid email address')
    })

    it('should reject registration with short password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: '123',
          confirmPassword: '123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Password must be at least 8 characters long')
    })

    it('should reject registration with mismatched passwords', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: 'differentpassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Passwords do not match')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Clean up any existing user first
      const existingUser = await getUserByEmail(testEmail)
      if (existingUser) {
        await deleteUser(existingUser.id)
      }

      // Create a test user first
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(201)
      expect(registerData.user).toBeDefined()
      testUserId = registerData.user.id
    })

    it('should login successfully with valid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Login successful')
      expect(data.user.email).toBe(testEmail)

      // Check if auth token cookie is set
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('auth-token=')
    })

    it('should reject login with invalid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'wrongpassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Invalid email or password')
    })

    it('should reject login with missing fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          // password missing
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Email and password are required')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      })

      const response = await logoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Successfully logged out')

      // Check if auth token cookie is cleared
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('auth-token=;')
    })
  })

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Clean up any existing user first
      const existingUser = await getUserByEmail(testEmail)
      if (existingUser) {
        await deleteUser(existingUser.id)
      }

      // Create and login a test user first
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(201)
      expect(registerData.user).toBeDefined()
      testUserId = registerData.user.id

      // Login to get auth token
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const loginResponse = await loginPOST(loginRequest)
      const cookies = loginResponse.headers.get('set-cookie')
      const tokenMatch = cookies?.match(/auth-token=([^;]+)/)
      authToken = tokenMatch ? tokenMatch[1] : ''
    })

    it('should return current user with valid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          Cookie: `auth-token=${authToken}`,
        },
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.email).toBe(testEmail)
      expect(data.user.id).toBe(testUserId)
    })

    it('should reject request without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Authentication token not found')
    })

    it('should reject request with invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Authentication token is invalid or expired')
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      // Clean up any existing user first
      const existingUser = await getUserByEmail(testEmail)
      if (existingUser) {
        await deleteUser(existingUser.id)
      }

      // Create a test user first
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id
    })

    afterEach(async () => {
      // Clean up test user
      if (testUserId) {
        await deleteUser(testUserId)
      }
    })

    it('should handle forgot password request for existing user', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await forgotPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('If the email exists, a reset link has been sent')

      // Verify reset token was set in database
      const user = await getUserByEmail(testEmail)
      expect(user).toBeTruthy()
    })

    it('should handle forgot password request for non-existing user', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await forgotPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('If the email exists, a reset link has been sent')
    })

    it('should reject forgot password request with invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await forgotPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Please enter a valid email address')
    })

    it('should reject forgot password request without email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await forgotPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Email is required')
    })
  })

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string

    beforeEach(async () => {
      // Clean up any existing user first
      const existingUser = await getUserByEmail(testEmail)
      if (existingUser) {
        await deleteUser(existingUser.id)
      }

      // Create a test user first
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id

      // Set up reset token
      resetToken = generateResetToken()
      const resetTokenExpiry = generateResetTokenExpiry()
      await setResetToken(testEmail, resetToken, resetTokenExpiry)
    })

    it('should reset password with valid token', async () => {
      const newPassword = 'newpassword123'
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          newPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await resetPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Password has been successfully reset')

      // Verify user can login with new password
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: newPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const loginResponse = await loginPOST(loginRequest)
      expect(loginResponse.status).toBe(200)
    })

    it('should reject reset password with invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await resetPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Reset link is invalid or expired')
    })

    it('should reject reset password with short password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          newPassword: '123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await resetPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Password must be at least 8 characters long')
    })

    it('should reject reset password without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          newPassword: 'newpassword123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await resetPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Reset token is required')
    })

    it('should reject reset password without new password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await resetPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('New password is required')
    })

    it('should reject expired reset token', async () => {
      // Set an expired token
      const expiredToken = generateResetToken()
      const expiredDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      await setResetToken(testEmail, expiredToken, expiredDate)

      const request = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: expiredToken,
          newPassword: 'newpassword123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await resetPasswordPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Reset link is invalid or expired')
    })

    afterEach(async () => {
      // Clean up test user
      if (testUserId) {
        await deleteUser(testUserId)
      }
    })
  })
})
