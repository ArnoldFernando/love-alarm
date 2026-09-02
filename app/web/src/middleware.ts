import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/forgot-password', '/privacy', '/terms']

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Admin routes - check for auth token in localStorage via cookie
  // Note: Since we're using client-side auth (localStorage), we can't fully validate here
  // The actual auth check happens in the admin layout component

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
