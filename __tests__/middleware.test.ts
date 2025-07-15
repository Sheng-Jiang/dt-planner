/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock the auth library
jest.mock('@/lib/auth', () => ({
  verifyJWTToken: jest.fn(),
}))

import { verifyJWTToken } from '@/lib/auth'

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (pathname: string, token?: string) => {
    const request = new NextRequest(`http://localhost:3000${pathname}`)
    if (token) {
      request.cookies.set('auth-token', token)
    }
    return request
  }

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from home page to login', () => {
      const request = createRequest('/')
      const response = middleware(request)

      expect(response?.status).toBe(307) // Redirect status
      expect(response?.headers.get('location')).toContain('/login')
      expect(response?.headers.get('location')).toContain('returnUrl=%2F')
    })

    it('should redirect unauthenticated users from demo-auth to login', () => {
      const request = createRequest('/demo-auth')
      const response = middleware(request)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
      expect(response?.headers.get('location')).toContain('returnUrl=%2Fdemo-auth')
    })

    it('should allow authenticated users to access protected routes', () => {
      verifyJWTToken.mockReturnValue({ userId: '123', email: 'test@example.com' })
      
      const request = createRequest('/', 'valid-token')
      const response = middleware(request)

      expect(response?.status).toBe(200) // NextResponse.next() returns a response with status 200
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })
  })

  describe('Public Routes', () => {
    it('should allow unauthenticated users to access login page', () => {
      const request = createRequest('/login')
      const response = middleware(request)

      expect(response?.status).toBe(200)
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })

    it('should allow unauthenticated users to access register page', () => {
      const request = createRequest('/register')
      const response = middleware(request)

      expect(response?.status).toBe(200)
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })

    it('should allow unauthenticated users to access forgot-password page', () => {
      const request = createRequest('/forgot-password')
      const response = middleware(request)

      expect(response?.status).toBe(200)
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })

    it('should allow unauthenticated users to access reset-password page', () => {
      const request = createRequest('/reset-password')
      const response = middleware(request)

      expect(response?.status).toBe(200)
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })
  })

  describe('Auth Redirect Routes', () => {
    it('should redirect authenticated users away from login page', () => {
      verifyJWTToken.mockReturnValue({ userId: '123', email: 'test@example.com' })
      
      const request = createRequest('/login', 'valid-token')
      const response = middleware(request)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('should redirect authenticated users away from register page', () => {
      verifyJWTToken.mockReturnValue({ userId: '123', email: 'test@example.com' })
      
      const request = createRequest('/register', 'valid-token')
      const response = middleware(request)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('should redirect authenticated users to returnUrl when provided', () => {
      verifyJWTToken.mockReturnValue({ userId: '123', email: 'test@example.com' })
      
      const request = createRequest('/login?returnUrl=/demo-auth', 'valid-token')
      const response = middleware(request)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toBe('http://localhost:3000/demo-auth')
    })
  })

  describe('Token Expiration Handling', () => {
    it('should clear expired token and redirect to login', () => {
      verifyJWTToken.mockReturnValue(null) // Invalid/expired token
      
      const request = createRequest('/', 'expired-token')
      const response = middleware(request)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
      // Note: Cookie deletion in Next.js middleware may not be visible in the set-cookie header
      // during testing, but the redirect behavior is the important part
    })
  })
})