/**
 * Integration tests for complete authentication flows
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as forgotPasswordPOST } from '@/app/api/auth/forgot-password/route'
import { POST as resetPasswordPOST } from '@/app/api/auth/reset-password/route'
import { deleteUser, getUserByEmail } from '@/lib/userOperations'
import { hashPassword, verifyPassword } from '@/lib/auth'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-integration'

describe('Authentication Integration Tests', () => {
  const testEmail = 'integration@example.com'
  const testPassword = 'IntegrationTest123!'
  let testUserId: string
  let authToken: string

  afterEach(async () => {
    // Clean up test user if created
    if (testUserId) {
      await deleteUser(testUserId)
      testUserId = ''
      authToken = ''
    }
  })

  describe('Complete Registration Flow', () => {
    it('should complete full registration process', async () => {
      // Step 1: Register user
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(201)
      expect(registerData.user.email).toBe(testEmail)
      expect(registerData.user.id).toBeDefined()
      
      testUserId = registerData.user.id

      // Step 2: Verify user exists in database
      const userInDb = await getUserByEmail(testEmail)
      expect(userInDb).not.toBeNull()
      expect(userInDb!.email).toBe(testEmail)
      expect(userInDb!.id).toBe(testUserId)

      // Step 3: Verify password is hashed correctly
      const userRecord = await getUserByEmail(testEmail)
      expect(userRecord).not.toBeNull()
      // Password hash should not be exposed in regular user queries
      expect(userRecord).not.toHaveProperty('passwordHash')
    })

    it('should prevent duplicate registrations', async () => {
      // Register first user
      const firstRegisterRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const firstResponse = await registerPOST(firstRegisterRequest)
      const firstData = await firstResponse.json()
      testUserId = firstData.user.id

      // Attempt to register same email again
      const secondRegisterRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'DifferentPassword123!',
          confirmPassword: 'DifferentPassword123!'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const secondResponse = await registerPOST(secondRegisterRequest)
      const secondData = await secondResponse.json()

      expect(secondResponse.status).toBe(409)
      expect(secondData.message).toContain('already registered')
    })
  })

  describe('Complete Login Flow', () => {
    beforeEach(async () => {
      // Create test user
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id
    })

    it('should complete full login process', async () => {
      // Step 1: Login with valid credentials
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.user.email).toBe(testEmail)
      expect(loginData.user.id).toBe(testUserId)

      // Step 2: Extract auth token from cookie
      const cookies = loginResponse.headers.get('set-cookie')
      expect(cookies).toContain('auth-token=')
      
      const tokenMatch = cookies?.match(/auth-token=([^;]+)/)
      authToken = tokenMatch ? tokenMatch[1] : ''
      expect(authToken).toBeTruthy()

      // Step 3: Use token to access protected endpoint
      const meRequest = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: { Cookie: `auth-token=${authToken}` }
      })

      const meResponse = await meGET(meRequest)
      const meData = await meResponse.json()

      expect(meResponse.status).toBe(200)
      expect(meData.user.email).toBe(testEmail)
      expect(meData.user.id).toBe(testUserId)
    })

    it('should handle invalid login attempts', async () => {
      // Test wrong password
      const wrongPasswordRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword123!'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const wrongPasswordResponse = await loginPOST(wrongPasswordRequest)
      expect(wrongPasswordResponse.status).toBe(401)

      // Test non-existent user
      const nonExistentRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const nonExistentResponse = await loginPOST(nonExistentRequest)
      expect(nonExistentResponse.status).toBe(401)
    })
  })

  describe('Complete Password Reset Flow', () => {
    beforeEach(async () => {
      // Create test user
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id
    })

    it('should complete full password reset process', async () => {
      // Step 1: Request password reset
      const forgotPasswordRequest = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail }),
        headers: { 'Content-Type': 'application/json' }
      })

      const forgotPasswordResponse = await forgotPasswordPOST(forgotPasswordRequest)
      expect(forgotPasswordResponse.status).toBe(200)

      // Step 2: Verify reset token was set (simulate getting token from email)
      const userRecord = await getUserByEmail(testEmail)
      expect(userRecord).not.toBeNull()
      
      // In a real scenario, we'd get the token from the email
      // For testing, we need to access the database directly to get the token
      const { getUserRecordByEmail } = await import('@/lib/userOperations')
      const userWithToken = await getUserRecordByEmail(testEmail)
      expect(userWithToken?.resetToken).toBeDefined()
      expect(userWithToken?.resetTokenExpiry).toBeDefined()

      const resetToken = userWithToken!.resetToken!

      // Step 3: Reset password with token
      const newPassword = 'NewPassword123!'
      const resetPasswordRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          newPassword: newPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const resetPasswordResponse = await resetPasswordPOST(resetPasswordRequest)
      const resetPasswordData = await resetPasswordResponse.json()

      expect(resetPasswordResponse.status).toBe(200)
      expect(resetPasswordData.message).toContain('successfully reset')

      // Step 4: Verify old password no longer works
      const oldPasswordLoginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const oldPasswordResponse = await loginPOST(oldPasswordLoginRequest)
      expect(oldPasswordResponse.status).toBe(401)

      // Step 5: Verify new password works
      const newPasswordLoginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: newPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const newPasswordResponse = await loginPOST(newPasswordLoginRequest)
      expect(newPasswordResponse.status).toBe(200)

      // Step 6: Verify reset token was cleared
      const userAfterReset = await getUserRecordByEmail(testEmail)
      expect(userAfterReset?.resetToken).toBeUndefined()
      expect(userAfterReset?.resetTokenExpiry).toBeUndefined()
    })

    it('should handle expired reset tokens', async () => {
      // Request password reset
      const forgotPasswordRequest = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail }),
        headers: { 'Content-Type': 'application/json' }
      })

      await forgotPasswordPOST(forgotPasswordRequest)

      // Manually set an expired token
      const { setResetToken } = await import('@/lib/userOperations')
      const expiredDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      await setResetToken(testEmail, 'expired-token', expiredDate)

      // Try to reset password with expired token
      const resetPasswordRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: 'expired-token',
          newPassword: 'NewPassword123!'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const resetPasswordResponse = await resetPasswordPOST(resetPasswordRequest)
      expect(resetPasswordResponse.status).toBe(400)

      const resetPasswordData = await resetPasswordResponse.json()
      expect(resetPasswordData.message).toContain('invalid or expired')
    })
  })

  describe('Session Management Flow', () => {
    beforeEach(async () => {
      // Create and login test user
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id

      // Login to get token
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const loginResponse = await loginPOST(loginRequest)
      const cookies = loginResponse.headers.get('set-cookie')
      const tokenMatch = cookies?.match(/auth-token=([^;]+)/)
      authToken = tokenMatch ? tokenMatch[1] : ''
    })

    it('should complete full session lifecycle', async () => {
      // Step 1: Verify authenticated access works
      const meRequest = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: { Cookie: `auth-token=${authToken}` }
      })

      const meResponse = await meGET(meRequest)
      expect(meResponse.status).toBe(200)

      // Step 2: Logout
      const logoutRequest = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { Cookie: `auth-token=${authToken}` }
      })

      const logoutResponse = await logoutPOST(logoutRequest)
      expect(logoutResponse.status).toBe(200)

      // Verify logout cookie is set
      const logoutCookies = logoutResponse.headers.get('set-cookie')
      expect(logoutCookies).toContain('auth-token=;')

      // Step 3: Verify logout cleared the cookie (token itself is still valid but cookie is cleared)
      // In a real browser, the cookie would be gone, but in tests we need to simulate this
      const meAfterLogoutRequest = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET'
        // No cookie header - simulating cleared cookie
      })

      const meAfterLogoutResponse = await meGET(meAfterLogoutRequest)
      expect(meAfterLogoutResponse.status).toBe(401)
    })
  })

  describe('Password Security Integration', () => {
    it('should properly hash and verify passwords throughout the flow', async () => {
      const plainPassword = 'TestPassword123!'
      
      // Test direct password hashing
      const hash1 = await hashPassword(plainPassword)
      const hash2 = await hashPassword(plainPassword)
      
      // Hashes should be different (due to salt)
      expect(hash1).not.toBe(hash2)
      
      // Both should verify correctly
      expect(await verifyPassword(plainPassword, hash1)).toBe(true)
      expect(await verifyPassword(plainPassword, hash2)).toBe(true)
      
      // Wrong password should not verify
      expect(await verifyPassword('WrongPassword', hash1)).toBe(false)

      // Test through registration flow
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: plainPassword,
          confirmPassword: plainPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      testUserId = registerData.user.id

      // Verify login works with the same password
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: plainPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const loginResponse = await loginPOST(loginRequest)
      expect(loginResponse.status).toBe(200)
    })
  })
})