import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/income', '/expenses', '/sales', '/sales-matching', '/post-entries', '/chart-of-accounts', '/general-journal', '/cash-flow', '/reports', '/users', '/roles', '/data-settings' ];
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const currentUserToken = request.cookies.get('firebase-auth-token')?.value

  if (protectedRoutes.includes(request.nextUrl.pathname) && !currentUserToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (authRoutes.includes(request.nextUrl.pathname) && currentUserToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
