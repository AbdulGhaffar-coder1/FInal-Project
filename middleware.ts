import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup'];
const authRoutes = ['/login', '/signup'];
const apiAuthRoutes = ['/api/auth/login', '/api/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Allow public API routes
  if (apiAuthRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && token) {
    try {
      verifyToken(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Token invalid, continue
    }
  }

  // Protect private routes
  if (!isPublicRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      verifyToken(token);
      return NextResponse.next();
    } catch {
      // Token invalid, clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth (but exclude /api/auth/me)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /favicon.ico
     */
    '/((?!api/auth/(?!me)|_next|_static|favicon.ico).*)',
  ],
};