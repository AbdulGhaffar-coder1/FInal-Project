import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

const publicRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // ✅ NEVER touch API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect logged-in users away from login/signup
  if (isPublicRoute && token) {
    try {
      verifyToken(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // invalid token → continue
    }
  }

  // Protect private pages
  if (!isPublicRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      verifyToken(token);
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico).*)',
  ],
};
