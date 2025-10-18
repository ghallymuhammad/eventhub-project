import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/events/create',
  '/events/edit',
  '/checkout',
  '/favorites',
  '/tickets',
  '/admin',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register', 
  '/forgot-password',
  '/test-login', // Added for debugging
  '/',
  '/events',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route === '/events' && pathname.startsWith('/events/') && !pathname.includes('/edit') && !pathname.includes('/create'))
  );

  // Get token from cookies or headers
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
      await jwtVerify(token, secret);
      
      // Token is valid, continue
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid token
      response.cookies.delete('token');
      return response;
    }
  }

  // For public routes or when user is authenticated, continue
  return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
