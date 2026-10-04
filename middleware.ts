import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const TOKEN_KEY = new TextEncoder().encode(process.env.TOKEN_KEY);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; 
  const { pathname } = request.nextUrl;

  
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await jwtVerify(token, TOKEN_KEY);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [    '/((?!_next/static|_next/image|api|favicon.ico|.*\\..*$).*)',
    '/admin/:path*'],
};