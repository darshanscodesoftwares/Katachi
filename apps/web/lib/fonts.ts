import type { ThemeTokens } from '@katachi/schema'

/**
 * Builds the Google Fonts stylesheet URL for a theme's google-sourced fonts.
 * Used by the public layout (server) and the Studio canvas (client effect) —
 * the shell owns font loading, never the renderer (§2.1).
 */
export function googleFontsUrl(theme: ThemeTokens): string | null {
  const refs = [theme.fonts.heading, theme.fonts.body, theme.fonts.mono]
  const families = [
    ...new Set(
      refs
        .filter((ref): ref is NonNullable<typeof ref> => Boolean(ref && ref.source === 'google'))
        .map((ref) => ref.family),
    ),
  ]
  if (families.length === 0) return null
  const query = families
    .map((family) => `family=${family.trim().replace(/\s+/g, '+')}:wght@400;500;600;700;800`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${query}&display=swap`
}

/** Curated Phase 1 Google Fonts list for the theme editor. */
export const GOOGLE_FONT_OPTIONS: Array<{ family: string; fallback: string }> = [
  { family: 'Inter', fallback: 'sans-serif' },
  { family: 'Manrope', fallback: 'sans-serif' },
  { family: 'Space Grotesk', fallback: 'sans-serif' },
  { family: 'Sora', fallback: 'sans-serif' },
  { family: 'DM Sans', fallback: 'sans-serif' },
  { family: 'Work Sans', fallback: 'sans-serif' },
  { family: 'Poppins', fallback: 'sans-serif' },
  { family: 'IBM Plex Sans', fallback: 'sans-serif' },
  { family: 'Playfair Display', fallback: 'serif' },
  { family: 'Lora', fallback: 'serif' },
  { family: 'Merriweather', fallback: 'serif' },
  { family: 'Source Serif 4', fallback: 'serif' },
  { family: 'JetBrains Mono', fallback: 'monospace' },
  { family: 'IBM Plex Mono', fallback: 'monospace' },
  { family: 'Fira Code', fallback: 'monospace' },
]
