import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host');

  // 1. Subdomain / Routing Logic
  const appHostname = 'app.tusalondeunas.com';
  const isAppDomain = hostname === appHostname || hostname?.includes('localhost');

  if (isAppDomain) {
    // Rewrite root to dashboard for App domain
    if (pathname === '/' || pathname === '/home') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
  }

  // 2. Auth Session Management (Supabase)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const isRootPage = pathname === '/';
    const isLoginPage = pathname.startsWith('/login');
    const isAuthPage = isLoginPage || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');

    // A. If authenticated and visiting root, go to dashboard (only on App domain or if user wants)
    if (user && isRootPage && isAppDomain) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // B. If NOT authenticated and visiting a protected page, go to login
    // Protected pages are anything that isn't root or an auth page
    if (!user && !isRootPage && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    console.error('Auth error in middleware:', error);
    // Avoid redirecting to login if we are already on an auth page to prevent loops
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
