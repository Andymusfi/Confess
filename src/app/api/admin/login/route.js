import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // In a real app, use a DB and hash passwords. Hardcoded as requested:
    if (username === 'adminrpl' && password === 'adminrpl2') {
      const response = NextResponse.json({ success: true });
      // Set a simple cookie
      response.cookies.set({
        name: 'admin_auth',
        value: 'authenticated',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
      });
      return response;
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
