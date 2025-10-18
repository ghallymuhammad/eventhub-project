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

// Client-side protected routes (handled by components, not middleware)
const clientProtectedRoutes = [
  '/organizer',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register', 
  '/forgot-password',
  '/verify-email', // Email verification page
  '/test-login', // Added for debugging
  '/login-test-dashboard', // Added for debugging
  '/',
  '/events',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is client-side protected (let component handle auth)
  const isClientProtectedRoute = clientProtectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isClientProtectedRoute) {
    // Let the component handle authentication for these routes
    return NextResponse.next();
  }
  
  // Check if the route is server-side protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route === '/events' && pathname.startsWith('/events/') && !pathname.includes('/edit') && !pathname.includes('/create'))
  );

  // For server-side protected routes, we'll check cookies/headers
  if (isProtectedRoute) {
    // Get token from cookies or headers (server-side auth)
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
      await jwtVerify(token, secret);
    } catch (error) {
      // Token is invalid, clear cookie and redirect
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }
  }

  // For public routes or when continuing to protected routes, continue
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
