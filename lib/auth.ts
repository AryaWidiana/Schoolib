import { prisma } from '@/lib/prisma'
import { verifySession } from './session'
import { cache } from 'react'

export * from './session'

// Shared select projection — only fetch what the UI actually needs (no password_hash!)
const profileSelect = {
  id: true,
  full_name: true,
  email: true,
  role: true,
  status: true,
  total_denda: true,
  avatar_url: true,
  nim: true,
  phone: true,
  created_at: true,
} as const

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    return await prisma.profile.findUnique({
      where: { id: session.userId },
      select: profileSelect,
    })
  } catch {
    return null
  }
})
