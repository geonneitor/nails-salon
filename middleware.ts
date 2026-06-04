import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

  // Refresh session and check authentication
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const isRootPage = request.nextUrl.pathname === '/';

    // 1. If authenticated and visiting root, go to dashboard
    if (user && isRootPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. If NOT authenticated and visiting a protected page (anything other than root/login), go to login
    if (!user && !isRootPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    console.error('Auth error in middleware:', error);
    // Critical token errors should force a redirect to login to clear state
    return NextResponse.redirect(new URL('/login', request.url));
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
     * - login (login page - we don't want to refresh session on login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
