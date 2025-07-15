import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, isValidEmail, isValidPassword } from '@/lib/auth'
import { createUser } from '@/lib/userOperations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Email, password, and confirm password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email', message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password', message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password mismatch', message: 'Passwords do not match' },
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
        { error: 'Email exists', message: 'Email already registered' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}