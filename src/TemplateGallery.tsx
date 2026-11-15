import { useState, useMemo } from 'react'
import type { CardData, CardType } from './types'
import { TEMPLATES, ARCHETYPES, PALETTES, cardFromTemplate, templatesByCardType, CARD_TYPES } from './types'
import { CardFace } from './CardFace'

type Props = {
  currentTemplateId: string | null
  cardType: CardType
  onSelect: (card: CardData) => void
  onClose: () => void
}

const ARCHETYPE_CATEGORIES = ['Tous', ...Array.from(new Set(ARCHETYPES.map((a) => a.category)))]

type SortOption = 'default' | 'palette' | 'style'

export function TemplateGallery({ currentTemplateId, cardType, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tous')
  const [paletteFilter, setPaletteFilter] = useState('Tous')
  const [typeFilter, setTypeFilter] = useState<CardType | 'Tous'>(cardType)
  const [sortBy, setSortBy] = useState<SortOption>('default')

  const filtered = useMemo(() => {
    const base = typeFilter === 'Tous' ? TEMPLATES : templatesByCardType(typeFilter)
    const result = base.filter((t) => {
      const arch = ARCHETYPES.find((a) => a.id === t.archetype)
      if (!arch) return false
      if (category !== 'Tous' && arch.category !== category) return false
      if (paletteFilter !== 'Tous' && t.paletteId !== paletteFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.name.toLowerCase().includes(q) && !arch.description.toLowerCase().includes(q)) return false
      }
      return true
    })

    if (sortBy === 'palette') {
      result.sort((a, b) => {
        const pa = PALETTES.find((p) => p.id === a.paletteId)?.name ?? ''
        const pb = PALETTES.find((p) => p.id === b.paletteId)?.name ?? ''
        return pa.localeCompare(pb)
      })
    } else if (sortBy === 'style') {
      result.sort((a, b) => {
        const ca = ARCHETYPES.find((a2) => a2.id === a.archetype)?.category ?? ''
        const cb = ARCHETYPES.find((a2) => a2.id === b.archetype)?.category ?? ''
        return ca.localeCompare(cb)
      })
    }

    return result
  }, [search, category, paletteFilter, typeFilter, sortBy])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of TEMPLATES) {
      counts[t.cardType] = (counts[t.cardType] || 0) + 1
    }
    return counts
  }, [])

  const activeTypeLabel = typeFilter === 'Tous' ? 'Tous les types' : CARD_TYPES.find((t) => t.id === typeFilter)?.label ?? ''

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Galerie de Modèles</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{TEMPLATES.length} modèles — {ARCHETYPES.length} styles × {PALETTES.length} palettes</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Card type tabs — primary filter */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Type de carte :</span>
            <button
              type="button"
              onClick={() => setTypeFilter('Tous')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                typeFilter === 'Tous'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tous ({TEMPLATES.length})
            </button>
            {CARD_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === t.id
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.label} ({typeCounts[t.id] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Rechercher un modèle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1 min-w-[140px]"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-auto" title="Filtrer par style">
            {ARCHETYPE_CATEGORIES.map((c) => (
              <option key={c} value={c}>Style : {c}</option>
            ))}
          </select>
          <select value={paletteFilter} onChange={(e) => setPaletteFilter(e.target.value)} className="input w-auto" title="Filtrer par palette">
            <option value="Tous">Toutes les palettes</option>
            {PALETTES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="input w-auto" title="Trier">
            <option value="default">Tri : Par défaut</option>
            <option value="palette">Tri : Par palette</option>
            <option value="style">Tri : Par style</option>
          </select>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
            {filtered.length} modèle{filtered.length > 1 ? 's' : ''} — {activeTypeLabel}
          </span>
        </div>

        {/* Gallery grid */}
        <div className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((tpl) => {
              const isActive = currentTemplateId === tpl.id
              const arch = ARCHETYPES.find((a) => a.id === tpl.archetype)
              const pal = PALETTES.find((p) => p.id === tpl.paletteId)
              const typeLabel = CARD_TYPES.find((t) => t.id === tpl.cardType)?.label ?? ''
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    onSelect(cardFromTemplate(tpl.id))
                    onClose()
                  }}
                  className={`group rounded-xl border-2 p-2 transition-all flex flex-col gap-2 ${
                    isActive
                      ? 'border-slate-900 dark:border-indigo-500 ring-2 ring-slate-900/10 dark:ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md'
                  }`}
                >
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800" style={{ height: 130 }}>
                    <div style={{ transform: 'scale(0.30)', transformOrigin: 'center center', pointerEvents: 'none' }}>
                      <CardFace card={{ ...tpl.card, id: 'preview' }} face="front" />
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">
                    {arch?.name}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{typeLabel}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{arch?.category}</span>
                    {pal && (
                      <span className="flex gap-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: pal.bg1 }} />
                        <span className="w-2 h-2 rounded-full" style={{ background: pal.accent }} />
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
              Aucun modèle ne correspond à votre recherche.
              <br />
              <button type="button" onClick={() => { setSearch(''); setCategory('Tous'); setPaletteFilter('Tous'); setTypeFilter('Tous') }} className="mt-3 text-xs text-slate-600 dark:text-slate-400 underline hover:text-slate-900 dark:hover:text-slate-100">
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
