import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, isValidEmail, isValidPassword } from '@/lib/auth'
import { createUser } from '@/lib/userOperations'
import { createErrorResponse } from '@/lib/errorHandling'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        createErrorResponse('MISSING_REQUIRED_FIELDS', 'Email, password, and confirm password are required', 400),
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        createErrorResponse('INVALID_EMAIL', 'Please enter a valid email address', 400),
        { status: 400 }
      )
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        createErrorResponse('INVALID_PASSWORD', 'Password must be at least 8 characters long', 400),
        { status: 400 }
      )
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        createErrorResponse('PASSWORD_MISMATCH', 'Passwords do not match', 400),
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await createUser(email.toLowerCase().trim(), passwordHash)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json(
        createErrorResponse('EMAIL_EXISTS', 'Email already registered', 409),
        { status: 409 }
      )
    }

    return NextResponse.json(
      createErrorResponse('SERVER_ERROR', 'An error occurred during registration', 500),
      { status: 500 }
    )
  }
}