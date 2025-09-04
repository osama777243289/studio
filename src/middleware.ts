
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  // Return to /login if don't have a session
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

//Add your protected routes
export const config = {
  matcher: ['/dashboard/:path*', '/income/:path*', '/expenses/:path*', '/sales/:path*', '/sales-matching/:path*', '/post-entries/:path*', '/chart-of-accounts/:path*', '/general-journal/:path*', '/cash-flow/:path*', '/reports/:path*', '/users/:path*', '/roles/:path*', '/data-settings/:path*'],
};
