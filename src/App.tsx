import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import type { CardData } from './types'
import { CARD_W, CARD_H, TEMPLATES } from './types'
import { ControlPanel } from './ControlPanel'
import { CardPreview } from './CardPreview'
import { CardFace } from './CardFace'
import { TemplateGallery } from './TemplateGallery'
import { CsvImport } from './CsvImport'
import { PrintPreview } from './PrintPreview'
import { useAuth } from './hooks/useAuth'
import { useCards } from './hooks/useCards'
import { useSavedPalettes } from './hooks/useSavedPalettes'
import { useTheme, type ThemeMode } from './hooks/useTheme'
import { supabase } from './lib/supabase'
import { Login } from './components/Login'

export default function App() {
  const { session, loading } = useAuth()
  const { mode, setMode } = useTheme()
  const { cards, setCards, loaded: cardsLoaded, saving, deleteCardDb, flushSave } = useCards(session?.user?.id)
  const { palettes: savedPalettes, savePalette, deletePalette } = useSavedPalettes(session?.user?.id)
  const [activeId, setActiveId] = useState<string>('')
  const [flipped, setFlipped] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [batchExporting, setBatchExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const activeCard = cards.find((c) => c.id === activeId) ?? cards[0]

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards
    const q = searchQuery.toLowerCase()
    return cards.filter((c) => {
      const name = `${c.fields.firstName || ''} ${c.fields.lastName || ''}`.toLowerCase()
      const company = (c.fields.company || '').toLowerCase()
      const email = (c.fields.email || '').toLowerCase()
      return name.includes(q) || company.includes(q) || email.includes(q)
    })
  }, [cards, searchQuery])

  useEffect(() => {
    if (cards.length > 0 && !cards.some((c) => c.id === activeId)) {
      setActiveId(cards[0].id)
    }
  }, [cards, activeId])

  const updateCard = useCallback(
    (patch: Partial<CardData>) => {
      setCards((prev) => prev.map((c) => (c.id === activeId ? { ...c, ...patch } : c)))
    },
    [activeId, setCards],
  )

  const duplicateCard = useCallback(() => {
    const copy: CardData = { ...activeCard, id: crypto.randomUUID() }
    setCards((prev) => [...prev, copy])
    setActiveId(copy.id)
  }, [activeCard, setCards])

  const removeCard = useCallback(
    (id: string) => {
      setCards((prev) => {
        if (prev.length <= 1) return prev
        const next = prev.filter((c) => c.id !== id)
        if (id === activeId) setActiveId(next[next.length - 1].id)
        return next
      })
      deleteCardDb(id)
    },
    [activeId, setCards, deleteCardDb],
  )

  const exportPng = useCallback(async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const frontImg = await renderFace(activeCard, 'front')
      const backImg = await renderFace(activeCard, 'back')
      const gap = 40
      const padding = 40
      const PR = 2
      const canvas = document.createElement('canvas')
      canvas.width = (CARD_W * 2 + gap + padding * 2) * PR
      canvas.height = (CARD_H + padding * 2) * PR
      const ctx = canvas.getContext('2d')!
      ctx.scale(PR, PR)
      ctx.clearRect(0, 0, CARD_W * 2 + gap + padding * 2, CARD_H + padding * 2)
      ctx.drawImage(frontImg, padding, padding, CARD_W, CARD_H)
      ctx.drawImage(backImg, CARD_W + gap + padding, padding, CARD_W, CARD_H)
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `carte-${activeCard.fields.firstName}-${activeCard.fields.lastName}.png`.replace(/\s+/g, '-').toLowerCase()
      a.click()
    } catch (err) {
      console.error(err)
      alert("L'export a échoué. Réessayez.")
    } finally {
      setExporting(false)
    }
  }, [activeCard])

  const exportPdf = useCallback(async () => {
    setExporting(true)
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = 297
      const pageH = 210
      const cardWmm = activeCard.cardSize.width
      const cardHmm = activeCard.cardSize.height
      const gap = 10
      const totalW = cardWmm * 2 + gap
      const startX = (pageW - totalW) / 2
      const startY = (pageH - cardHmm) / 2

      const frontImg = await renderFace(activeCard, 'front')
      const backImg = await renderFace(activeCard, 'back')

      const frontDataUrl = frontImg.src
      const backDataUrl = backImg.src

      pdf.addImage(frontDataUrl, 'PNG', startX, startY, cardWmm, cardHmm)
      pdf.addImage(backDataUrl, 'PNG', startX + cardWmm + gap, startY, cardWmm, cardHmm)
      pdf.save(`carte-${activeCard.fields.firstName}-${activeCard.fields.lastName}.pdf`.replace(/\s+/g, '-').toLowerCase())
    } catch (err) {
      console.error(err)
      alert("L'export PDF a échoué. Réessayez.")
    } finally {
      setExporting(false)
    }
  }, [activeCard])

  const exportBatchPdf = useCallback(async () => {
    if (cards.length === 0) return
    setBatchExporting(true)
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = 297
      const pageH = 210
      const cardWmm = cards[0].cardSize.width
      const cardHmm = cards[0].cardSize.height
      const gap = 10
      const cardsPerRow = Math.floor((pageW - 20 + gap) / (cardWmm * 2 + gap))
      const rowH = cardHmm + 5
      const maxRows = Math.floor((pageH - 20) / rowH)
      const maxPerPage = cardsPerRow * maxRows

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        const frontImg = await renderFace(card, 'front')
        const backImg = await renderFace(card, 'back')
        const indexInPage = i % maxPerPage
        if (i > 0 && indexInPage === 0) pdf.addPage()
        const row = Math.floor(indexInPage / cardsPerRow)
        const col = indexInPage % cardsPerRow
        const x = 10 + col * (cardWmm * 2 + gap)
        const y = 10 + row * rowH
        pdf.addImage(frontImg.src, 'PNG', x, y, cardWmm, cardHmm)
        pdf.addImage(backImg.src, 'PNG', x + cardWmm + gap, y, cardWmm, cardHmm)
        if (i % 5 === 0) await new Promise((r) => setTimeout(r, 50))
      }
      pdf.save(`cartes-batch-${cards.length}.pdf`)
    } catch (err) {
      console.error(err)
      alert("L'export en masse a échoué. Réessayez.")
    } finally {
      setBatchExporting(false)
    }
  }, [cards])

  const handleSavePalette = useCallback((name: string) => {
    const bg1 = activeCard.background.color1
    const bg2 = activeCard.background.color2
    const text = activeCard.fieldStyles.firstName?.color ?? '#0f172a'
    const accent = activeCard.fieldStyles.company?.color ?? '#0ea5e9'
    const muted = activeCard.fieldStyles.jobTitle?.color ?? '#64748b'
    const border = activeCard.border.color
    const dark = activeCard.background.color1 !== '#ffffff' && !activeCard.background.color1.startsWith('#f')
    savePalette({ name, bg1, bg2, text, accent, muted, border, dark })
  }, [activeCard, savePalette])

  if (loading || (session && !cardsLoaded)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-sm text-slate-400 dark:text-slate-500">Chargement…</div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {galleryOpen && (
        <TemplateGallery
          currentTemplateId={null}
          cardType={activeCard.cardType}
          onSelect={(card: CardData) => {
            setCards((prev) => prev.map((c) => (c.id === activeId ? card : c)))
          }}
          onClose={() => setGalleryOpen(false)}
        />
      )}
      {csvOpen && (
        <CsvImport
          baseCard={activeCard}
          onImport={(newCards: CardData[]) => {
            setCards((prev) => [...prev, ...newCards])
            if (newCards.length > 0) setActiveId(newCards[0].id)
          }}
          onClose={() => setCsvOpen(false)}
        />
      )}
      {printOpen && (
        <PrintPreview cards={cards} onClose={() => setPrintOpen(false)} />
      )}

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-bold">
              CDV
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none dark:text-slate-100">Carte de Visite</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Studio de personnalisation avancée</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Sauvegarde…
              </span>
            )}
            <ThemeToggle mode={mode} setMode={setMode} />
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                {(session.user.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[140px] truncate">{session.user.email}</span>
            </div>
            <button
              type="button"
              onClick={() => setCsvOpen(true)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:border-slate-900 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Import Excel
            </button>
            <button
              type="button"
              onClick={duplicateCard}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:border-slate-900 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Dupliquer
            </button>
            <button
              type="button"
              onClick={exportPng}
              disabled={exporting || batchExporting}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Export…' : 'PNG'}
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={exporting || batchExporting}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Export…' : 'PDF'}
            </button>
            {cards.length > 1 && (
              <button
                type="button"
                onClick={exportBatchPdf}
                disabled={exporting || batchExporting}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                title={`Exporter les ${cards.length} cartes en un seul PDF`}
              >
                {batchExporting ? 'Export masse…' : `Tout (${cards.length})`}
              </button>
            )}
            <button
              type="button"
              onClick={() => setPrintOpen(true)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:border-slate-900 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Imprimer
            </button>
            <button
              type="button"
              onClick={() => { flushSave(); supabase.auth.signOut() }}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              title="Se déconnecter"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        {/* Panel */}
        <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto panel-scroll">
          {/* Card tabs with search */}
          {cards.length > 1 && (
            <div className="mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
              {cards.length > 6 && (
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder={`Rechercher parmi ${cards.length} cartes…`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto panel-scroll">
                {filteredCards.map((c) => {
                  const fullName = `${c.fields.firstName || ''} ${c.fields.lastName || ''}`.trim() || 'Sans nom'
                  const isActive = c.id === activeId
                  return (
                    <div key={c.id} className="flex items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveId(c.id)}
                        className={`px-2.5 py-1.5 rounded-l-lg text-xs border max-w-[140px] truncate ${
                          isActive
                            ? 'border-slate-900 dark:border-indigo-600 bg-slate-900 dark:bg-indigo-600 text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                        title={fullName}
                      >
                        {fullName}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCard(c.id)}
                        className={`px-1.5 py-1.5 rounded-r-lg border-y border-r text-xs ${
                          isActive
                            ? 'border-slate-900 dark:border-indigo-600 bg-slate-900 dark:bg-indigo-600 text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                        title="Supprimer cette carte"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
                {filteredCards.length === 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 py-2">Aucune carte trouvée</span>
                )}
              </div>
            </div>
          )}
          <ControlPanel card={activeCard} onChange={updateCard} onOpenGallery={() => setGalleryOpen(true)} savedPalettes={savedPalettes} onSavePalette={handleSavePalette} onDeletePalette={deletePalette} onPrintPreview={() => setPrintOpen(true)} />
        </aside>

        {/* Preview */}
        <section className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 min-h-[60vh]">
          <div className="w-full flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aperçu en temps réel</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">{activeCard.cardSize.width} × {activeCard.cardSize.height} mm — {activeCard.paletteName}</span>
          </div>
          <div className="w-full flex justify-center">
            <CardPreview ref={previewRef} card={activeCard} flipped={flipped} onFlip={setFlipped} />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-5 py-4 text-xs text-slate-400 dark:text-slate-500 text-center">
          {TEMPLATES.length} modèles disponibles — personnalisation avancée au millimètre près.
        </div>
      </footer>
    </div>
  )
}

/**
 * Renders a single card face off-screen at native resolution and returns it as an HTMLImageElement.
 */
async function renderFace(card: CardData, face: 'front' | 'back'): Promise<HTMLImageElement> {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-99999px'
  host.style.top = '0'
  host.style.width = `${CARD_W}px`
  host.style.height = `${CARD_H}px`
  host.style.overflow = 'hidden'
  host.style.pointerEvents = 'none'

  const inner = document.createElement('div')
  inner.style.width = `${CARD_W}px`
  inner.style.height = `${CARD_H}px`
  inner.style.position = 'relative'
  host.appendChild(inner)
  document.body.appendChild(host)

  const root = createRoot(inner)
  root.render(<CardFace card={card} face={face} />)
  await new Promise<void>((resolve) => setTimeout(resolve, 200))
  await waitForImages(inner, 2500)

  const cardEl = (inner.firstElementChild as HTMLElement | null) ?? inner
  const dataUrl = await toPng(cardEl, { width: CARD_W, height: CARD_H, pixelRatio: 2, cacheBust: true })
  root.unmount()
  host.remove()

  const img = new Image()
  img.src = dataUrl
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
    img.onerror = () => resolve()
  })
  return img
}

function ThemeToggle({ mode, setMode }: { mode: ThemeMode; setMode: (m: ThemeMode) => void }) {
  const options: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Clair', icon: '☀' },
    { value: 'dark', label: 'Sombre', icon: '☾' },
    { value: 'system', label: 'Système', icon: '⌂' },
  ]
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setMode(opt.value)}
          title={`Thème ${opt.label}`}
          className={`px-2 py-1 rounded-md text-xs transition-colors ${
            mode === opt.value
              ? 'bg-slate-900 dark:bg-indigo-600 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`
          }
        >
          <span className="text-sm leading-none">{opt.icon}</span>
        </button>
      ))}
    </div>
  )
}

function waitForImages(el: HTMLElement, timeoutMs = 2000): Promise<void> {
  return new Promise<void>((resolve) => {
    const deadline = Date.now() + timeoutMs
    const check = () => {
      const imgs = Array.from(el.querySelectorAll('img'))
      const allLoaded = imgs.every((img) => img.complete && img.naturalWidth > 0)
      if (allLoaded || Date.now() > deadline) {
        resolve()
        return
      }
      imgs.forEach((img) => {
        if (!img.complete) {
          img.onload = () => check()
          img.onerror = () => check()
        }
      })
      setTimeout(check, 80)
    }
    check()
  })
}
