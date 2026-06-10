import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-zinc-900">
      <h1 className="text-5xl font-extrabold tracking-tight">Katachi</h1>
      <p className="max-w-md text-center text-zinc-600">
        A portfolio design studio. Design in the Studio, publish a featherweight site — one schema,
        one renderer, two shells.
      </p>
      <div className="flex gap-3">
        <Link
          href="/studio"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-500"
        >
          Open the Studio
        </Link>
      </div>
    </div>
  )
}
