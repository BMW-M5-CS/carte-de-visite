import { forwardRef, useEffect, useRef, useState } from 'react'
import type { CardData } from './types'
import { CardFace, CARD_W, CARD_H } from './CardFace'

type Props = {
  card: CardData
  flipped: boolean
  onFlip: (flipped: boolean) => void
  freezeFlip?: boolean
  onFocusTab?: (tab: 'identity' | 'fields' | 'background' | 'border' | 'effects' | 'icons' | 'logo' | 'photo' | 'social' | 'qr') => void
}

export const CardPreview = forwardRef<HTMLDivElement, Props>(function CardPreview(
  { card, flipped, onFlip, freezeFlip = false, onFocusTab },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const available = el.clientWidth
      setScale(Math.min(1, available / CARD_W))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The rotation is applied on the same element as the scale, and perspective
  // is set on the direct parent so the 3D effect actually renders.
  const rotate = flipped ? 180 : 0

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        ref={(node: HTMLDivElement | null) => {
          containerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        className="card-3d w-full flex items-center justify-center"
        style={{ height: CARD_H * scale + 8, perspective: 1600 }}
        onMouseEnter={() => !freezeFlip && onFlip(true)}
        onMouseLeave={() => !freezeFlip && onFlip(false)}
      >
        <div
          style={{
            width: CARD_W,
            height: CARD_H,
            transform: `scale(${scale}) rotateY(${rotate}deg)`,
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <div className="card-face" style={{ borderRadius: card.border.radius }}>
            <CardFace card={card} face="front" />
          </div>
          <div className="card-face card-back" style={{ borderRadius: card.border.radius }}>
            <CardFace card={card} face="back" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
        <span className={flipped ? 'opacity-40' : 'opacity-100 font-medium text-slate-900 dark:text-slate-100'}>Recto</span>
        <button
          type="button"
          onClick={() => onFlip(!flipped)}
          className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-indigo-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Retourner
        </button>
        <span className={flipped ? 'opacity-100 font-medium text-slate-900 dark:text-slate-100' : 'opacity-40'}>Verso</span>
      </div>
      {onFocusTab && (
        <div className="w-full max-w-[520px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Modifier rapidement</p>
          <div className="flex gap-2 overflow-x-auto panel-scroll pb-1">
            {([
              ['identity', 'Coordonnées'],
              ['fields', 'Textes'],
              ['background', 'Fond'],
              ['border', 'Bordure'],
              ['effects', 'Effets'],
              ['icons', 'Icônes'],
              ['logo', 'Logo'],
              ['photo', 'Photo'],
              ['social', 'Réseaux'],
              ['qr', 'QR code'],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => onFocusTab(tab)}
                className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-sky-500 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400 dark:text-slate-500 -mt-3">Survolez la carte pour la retourner en 3D</p>
    </div>
  )
})
