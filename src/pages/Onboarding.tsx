import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const RESERVED = new Set([
  'login', 'logout', 'signup', 'onboarding', 'dashboard', 'admin', 'api',
  'tap', 'zakapedia', 'settings', 'account', 'profile', 'about', 'terms',
  'privacy', 'help', 'support', 'favicon', 'robots',
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
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', lowered)
      .maybeSingle()
    setAvailable(!data)
    setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !available) return
    setError('')
    setSaving(true)

    try {
      // Create tap.users record
      const { error: userError } = await supabase.from('users').insert({
        id: user.id,
        username: lowered,
        email: user.email ?? '',
      })
      if (userError) throw userError

      // Create default tap.pages record
      const { error: pageError } = await supabase.from('pages').insert({
        user_id: user.id,
        theme: 'minimal',
        accent_color: '#3B82F6',
        name: '',
        bio: '',
        published: false,
      })
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
    if (!isValid) return { ok: false, text: 'Username must be 3–30 chars, lowercase letters, numbers, or hyphens.' }
    if (isReserved) return { ok: false, text: 'This username is reserved.' }
    if (available === null) return null
    if (available) return { ok: true, text: `tap.zakapedia.in/${lowered} is available!` }
    return { ok: false, text: 'Username is taken.' }
  }

  const h = hint()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-xl font-bold text-gray-900">Tap</span>
          <h1 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">Choose your username</h1>
          <p className="text-sm text-gray-500">This becomes your public page URL.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Username</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:border-gray-900 transition-colors">
                <span className="flex items-center px-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none">
                  tap.zakapedia.in/
                </span>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase())
                    setAvailable(null)
                  }}
                  onBlur={checkAvailability}
                  placeholder="yourname"
                  className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
                  maxLength={30}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                {checking && (
                  <span className="flex items-center pr-3">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  </span>
                )}
              </div>
              {h && (
                <p className={`text-xs ${h.ok ? 'text-green-600' : 'text-red-500'}`}>
                  {h.text}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!available || saving || !isValid}
              className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Claim @{lowered || 'username'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
