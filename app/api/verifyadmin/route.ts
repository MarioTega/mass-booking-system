// app/api/auth/verifyadmin/route.js
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import {NextResponse,NextRequest} from 'next/server';

const TOKEN_KEY = new TextEncoder().encode(process.env.TOKEN_KEY);

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === process.env.ADMIN_PASSWORD) {
    const token = await new SignJWT({ payload: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10d')
      .sign(TOKEN_KEY);

    const cookieStore = await cookies(); 
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 120, 
      path: '/'
    });

    return NextResponse.json({ status: 'success', message: 'Admin verified successfully' });
  }
  return NextResponse.json({ status: 'failure' ,message: 'Admin verification failed'}, { status: 401 });
}
