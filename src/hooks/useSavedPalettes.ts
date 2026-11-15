import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { SavedPalette } from '../types'

type DbRow = {
  id: string
  name: string
  bg1: string
  bg2: string
  text: string
  accent: string
  muted: string
  border: string
  dark: boolean
}

export function useSavedPalettes(userId: string | undefined) {
  const [palettes, setPalettes] = useState<SavedPalette[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('saved_palettes')
        .select('id, name, bg1, bg2, text, accent, muted, border, dark')
        .order('cree_le', { ascending: false })
      if (cancelled) return
      if (!error && data) {
        setPalettes((data as DbRow[]).map((r) => ({ ...r, dark: !!r.dark })))
      }
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [userId])

  const savePalette = useCallback(async (p: Omit<SavedPalette, 'id'>): Promise<SavedPalette | null> => {
    const { data, error } = await supabase
      .from('saved_palettes')
      .insert({ name: p.name, bg1: p.bg1, bg2: p.bg2, text: p.text, accent: p.accent, muted: p.muted, border: p.border, dark: p.dark })
      .select('id, name, bg1, bg2, text, accent, muted, border, dark')
      .maybeSingle()
    if (error || !data) return null
    const newPal = { ...(data as DbRow), dark: !!(data as DbRow).dark } as SavedPalette
    setPalettes((prev) => [newPal, ...prev])
    return newPal
  }, [])

  const deletePalette = useCallback(async (id: string) => {
    await supabase.from('saved_palettes').delete().eq('id', id)
    setPalettes((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { palettes, loaded, savePalette, deletePalette }
}
