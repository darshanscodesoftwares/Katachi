import { redirect } from 'next/navigation'
import { StudioEditor } from '@/components/studio/StudioEditor'
import { ensureProfile, getUser } from '@/lib/auth'
import { isAppConfigured } from '@/lib/env'
import { getOrCreateFirstPortfolio, starterPortfolioConfig } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

export default async function StudioIndexPage() {
  // Local demo mode: no Supabase yet → run the real editor on the starter
  // config; edits persist to localStorage only (see StudioEditor demo flag).
  if (!isAppConfigured()) {
    return (
      <StudioEditor
        portfolioId="demo"
        name="Demo portfolio (local only)"
        slug="demo"
        initialConfig={starterPortfolioConfig('Your Name')}
        demo
      />
    )
  }

  const user = await getUser()
  if (!user) redirect('/login')

  await ensureProfile(user)
  const fallbackName = user.email ? `${user.email.split('@')[0]}'s portfolio` : 'My portfolio'
  const portfolio = await getOrCreateFirstPortfolio(user.id, fallbackName)
  redirect(`/studio/${portfolio.id}`)
}
