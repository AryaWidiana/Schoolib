import { deleteSession } from '@/lib/session'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Call deleteSession to remove the session cookie
  await deleteSession()

  // Redirect to login page
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}
