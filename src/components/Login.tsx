import { useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'signin' | 'signup'

export function Login() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        // Email confirmation is off, but some setups require it — check session
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          setError('Compte créé. Vérifiez votre boîte mail si une confirmation est demandée, puis connectez-vous.')
          setMode('signin')
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.'
      setError(friendly(msg))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-bold">
            CDV
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none dark:text-slate-100">Carte de Visite</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Personnalisateur recto / verso</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-7">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
            <TabBtn active={mode === 'signin'} onClick={() => setMode('signin')}>Connexion</TabBtn>
            <TabBtn active={mode === 'signup'} onClick={() => setMode('signup')}>Inscription</TabBtn>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Mot de passe</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {busy ? 'Veuillez patienter…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          {mode === 'signin' ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            className="text-slate-700 dark:text-slate-300 font-medium hover:underline"
          >
            {mode === 'signin' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const style: CSSProperties = active
    ? { background: 'var(--tab-bg, #fff)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
    : {}
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
        active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function friendly(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'Email ou mot de passe incorrect.'
  if (m.includes('user already registered')) return 'Un compte existe déjà avec cet email. Connectez-vous.'
  if (m.includes('password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Trop de tentatives. Réessayez dans un instant.'
  return msg
}
