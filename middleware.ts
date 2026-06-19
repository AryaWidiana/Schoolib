import { NextResponse, type NextRequest } from 'next/server'
import { verifySession } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const start = performance.now()
  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/register', '/api/auth']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  const session = await verifySession()

  // Redirect unauthenticated users to login
  if (!session && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    console.log(`[Performance] Middleware Execution Time (redirect to login): ${(performance.now() - start).toFixed(2)}ms`)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = session.role === 'petugas' ? '/petugas/dashboard' : '/'
    console.log(`[Performance] Middleware Execution Time (redirect to dashboard): ${(performance.now() - start).toFixed(2)}ms`)
    return NextResponse.redirect(url)
  }

  // Guard petugas routes from anggota
  if (session && pathname.startsWith('/petugas')) {
    if (session.role !== 'petugas') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      console.log(`[Performance] Middleware Execution Time (guard petugas): ${(performance.now() - start).toFixed(2)}ms`)
      return NextResponse.redirect(url)
    }
  }

  console.log(`[Performance] Middleware Execution Time (next): ${(performance.now() - start).toFixed(2)}ms`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
