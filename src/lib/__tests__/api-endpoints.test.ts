/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { deleteUser } from '@/lib/userOperations'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'

describe('Authentication API Endpoints', () => {
  const testEmail = 'test@example.com'
  const testPassword = 'testpassword123'
  let testUserId: string
  let authToken: string

  afterEach(async () => {
    // Clean up test user if created
    if (testUserId) {
      await deleteUser(testUserId)
      testUserId = ''
    }
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
          confirmPassword: testPassword
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
          confirmPassword: '123'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
          confirmPassword: 'differentpassword'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Passwords do not match')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user first
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id
    })

    it('should login successfully with valid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
          email: testEmail
          // password missing
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
        method: 'POST'
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
      // Create and login a test user first
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id

      // Login to get auth token
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
          Cookie: `auth-token=${authToken}`
        }
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.email).toBe(testEmail)
      expect(data.user.id).toBe(testUserId)
    })

    it('should reject request without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET'
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
          Cookie: 'auth-token=invalid-token'
        }
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Authentication token is invalid or expired')
    })
  })
})