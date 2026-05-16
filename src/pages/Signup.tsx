import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Logo } from '../components/Logo'

export function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await signUp(email, password)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message ?? 'Sign-up failed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
          </div>
          <h1 className="font-display italic text-3xl text-brand-text mb-3">Check your email</h1>
          <p className="text-brand-muted text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-brand-text">{email}</span>.
            Click it to activate your account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 text-sm font-medium text-brand-gold hover:text-brand-gold-light transition-colors"
          >
            Back to sign in →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text flex">

      {/* Left brand panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between border-r border-brand-border p-12">
        <Logo linkTo="/" />

        <div>
          <h1 className="font-display italic text-[72px] leading-[0.9] text-brand-text mb-6">
            Your page.<br />
            <span className="text-brand-gold">Free.</span><br />
            Always.
          </h1>
          <p className="text-brand-faint text-lg leading-relaxed max-w-xs">
            No plans. No paywalls. Three beautiful themes. Create your page in minutes.
          </p>
        </div>

        <p className="text-xs text-brand-faint">tap.zakapedia.in</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10"><Logo linkTo="/" /></div>

          <h2 className="text-xl font-semibold text-brand-text mb-1">Create your page</h2>
          <p className="text-sm text-brand-muted mb-8">
            Already have one?{' '}
            <Link to="/login" className="text-brand-gold hover:text-brand-gold-light transition-colors">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="mb-5 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-brand-gold text-brand-dark text-sm font-bold py-3 rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Spinner />}
              Create free account
            </button>
          </form>

          <p className="text-center text-xs text-brand-faint mt-6">
            By signing up you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-brand-muted">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-faint focus:border-brand-muted focus:outline-none transition-colors"
      />
    </div>
  )
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
}

