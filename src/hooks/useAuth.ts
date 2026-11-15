import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AuthState = {
  session: Session | null
  user: User | null
  loading: boolean
}

/**
 * Tracks the Supabase auth session and ensures a profile row exists in the
 * `users` table for every newly authenticated user. The profile insert runs
 * inside an async IIFE in the onAuthStateChange callback to avoid the
 * deadlock that an awaited Supabase call inside the listener creates.
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        // IIFE avoids awaiting inside the synchronous onAuthStateChange handler
        ;(async () => {
          const user = newSession.user!
          await supabase
            .from('users')
            .upsert(
              { id: user.id, email: user.email ?? '' },
              { onConflict: 'id', ignoreDuplicates: false },
            )
        })()
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { session, user: session?.user ?? null, loading }
}
