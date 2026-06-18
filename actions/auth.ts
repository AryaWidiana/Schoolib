'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import type { ActionResult } from '@/types'

export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { success: false, message: 'Email atau password salah.' }
  }

  // Get profile role to redirect correctly
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Gagal mendapatkan sesi.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  revalidatePath('/', 'layout')

  if (profile?.role === 'petugas') {
    redirect('/petugas/dashboard')
  } else {
    redirect('/')
  }
}

export async function register(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
    nim: formData.get('nim') as string | undefined,
    phone: formData.get('phone') as string | undefined,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message }
  }

  const { email, password, full_name, nim, phone } = parsed.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role: 'anggota', nim, phone },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, message: 'Email sudah terdaftar.' }
    }
    return { success: false, message: error.message }
  }

  return {
    success: true,
    message: 'Registrasi berhasil! Silakan cek email Anda untuk konfirmasi.',
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}
