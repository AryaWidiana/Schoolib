import { prisma } from '@/lib/prisma'
import { verifySession } from './session'
import { cache } from 'react'

export * from './session'

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    const user = await prisma.profile.findUnique({
      where: { id: session.userId },
    })

    return user
  } catch {
    return null
  }
})
