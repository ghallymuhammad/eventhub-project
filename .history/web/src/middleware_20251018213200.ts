import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/organizer',
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
  '/verify-email', // Email verification page
  '/test-login', // Added for debugging
  '/login-test-dashboard', // Added for debugging
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

  // For client-side protected routes, we'll let the component handle auth
  // since middleware can't access localStorage directly
  if (isProtectedRoute) {
    // Get token from cookies or headers (server-side auth)
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // Only enforce server-side token check for API routes and server actions
    // Client-side routes will handle auth in the component
    if (token) {
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
    // If no server-side token, let the client component handle the redirect
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
