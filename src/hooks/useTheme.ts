import { useEffect, useState, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'cdv-theme'

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemDark() ? 'dark' : 'light'
  return mode
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  if (resolved === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    return 'system'
  })
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme(
    (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'system'
  ))

  useEffect(() => {
    const r = resolveTheme(mode)
    setResolved(r)
    applyTheme(r)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const r = resolveTheme('system')
      setResolved(r)
      applyTheme(r)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const setMode = useCallback((m: ThemeMode) => setModeState(m), [])

  return { mode, resolved, setMode }
}
