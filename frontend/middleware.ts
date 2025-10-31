import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = ['/dashboard', '/harvest', '/finance', '/profile', '/onboarding']
const authRoutes = ['/auth/signin', '/auth/signup', '/auth/trial']
const registrationRoutes = ['/auth/verify-email', '/auth/complete-registration']
const publicRoutes = ['/', '/about', '/contact']

// Role-based route access
const farmerRoutes = ['/harvest', '/finance']
const buyerRoutes = ['/finance']

interface JWTPayload {
  sub?: string
  role?: string
  registration_complete?: boolean
  email_verified?: boolean
}

function decodeToken(token: string): JWTPayload | null {
  try {
    // Decode JWT without verification (full verification happens in backend)
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    // Decode base64url payload
    const payload = parts[1]
    // Add padding if needed
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    // Replace base64url characters with base64
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    
    // Decode base64
    const decoded = JSON.parse(
      Buffer.from(base64, 'base64').toString('utf-8')
    ) as JWTPayload
    
    return decoded
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Check if user has authentication token
  const token = request.cookies.get('auth-token')?.value
  const tokenPayload = token ? decodeToken(token) : null
  
  // Check if user is in registration flow
  const isInRegistrationFlow = registrationRoutes.some(route => pathname.startsWith(route))
  const isRegistrationComplete = tokenPayload?.registration_complete === true
  
  // If user is authenticated and registration complete, redirect from auth/registration pages to dashboard
  if (token && isRegistrationComplete) {
    if (authRoutes.some(route => pathname.startsWith(route)) || isInRegistrationFlow) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // If user is authenticated but registration incomplete, allow registration routes
  if (token && !isRegistrationComplete) {
    // Allow registration flow routes
    if (isInRegistrationFlow) {
      return NextResponse.next()
    }
    // Redirect to registration if trying to access protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/auth/verify-email', request.url)
      if (tokenPayload?.email_verified !== true) {
        return NextResponse.redirect(redirectUrl)
      } else {
        return NextResponse.redirect(new URL('/auth/complete-registration', request.url))
      }
    }
    return NextResponse.next()
  }
  
  // If user is not authenticated and trying to access protected or registration routes
  if (!token && (protectedRoutes.some(route => pathname.startsWith(route)) || isInRegistrationFlow)) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Role-based access control (if token exists and registration complete)
  if (token && isRegistrationComplete && tokenPayload?.role) {
    const userRole = tokenPayload.role.toLowerCase()
    
    // Check farmer-only routes
    if (farmerRoutes.some(route => pathname.startsWith(route)) && userRole !== 'farmer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Check buyer-only routes
    if (buyerRoutes.some(route => pathname.startsWith(route)) && userRole !== 'buyer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
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