'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * §10 hard rule: animated backgrounds pause when offscreen or when the tab is
 * hidden. This is the only client JS a CSS-animated background costs (~0.5 KB);
 * static layers never mount it. CSS pauses via [data-ka-paused].
 */
export function AnimatedBackdrop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let offscreen = false
    let hidden = document.hidden
    const apply = () => el.toggleAttribute('data-ka-paused', offscreen || hidden)

    const io = new IntersectionObserver((entries) => {
      offscreen = entries.some((entry) => !entry.isIntersecting)
      apply()
    })
    io.observe(el)
    const onVisibility = () => {
      hidden = document.hidden
      apply()
    }
    document.addEventListener('visibilitychange', onVisibility)
    apply()
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div ref={ref} className="ka-bg" aria-hidden="true">
      {children}
    </div>
  )
}
