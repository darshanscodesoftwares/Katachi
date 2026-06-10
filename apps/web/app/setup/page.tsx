import Link from 'next/link'
import { isAppConfigured } from '@/lib/env'

export const metadata = { title: 'Setup — Katachi' }

const steps = [
  'Create a Supabase project (free tier): database + Auth + a Storage bucket named "media".',
  'Copy apps/web/.env.example to apps/web/.env.local and paste the project values (CLAUDE.md §16).',
  'Apply the database schema: pnpm --filter web db:deploy (then db:status to verify).',
  'Restart the dev server (or redeploy) so the env vars are picked up.',
]

export default function SetupPage() {
  const configured = isAppConfigured()
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Katachi setup</h1>
        {configured ? (
          <>
            <p className="mt-2 text-sm text-emerald-700">
              Environment looks configured. You can sign in.
            </p>
            <Link href="/login" className="mt-4 inline-block font-semibold text-indigo-600">
              Go to sign-in →
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-600">
              The Studio needs Supabase credentials before it can run. One-time checklist:
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-zinc-500">
              Secrets live only in .env.local — never commit them.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
