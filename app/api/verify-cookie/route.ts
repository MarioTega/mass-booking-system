
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const TOKEN_KEY = new TextEncoder().encode(process.env.TOKEN_KEY);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return NextResponse.json({ valid: false });

  try {
    const { payload } = await jwtVerify(token, TOKEN_KEY);
    return NextResponse.json({ valid: true, user: payload });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
