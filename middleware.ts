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

  // Refresh session if expired.
  await supabase.auth.getUser();

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
