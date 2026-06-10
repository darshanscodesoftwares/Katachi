import { redirect } from 'next/navigation'
import { ensureProfile, getUser } from '@/lib/auth'
import { isAppConfigured } from '@/lib/env'
import { getOrCreateFirstPortfolio } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

export default async function StudioIndexPage() {
  if (!isAppConfigured()) redirect('/setup')

  const user = await getUser()
  if (!user) redirect('/login')

  await ensureProfile(user)
  const fallbackName = user.email ? `${user.email.split('@')[0]}'s portfolio` : 'My portfolio'
  const portfolio = await getOrCreateFirstPortfolio(user.id, fallbackName)
  redirect(`/studio/${portfolio.id}`)
}
