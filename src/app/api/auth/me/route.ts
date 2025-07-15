import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken } from '@/lib/auth'
import { getUserById } from '@/lib/userOperations'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token', message: 'Authentication token not found' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const payload = verifyJWTToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token', message: 'Authentication token is invalid or expired' },
        { status: 401 }
      )
    }

    // Get current user data
    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', message: 'User account no longer exists' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get current user error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'An error occurred while fetching user data' },
      { status: 500 }
    )
  }
}