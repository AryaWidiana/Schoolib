import { NextResponse, type NextRequest } from 'next/server'
import { verifySession } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Early return for static files to completely bypass auth check overhead
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/register', '/api/auth']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  const session = await verifySession()

  // Redirect unauthenticated users to login
  if (!session && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = session.role === 'petugas' ? '/petugas/dashboard' : '/'
    return NextResponse.redirect(url)
  }

  // Guard petugas routes from anggota
  if (session && pathname.startsWith('/petugas')) {
    if (session.role !== 'petugas') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
