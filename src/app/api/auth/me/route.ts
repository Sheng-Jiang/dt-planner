import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken } from '@/lib/auth'
import { getUserById } from '@/lib/userOperations'
import { createErrorResponse } from '@/lib/errorHandling'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        createErrorResponse('INVALID_TOKEN', 'Authentication token not found', 401),
        { status: 401 }
      )
    }

    // Verify JWT token
    const payload = verifyJWTToken(token)
    if (!payload) {
      return NextResponse.json(
        createErrorResponse('INVALID_TOKEN', 'Authentication token is invalid or expired', 401),
        { status: 401 }
      )
    }

    // Get current user data
    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND', 'User account no longer exists', 404),
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get current user error:', error)

    return NextResponse.json(
      createErrorResponse('SERVER_ERROR', 'An error occurred while fetching user data', 500),
      { status: 500 }
    )
  }
}
