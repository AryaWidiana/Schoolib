'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import type { ActionResult } from '@/types'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession, getUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function login(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data

  const user = await prisma.profile.findUnique({
    where: { email },
  })

  if (!user) {
    return { success: false, message: 'Email atau password salah.' }
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  if (!isValidPassword) {
    return { success: false, message: 'Email atau password salah.' }
  }

  if (user.status === 'diblokir') {
    return { success: false, message: 'Akun Anda sedang diblokir. Hubungi petugas.' }
  }

  await createSession(user.id, user.role)

  revalidatePath('/', 'layout')

  if (user.role === 'petugas') {
    redirect('/petugas/dashboard')
  } else {
    redirect('/')
  }
}

export async function register(formData: FormData): Promise<ActionResult> {
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

  const existingUser = await prisma.profile.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { success: false, message: 'Email sudah terdaftar.' }
  }

  const password_hash = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.profile.create({
      data: {
        email,
        password_hash,
        full_name,
        nim,
        phone,
        role: 'anggota',
        status: 'aktif',
      },
    })

    // Auto login after register
    await createSession(user.id, user.role)
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal mendaftar' }
  }

  redirect('/') // Redirect to dashboard directly after register
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function getProfile() {
  const user = await getUser()
  return user
}
