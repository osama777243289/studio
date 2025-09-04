
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const isLoggedIn = !!sessionCookie;

  const isAuthPage = request.nextUrl.pathname === '/login';

  if (isAuthPage) {
    // If the user is logged in and tries to access login page, redirect to dashboard
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // If the user is not logged in and tries to access a protected page, redirect to login
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

//Add your protected routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
