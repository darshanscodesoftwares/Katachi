import { colorValueSchema, z, type BackgroundLayer } from '@katachi/schema'
import type { CSSProperties } from 'react'
import { resolveColorValue } from '../cascade'

/**
 * Background layer implementations (CLAUDE.md §10). Presets are recipes over
 * these primitives; all colors resolve through token refs so backgrounds
 * re-theme instantly. Animations are transform/opacity only.
 */

const colorPropsSchema = z.object({
  color: colorValueSchema.default({ token: 'colors.surface' }),
})

const gradientPropsSchema = z.object({
  kind: z.enum(['linear', 'radial', 'conic', 'sweep', 'aurora']).default('linear'),
  from: colorValueSchema.default({ token: 'colors.primary' }),
  to: colorValueSchema.default({ token: 'colors.secondary' }),
  angle: z.number().default(135),
  /** aurora orb colors; falls back to [from, to, from] */
  colors: z.array(colorValueSchema).default([]),
  speedSec: z.number().positive().default(16),
})

const noisePropsSchema = z.object({
  baseFrequency: z.number().positive().default(0.8),
})

function noiseDataUri(baseFrequency: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">` +
    `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="3" stitchTiles="stitch"/></filter>` +
    `<rect width="100%" height="100%" filter="url(#n)"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function ColorLayer({ layer }: { layer: BackgroundLayer }) {
  const props = colorPropsSchema.parse(layer.props)
  return <div className="ka-bg__layer" style={{ background: resolveColorValue(props.color) }} />
}

function GradientLayer({ layer }: { layer: BackgroundLayer }) {
  const props = gradientPropsSchema.parse(layer.props)
  const from = resolveColorValue(props.from)
  const to = resolveColorValue(props.to)

  switch (props.kind) {
    case 'radial':
      return (
        <div
          className="ka-bg__layer"
          style={{ background: `radial-gradient(circle at 30% 20%, ${from}, ${to})` }}
        />
      )
    case 'conic':
      return (
        <div
          className="ka-bg__layer"
          style={{ background: `conic-gradient(from ${props.angle}deg, ${from}, ${to}, ${from})` }}
        />
      )
    case 'sweep':
      // §10 lists "animated background-position", but the §10 hard rule allows
      // transform/opacity only — so the sweep translates an oversized strip.
      return (
        <div className="ka-bg__layer ka-bg__layer--clip">
          <div
            className="ka-bg-sweep"
            style={{
              background: `linear-gradient(${props.angle}deg, ${from}, ${to}, ${from})`,
              animationDuration: `${props.speedSec}s`,
            }}
          />
        </div>
      )
    case 'aurora': {
      const orbColors =
        props.colors.length > 0 ? props.colors.map(resolveColorValue) : [from, to, from]
      return (
        <div className="ka-bg__layer ka-bg__layer--clip ka-bg-aurora">
          {orbColors.slice(0, 3).map((color, i) => (
            <div
              key={i}
              className={`ka-bg-aurora__orb ka-bg-aurora__orb--${i + 1}`}
              style={
                {
                  background: `radial-gradient(closest-side, ${color}, transparent)`,
                  animationDuration: `${props.speedSec * (1 + i * 0.4)}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )
    }
    case 'linear':
    default:
      return (
        <div
          className="ka-bg__layer"
          style={{ background: `linear-gradient(${props.angle}deg, ${from}, ${to})` }}
        />
      )
  }
}

function NoiseLayer({ layer }: { layer: BackgroundLayer }) {
  const props = noisePropsSchema.parse(layer.props)
  return (
    <div
      className="ka-bg__layer"
      style={{ backgroundImage: noiseDataUri(props.baseFrequency), backgroundSize: '160px 160px' }}
    />
  )
}

const layerComponents: Partial<
  Record<BackgroundLayer['type'], (p: { layer: BackgroundLayer }) => React.JSX.Element>
> = {
  color: ColorLayer,
  gradient: GradientLayer,
  noise: NoiseLayer,
  // image / svgPattern / particles / video / shader: Phase 3 (§10)
}

export function isAnimatedLayer(layer: BackgroundLayer): boolean {
  if (layer.type !== 'gradient') return false
  const kind = (layer.props as { kind?: string }).kind
  return kind === 'sweep' || kind === 'aurora'
}

export function RenderBackgroundLayer({ layer }: { layer: BackgroundLayer }) {
  const Component = layerComponents[layer.type]
  if (!Component) return null
  const style: CSSProperties = {}
  if (layer.opacity !== undefined) style.opacity = layer.opacity
  if (layer.blendMode !== undefined) style.mixBlendMode = layer.blendMode as CSSProperties['mixBlendMode']
  return (
    <div className="ka-bg__slot" style={style}>
      <Component layer={layer} />
    </div>
  )
}
