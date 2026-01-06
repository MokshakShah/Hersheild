import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeToken } from './lib/jwt'

export function proxy(request: NextRequest) {
  // Temporarily disabled to test redirects
  return NextResponse.next()
  /*
  const { pathname } = request.nextUrl
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup']
  // Check if the current route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value
  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  // Verify the token
  try {
    const decoded = decodeToken(token)
    if (!decoded) {
      throw new Error('Invalid token')
    }
    // Token is valid, continue
    return NextResponse.next()
  } catch (error) {
    // Token is invalid, redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
