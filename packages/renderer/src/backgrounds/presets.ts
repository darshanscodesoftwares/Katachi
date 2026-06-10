import { createId } from '@katachi/schema'
import type { BackgroundPreset } from '../registry'

/**
 * §10: users pick named presets, never technologies. Each preset is a
 * BackgroundLayer[] recipe over the primitive layer types. Colors are token
 * refs so every preset re-themes with the palette.
 */
export const backgroundPresets: BackgroundPreset[] = [
  {
    id: 'solid',
    label: 'Solid',
    create: () => [{ id: createId(), type: 'color', props: { color: { token: 'colors.surface' } } }],
  },
  {
    id: 'gradient',
    label: 'Gradient',
    create: () => [
      {
        id: createId(),
        type: 'gradient',
        props: {
          kind: 'linear',
          angle: 135,
          from: { token: 'colors.primary' },
          to: { token: 'colors.secondary' },
        },
        opacity: 0.16,
      },
    ],
  },
  {
    id: 'aurora',
    label: 'Aurora',
    create: () => [
      { id: createId(), type: 'color', props: { color: { token: 'colors.background' } } },
      {
        id: createId(),
        type: 'gradient',
        props: {
          kind: 'aurora',
          colors: [
            { token: 'colors.primary' },
            { token: 'colors.secondary' },
            { token: 'colors.accent' },
          ],
          speedSec: 18,
        },
        opacity: 0.45,
      },
    ],
  },
  {
    id: 'gradientSweep',
    label: 'Gradient sweep',
    create: () => [
      {
        id: createId(),
        type: 'gradient',
        props: {
          kind: 'sweep',
          angle: 100,
          from: { token: 'colors.primary' },
          to: { token: 'colors.accent' },
          speedSec: 14,
        },
        opacity: 0.18,
      },
    ],
  },
  {
    id: 'grain',
    label: 'Grain overlay',
    create: () => [
      { id: createId(), type: 'color', props: { color: { token: 'colors.surface' } } },
      { id: createId(), type: 'noise', props: { baseFrequency: 0.8 }, opacity: 0.07 },
    ],
  },
]
