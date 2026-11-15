import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CardData } from '../types'
import { defaultCard, migrateOldCard } from '../types'

const TYPE = 'business_card'

type DbRow = {
  id: string
  type: string
  champs: Record<string, unknown>
  style: Record<string, unknown>
}

function cardToRow(card: CardData) {
  return {
    id: card.id,
    type: TYPE,
    champs: {
      archetype: card.archetype,
      cardType: card.cardType,
      fields: card.fields,
      fieldStyles: card.fieldStyles,
      background: card.background,
      border: card.border,
      effects: card.effects,
      qr: card.qr,
      logo: card.logo,
      profilePhoto: card.profilePhoto,
      socialLinks: card.socialLinks,
      decorativeLine: card.decorativeLine,
      icons: card.icons ?? [],
      cardSize: card.cardSize,
      paletteName: card.paletteName,
    },
    style: {},
  }
}

function rowToCard(row: DbRow): CardData {
  const c = row.champs ?? {}

  // Check if new format (has archetype key)
  if (c.archetype) {
    return {
      id: row.id,
      archetype: c.archetype as CardData['archetype'],
      cardType: (c.cardType as CardData['cardType']) ?? 'professionnel',
      fields: c.fields as CardData['fields'],
      fieldStyles: c.fieldStyles as CardData['fieldStyles'],
      background: c.background as CardData['background'],
      border: c.border as CardData['border'],
      effects: c.effects as CardData['effects'],
      qr: c.qr as CardData['qr'],
      logo: c.logo as CardData['logo'],
      decorativeLine: c.decorativeLine as CardData['decorativeLine'],
      icons: (c.icons as CardData['icons']) ?? [],
      profilePhoto: (c.profilePhoto as CardData['profilePhoto']) ?? { enabled: false, image: null, size: 80, x: 50, y: 50, shape: 'circle', opacity: 1 },
      socialLinks: (c.socialLinks as CardData['socialLinks']) ?? { linkedin: '', instagram: '', facebook: '', twitter: '', whatsapp: '', telegram: '', youtube: '', tiktok: '' },
      cardSize: c.cardSize as CardData['cardSize'],
      paletteName: c.paletteName as string,
    }
  }

  // Old format — migrate
  const oldCard: Record<string, unknown> = { id: row.id, ...c, ...row.style }
  return migrateOldCard(oldCard)
}

export function useCards(userId: string | undefined) {
  const [cards, setCards] = useState<CardData[]>([defaultCard()])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [prevUserId, setPrevUserId] = useState<string | undefined>(userId)
  const skipSave = useRef(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  if (userId !== prevUserId) {
    setPrevUserId(userId)
    skipSave.current = true
    setCards([defaultCard()])
    setLoaded(false)
  }

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    ;(async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, type, champs, style')
        .eq('type', TYPE)
        .order('cree_le', { ascending: true })

      if (cancelled) return
      if (error || !data || data.length === 0) {
        setCards([defaultCard()])
      } else {
        setCards((data as DbRow[]).map(rowToCard))
      }
      setLoaded(true)
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!loaded || !userId) return
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      const rows = cards.map(cardToRow)
      const { error } = await supabase
        .from('documents')
        .upsert(rows, { onConflict: 'id' })
      if (error) console.error('save cards:', error.message)
      setSaving(false)
    }, 800)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [cards, loaded, userId])

  const deleteCardDb = useCallback(
    (id: string) => {
      if (!userId) return
      supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('delete card:', error.message)
        })
    },
    [userId],
  )

  const flushSave = useCallback(() => {
    if (!loaded || !userId) return
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = undefined
      const rows = cards.map(cardToRow)
      supabase
        .from('documents')
        .upsert(rows, { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('flush save:', error.message)
        })
    }
  }, [loaded, userId, cards])

  return { cards, setCards, loaded, saving, deleteCardDb, flushSave }
}
