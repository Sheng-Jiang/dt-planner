import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken } from '@/lib/auth'

// Define protected and public routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/demo-auth', // Existing demo auth page should be protected
]

const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

// Routes that should redirect authenticated users away (like login page)
const authRedirectRoutes = [
  '/login',
  '/register',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Check if the current path is public first (more specific)
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // Check if the current path should redirect authenticated users
  const isAuthRedirectRoute = authRedirectRoutes.some(route => 
    pathname === route
  )

  // Check if the current path is protected (only if not public)
  const isProtectedRoute = !isPublicRoute && (
    pathname === '/' || // Exact match for root
    protectedRoutes.some(route => 
      route !== '/' && pathname.startsWith(route)
    )
  )

  // Verify token if it exists
  let isAuthenticated = false
  if (token) {
    const payload = verifyJWTToken(token)
    isAuthenticated = payload !== null
  }

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Handle auth redirect routes (redirect authenticated users away from login/register)
  if (isAuthRedirectRoute && isAuthenticated) {
    // Redirect to home page or return URL
    const returnUrl = request.nextUrl.searchParams.get('returnUrl')
    const redirectUrl = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Handle expired tokens on protected routes
  if (isProtectedRoute && token && !isAuthenticated) {
    // Token exists but is invalid/expired - clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}