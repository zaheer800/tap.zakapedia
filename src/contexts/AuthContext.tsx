import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { TapUser } from '../types'

interface AuthContextType {
  user: User | null
  tapUser: TapUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshTapUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tapUser, setTapUser] = useState<TapUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchTapUser(uid: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .maybeSingle()
    setTapUser(data ?? null)
  }

  useEffect(() => {
    // Initial session — sets loading=false only after tapUser is fetched
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchTapUser(u.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION is already handled by getSession above; skip to avoid double-fetch
      if (event === 'INITIAL_SESSION') return

      const u = session?.user ?? null
      setUser(u)
      if (u) {
        // Keep loading=true while we fetch tapUser so Dashboard doesn't
        // prematurely redirect to /onboarding before the fetch completes
        setLoading(true)
        fetchTapUser(u.id).finally(() => setLoading(false))
      } else {
        setTapUser(null)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth` },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshTapUser() {
    if (user) await fetchTapUser(user.id)
  }

  return (
    <AuthContext.Provider
      value={{ user, tapUser, loading, signIn, signUp, signInWithGoogle, signOut, refreshTapUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
