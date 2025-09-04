
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  // Return to /login if don't have a session
  if (!session) {
    if (request.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // If user has a session and tries to access /login, redirect to dashboard
    if (request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

//Add your protected routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
