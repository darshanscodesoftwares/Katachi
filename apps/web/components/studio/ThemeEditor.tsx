'use client'

import { coreColorKeys } from '@katachi/schema'
import { GOOGLE_FONT_OPTIONS } from '@/lib/fonts'
import { ColorInput, NumberField, SelectField } from './fields'
import { useStudio } from './store'

const COLOR_LABELS: Record<string, string> = {
  background: 'Background',
  surface: 'Surface',
  text: 'Text',
  textMuted: 'Text muted',
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  border: 'Border',
}

const RATIO_OPTIONS = [
  { value: '1.125', label: '1.125 — Major second' },
  { value: '1.2', label: '1.200 — Minor third' },
  { value: '1.25', label: '1.250 — Major third' },
  { value: '1.333', label: '1.333 — Perfect fourth' },
  { value: '1.414', label: '1.414 — Augmented fourth' },
  { value: '1.5', label: '1.500 — Perfect fifth' },
]

const FONT_SLOTS = [
  { slot: 'heading', label: 'Heading font' },
  { slot: 'body', label: 'Body font' },
  { slot: 'mono', label: 'Mono font' },
] as const

export function ThemeEditor() {
  const config = useStudio((s) => s.config)
  const updateTheme = useStudio((s) => s.updateTheme)
  if (!config) return null
  const theme = config.theme

  return (
    <div className="flex flex-col gap-5 p-3">
      <section className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold tracking-wide text-zinc-400 uppercase">Palette</h3>
        {coreColorKeys.map((key) => (
          <ColorInput
            key={key}
            label={COLOR_LABELS[key] ?? key}
            value={theme.colors[key] ?? ''}
            onChange={(value) =>
              updateTheme((t) => {
                t.colors[key] = value
              })
            }
          />
        ))}
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold tracking-wide text-zinc-400 uppercase">Typography</h3>
        {FONT_SLOTS.map(({ slot, label }) => (
          <SelectField
            key={slot}
            label={label}
            value={theme.fonts[slot]?.family ?? GOOGLE_FONT_OPTIONS[0]!.family}
            options={GOOGLE_FONT_OPTIONS.map((font) => ({ value: font.family, label: font.family }))}
            onChange={(family) =>
              updateTheme((t) => {
                const option = GOOGLE_FONT_OPTIONS.find((font) => font.family === family)
                t.fonts[slot] = {
                  family,
                  source: 'google',
                  fallback: option?.fallback ?? 'sans-serif',
                }
              })
            }
          />
        ))}
        <NumberField
          label="Base size (px)"
          value={theme.typeScale.basePx}
          min={12}
          max={24}
          onChange={(basePx) =>
            updateTheme((t) => {
              t.typeScale.basePx = basePx
            })
          }
        />
        <SelectField
          label="Scale ratio"
          value={String(theme.typeScale.ratio)}
          options={RATIO_OPTIONS}
          onChange={(value) =>
            updateTheme((t) => {
              t.typeScale.ratio = Number(value)
            })
          }
        />
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold tracking-wide text-zinc-400 uppercase">Spacing</h3>
        <NumberField
          label="Spacing unit (px)"
          value={theme.spacing.unitPx}
          min={2}
          max={16}
          onChange={(unitPx) =>
            updateTheme((t) => {
              t.spacing.unitPx = unitPx
            })
          }
        />
      </section>
    </div>
  )
}
