import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Initialize Response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Supabase SSR client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(cookieName: string) {
          return request.cookies.get(cookieName)?.value;
        },
        set(cookieName: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name: cookieName,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set(cookieName, value, options);
        },
        remove(cookieName: string, options: CookieOptions) {
          request.cookies.set({
            name: cookieName,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set(cookieName, '', options);
        },
      },
    }
  );

  // 3. Resolve user session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error('Error verifying user in middleware:', error);
  }

  // 4. Subdomain & Routing Logic
  const rootDomain = 'zen.com';
  const appDomain = `app.${rootDomain}`;
  const isLocal = hostname.includes('localhost');
  const isAppDomain = hostname === appDomain || isLocal;

  // If visiting the root or home page on app subdomain/localhost:
  if (isAppDomain && (pathname === '/' || pathname === '/home')) {
    if (user) {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
    // If not authenticated, let them see the landing page
    return response;
  }

  // Redirect main domain requests for app zones to the app subdomain
  if (!isLocal && (hostname === rootDomain || hostname === `www.${rootDomain}`)) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/calendar')) {
      return NextResponse.redirect(new URL(`https://${appDomain}${pathname}`, request.url));
    }
  }

  // 5. Protected Routes Check
  const isLoginPage = pathname.startsWith('/login');
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/calendar') || 
    pathname.startsWith('/customers') || 
    pathname.startsWith('/services') || 
    pathname.startsWith('/settings');

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (manifest file)
     * - Any static file in public with an extension (e.g., zen-logo.svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};

