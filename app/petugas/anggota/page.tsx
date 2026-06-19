import { getAllMembers } from '@/actions/denda'
import { AnggotaClient } from './anggota-client'

export default async function AnggotaPage() {
  const members = await getAllMembers()

  return <AnggotaClient members={members} />
}
