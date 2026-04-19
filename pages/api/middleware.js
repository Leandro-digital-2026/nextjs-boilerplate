import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {

    const auth = req.headers.get('authorization');

    if (!auth) {
      return new Response('Auth required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
    }

    const base64 = auth.split(' ')[1];
    const [user, pass] = Buffer.from(base64, 'base64')
      .toString()
      .split(':');

    if (
      user !== process.env.ADMIN_USER ||
      pass !== process.env.ADMIN_PASS
    ) {
      return new Response('Access denied', { status: 403 });
    }
  }

  return NextResponse.next();
}
