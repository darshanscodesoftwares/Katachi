import Link from 'next/link'
import { hasSupabaseEnv } from '@/lib/env'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Sign in — Katachi' }

export default function LoginPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-zinc-900">Not configured yet</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Supabase environment variables are missing, so sign-in is unavailable.
          </p>
          <Link href="/setup" className="mt-4 inline-block font-semibold text-indigo-600">
            Setup instructions →
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <LoginForm />
    </div>
  )
}
