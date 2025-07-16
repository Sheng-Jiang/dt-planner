import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateJWTToken, isValidEmail } from '@/lib/auth'
import { getUserRecordByEmail, updateLastLogin } from '@/lib/userOperations'
import { createErrorResponse } from '@/lib/errorHandling'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse('MISSING_CREDENTIALS', 'Email and password are required', 400),
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401),
        { status: 401 }
      )
    }

    // Get user record with password hash
    const userRecord = await getUserRecordByEmail(email.toLowerCase().trim())
    if (!userRecord) {
      return NextResponse.json(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401),
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userRecord.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401),
        { status: 401 }
      )
    }

    // Update last login timestamp
    await updateLastLogin(userRecord.id)

    // Generate JWT token
    const user = {
      id: userRecord.id,
      email: userRecord.email,
      createdAt: userRecord.createdAt,
      lastLoginAt: new Date().toISOString()
    }
    const token = generateJWTToken(user)

    // Create response with httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          lastLoginAt: user.lastLoginAt
        }
      },
      { status: 200 }
    )

    // Set httpOnly cookie with JWT token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      createErrorResponse('SERVER_ERROR', 'An error occurred during login', 500),
      { status: 500 }
    )
  }
}