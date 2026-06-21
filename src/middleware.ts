import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Validar env vars antes de tocar Supabase. Si faltan, no crasheamos:
  //    dejamos pasar las rutas públicas y devolvemos 503 a las protegidas.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseMissing = !supabaseUrl || !supabaseAnonKey;

  if (supabaseMissing) {
    console.error(
      '[middleware] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // 2. Initialize Response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 3. Initialize Supabase SSR client (solo si tenemos las env vars)
  const supabase = supabaseMissing
    ? null
    : createServerClient(supabaseUrl as string, supabaseAnonKey as string, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options });
              response.cookies.set({ name, value, ...options });
            });
          },
        },
      });

  // 4. Resolve user session (degradar a null si Supabase no está disponible)
  let user = null;
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (error) {
      console.error('Error verifying user in middleware:', error);
    }
  }

  // 5. Subdomain & Routing Logic
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

  // 6. Protected Routes Check
  const isLoginPage = pathname.startsWith('/login');
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/calendar') || 
    pathname.startsWith('/customers') || 
    pathname.startsWith('/services') || 
    pathname.startsWith('/settings');

  // 6a. Si Supabase está caído, las protegidas devuelven 503 (inciso b acordado).
  if (supabaseMissing && isProtectedRoute) {
    return NextResponse.json(
      { error: 'Servicio temporalmente no disponible. Intenta de nuevo en un momento.' },
      { status: 503, headers: { 'Retry-After': '60' } }
    );
  }

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

