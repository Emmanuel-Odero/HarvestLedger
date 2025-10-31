import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = ['/dashboard', '/harvest', '/finance', '/profile', '/onboarding']
const authRoutes = ['/auth/signin', '/auth/signup', '/auth/trial']
const publicRoutes = ['/', '/about', '/contact']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user has authentication token
  const token = request.cookies.get('auth-token')?.value
  
  // Allow static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If user is not authenticated and trying to access protected routes
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  return NextResponse.next()
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