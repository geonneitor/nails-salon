import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Local development bypass: If we are on localhost, we don't do subdomain routing
  if (hostname.includes('localhost')) {
    return NextResponse.next();
  }

  const rootDomain = 'zen.com';
  const appDomain = `app.${rootDomain}`;

  if (hostname === appDomain) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/calendar')) {
       return NextResponse.redirect(new URL(`https://${appDomain}${url.pathname}`, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
