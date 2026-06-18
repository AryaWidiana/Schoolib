import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Get role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = (await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()) as { data: { role: string } | null }

      if (profile?.role === 'petugas') {
        return NextResponse.redirect(new URL('/petugas/dashboard', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
