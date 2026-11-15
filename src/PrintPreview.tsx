import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import type { CardData } from './types'
import { CardFace, CARD_W, CARD_H } from './CardFace'

type Props = {
  cards: CardData[]
  onClose: () => void
}

export function PrintPreview({ cards, onClose }: Props) {
  const [scale, setScale] = useState(0.75)

  useEffect(() => {
    const update = () => {
      const available = window.innerWidth - 120
      const twoCardsW = CARD_W * 2 + 40
      setScale(Math.min(0.75, available / twoCardsW))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Aperçu avant impression</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{cards.length} carte(s) — recto et verso, format {cards[0]?.cardSize.width}×{cards[0]?.cardSize.height} mm</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              >
                −
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(1, s + 0.1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              >
                +
              </button>
            </div>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:border-slate-900 dark:hover:border-indigo-500 transition-colors">
              Fermer
            </button>
            <button type="button" onClick={handlePrint} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">
              Imprimer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto panel-scroll p-8 bg-slate-50 dark:bg-slate-950 print:bg-white print:overflow-visible print:p-0">
          <div className="flex flex-col items-center gap-8 print:gap-0">
            {cards.map((card, idx) => (
              <div key={card.id} className="flex flex-col items-center gap-4 print:break-inside-avoid print:mb-8">
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium print:hidden">
                  Carte {idx + 1} — {card.fields.firstName} {card.fields.lastName}
                </div>
                <div className="flex gap-6 print:gap-2" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                  <div className="flex flex-col items-center gap-2">
                    <div style={{ width: CARD_W, height: CARD_H }} className="shadow-lg print:shadow-none">
                      <CardFace card={card} face="front" />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 print:hidden">Recto</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div style={{ width: CARD_W, height: CARD_H }} className="shadow-lg print:shadow-none">
                      <CardFace card={card} face="back" />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 print:hidden">Verso</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
