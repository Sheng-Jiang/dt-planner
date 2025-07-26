import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/errorHandling'

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ message: 'Successfully logged out' }, { status: 200 })

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)

    return NextResponse.json(
      createErrorResponse('SERVER_ERROR', 'An error occurred during logout', 500),
      { status: 500 }
    )
  }
}
