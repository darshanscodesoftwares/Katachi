import type { Metadata } from 'next'
import './globals.css'
import '@katachi/renderer/styles.css'

export const metadata: Metadata = {
  title: 'Katachi',
  description: 'Portfolio design studio — one schema, one renderer, two shells.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
