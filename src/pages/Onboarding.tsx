import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

const RESERVED = new Set([
  'login', 'logout', 'signup', 'onboarding', 'dashboard', 'admin', 'api',
  'tap', 'zakapedia', 'settings', 'account', 'profile', 'about', 'terms',
  'privacy', 'help', 'support', 'favicon', 'robots', 'auth',
])

function isValidUsername(u: string) {
  return /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(u)
}

export function Onboarding() {
  const { user, refreshTapUser } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const lowered = username.toLowerCase()
  const isValid = isValidUsername(lowered)
  const isReserved = RESERVED.has(lowered)

  async function checkAvailability() {
    if (!isValid || isReserved) return
    setChecking(true)
    const { data } = await supabase.from('users').select('id').eq('username', lowered).maybeSingle()
    setAvailable(!data)
    setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !available) return
    setError('')
    setSaving(true)
    try {
      const { error: userError } = await supabase.from('users').insert({ id: user.id, username: lowered, email: user.email ?? '' })
      if (userError) throw userError
      const { error: pageError } = await supabase.from('pages').insert({ user_id: user.id, theme: 'minimal', accent_color: '#3B82F6', name: '', bio: '', published: false })
      if (pageError) throw pageError
      await refreshTapUser()
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  function hint() {
    if (!lowered) return null
    if (!isValid) return { ok: false, text: '3–30 chars, lowercase letters, numbers, or hyphens.' }
    if (isReserved) return { ok: false, text: 'This username is reserved.' }
    if (available === null) return null
    if (available) return { ok: true, text: `tap.zakapedia.in/${lowered} is yours!` }
    return { ok: false, text: 'Username is taken. Try another.' }
  }

  const h = hint()

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-12"><Logo /></div>

        <h1 className="font-display italic text-4xl text-brand-text mb-2">
          Pick your username.
        </h1>
        <p className="text-brand-muted text-sm mb-10">
          This becomes your public page URL. You can't change it later.
        </p>

        {error && (
          <div className="mb-5 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-brand-muted">Username</label>
            <div className="flex rounded-xl border border-brand-border overflow-hidden focus-within:border-brand-muted transition-colors bg-brand-surface">
              <span className="flex items-center px-3 text-xs text-brand-faint border-r border-brand-border select-none whitespace-nowrap">
                tap.zakapedia.in/
              </span>
              <div className="flex-1 flex items-center">
                <input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value.toLowerCase()); setAvailable(null) }}
                  onBlur={checkAvailability}
                  placeholder="yourname"
                  className="flex-1 px-3 py-3 text-sm bg-transparent text-brand-text placeholder:text-brand-faint focus:outline-none"
                  maxLength={30}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                {checking && (
                  <span className="pr-3">
                    <span className="w-4 h-4 border-2 border-brand-border border-t-brand-muted rounded-full animate-spin block" />
                  </span>
                )}
              </div>
            </div>
            {h && (
              <p className={`text-xs ${h.ok ? 'text-green-400' : 'text-red-400'}`}>{h.text}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!available || saving || !isValid}
            className="w-full mt-2 bg-brand-gold text-brand-dark text-sm font-bold py-3 rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />}
            Claim @{lowered || 'username'}
          </button>
        </form>
      </div>
    </div>
  )
}
