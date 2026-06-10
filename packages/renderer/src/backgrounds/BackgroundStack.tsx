import type { BackgroundLayer } from '@katachi/schema'
import { AnimatedBackdrop } from './AnimatedBackdrop'
import { isAnimatedLayer, RenderBackgroundLayer } from './layers'

/** Renders a section's background layers, stacked bottom → top. */
export function BackgroundStack({ layers }: { layers: BackgroundLayer[] }) {
  const content = layers.map((layer) => <RenderBackgroundLayer key={layer.id} layer={layer} />)

  // Only animated stacks pay for the pause-when-offscreen client island (§10).
  if (layers.some(isAnimatedLayer)) {
    return <AnimatedBackdrop>{content}</AnimatedBackdrop>
  }
  return (
    <div className="ka-bg" aria-hidden="true">
      {content}
    </div>
  )
}
