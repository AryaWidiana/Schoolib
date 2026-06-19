import { prisma } from '@/lib/prisma'
import { verifySession } from './session'

export * from './session'

export async function getUser() {
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
}
