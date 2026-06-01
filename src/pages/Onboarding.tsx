import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, Palette, Briefcase, Store, Wrench, Mic, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'
import { SECTION_META, SECTIONS_BY_TYPE } from '../constants/sectionMeta'
import { extractResume } from '../services/ai'
import type { ProfileType, Theme } from '../types'

// ── Static config ────────────────────────────────────────────────────────────

const RESERVED = new Set([
  'login', 'logout', 'signup', 'onboarding', 'dashboard', 'admin', 'api',
  'tap', 'zakapedia', 'settings', 'account', 'profile', 'about', 'terms',
  'privacy', 'help', 'support', 'favicon', 'robots', 'auth',
])

function isValidUsername(u: string) {
  return /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(u)
}

const PROFILE_TYPES: { id: ProfileType; icon: LucideIcon; label: string; desc: string }[] = [
  { id: 'creator',      icon: Palette,   label: 'Creator',            desc: 'Blogger, YouTuber, podcaster, Reels creator' },
  { id: 'professional', icon: Briefcase, label: 'Professional',       desc: 'Freelancer, consultant, designer, IT pro' },
  { id: 'business',     icon: Store,     label: 'Business',           desc: 'Shop, salon, bakery, local service' },
  { id: 'service_pro',  icon: Wrench,    label: 'Service Pro',        desc: 'Doctor, lawyer, tutor, photographer, trainer' },
  { id: 'speaker',      icon: Mic,       label: 'Speaker / Networker', desc: 'Conference speaker, event attendee, networker' },
]

const THEME_RECOMMENDATIONS: Record<ProfileType, Theme> = {
  creator: 'editorial', professional: 'minimal', business: 'expressive',
  service_pro: 'minimal', speaker: 'minimal',
}

const DEFAULT_ACCENTS: Record<Theme, string> = {
  editorial: '#F59E0B', minimal: '#3B82F6', expressive: '#8B5CF6',
}


interface TypeField { roleLabel: string; rolePlaceholder: string; namePlaceholder: string; bioPlaceholder: string }
const TYPE_FIELDS: Record<ProfileType, TypeField> = {
  creator:      { namePlaceholder: 'Your name or creator handle',     roleLabel: 'Content Niche',       rolePlaceholder: 'e.g. Tech & Lifestyle, Food, Travel…',      bioPlaceholder: 'Tell your audience what you create and why they should follow…' },
  professional: { namePlaceholder: 'Your full name',                  roleLabel: 'Job Title',           rolePlaceholder: 'e.g. UI/UX Designer, Full-Stack Developer…', bioPlaceholder: 'What you do and who you help — make it specific…' },
  business:     { namePlaceholder: 'Business name',                   roleLabel: 'Category',            rolePlaceholder: 'e.g. Home Bakery, Meat Shop, Salon…',        bioPlaceholder: 'What makes your business special — products, story, vibe…' },
  service_pro:  { namePlaceholder: 'Full name (Dr. / Adv. if applicable)', roleLabel: 'Specialisation', rolePlaceholder: 'e.g. Cardiologist, Corporate Lawyer…',     bioPlaceholder: 'Your expertise and how you help patients or clients…' },
  speaker:      { namePlaceholder: 'Your full name',                  roleLabel: 'Current Role',        rolePlaceholder: 'e.g. Tech Consultant & Speaker…',            bioPlaceholder: 'Your story, talk topics, and what drives you…' },
}

const THEMES: { id: Theme; label: string; desc: string; bg: string; accent: string; textColor: string }[] = [
  { id: 'editorial',  label: 'Editorial',  desc: 'Bold, magazine-feel, serif typography',    bg: '#060608', accent: '#F59E0B', textColor: '#F2EDE4' },
  { id: 'minimal',    label: 'Minimal',    desc: 'Clean, credible, generous whitespace',      bg: '#FAFAFA', accent: '#3B82F6', textColor: '#1a1a1a' },
  { id: 'expressive', label: 'Expressive', desc: 'Colourful, playful, full of personality',  bg: '#F3E8FF', accent: '#8B5CF6', textColor: '#1a1a1a' },
]

// ── Component ────────────────────────────────────────────────────────────────

export function Onboarding() {
  const { user, refreshTapUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)

  // Step 1 — profile type
  const [profileType, setProfileType] = useState<ProfileType | null>(null)

  // Step 2 — basic details
  const [username, setUsername] = useState('')
  const [name, setName] = useState(() => (user as { user_metadata?: { full_name?: string; name?: string } } | null)?.user_metadata?.full_name ?? '')
  const [bio, setBio] = useState('')
  const [role, setRole] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)

  // Step 3 — sections
  const [enabledSections, setEnabledSections] = useState<Set<string>>(new Set())

  // Step 4 — theme
  const [theme, setTheme] = useState<Theme>('minimal')

  // Resume upload (professional + service_pro only)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [resumeExtracting, setResumeExtracting] = useState(false)
  const [resumeExtracted, setResumeExtracted] = useState(false)
  const [resumeError, setResumeError] = useState('')
  const [resumeData, setResumeData] = useState<import('../services/ai').ResumeData | null>(null)

  // Submit
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ── Derived ────────────────────────────────────────────────────────────────
  const lowered = username.toLowerCase()
  const usernameValid = isValidUsername(lowered) && !RESERVED.has(lowered)

  // ── Handlers ───────────────────────────────────────────────────────────────
  function selectProfileType(type: ProfileType) {
    setProfileType(type)
    setEnabledSections(new Set(SECTIONS_BY_TYPE[type]))
    setTheme(THEME_RECOMMENDATIONS[type])
    setStep(2)
  }

  async function checkAvailability() {
    if (!usernameValid) return
    setChecking(true)
    const { data } = await supabase.from('users').select('id').eq('username', lowered).maybeSingle()
    setAvailable(!data)
    setChecking(false)
  }

  function toggleSection(type: string) {
    setEnabledSections(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function usernameHint() {
    if (!lowered) return null
    if (RESERVED.has(lowered)) return { ok: false, text: 'This username is reserved.' }
    if (!isValidUsername(lowered)) return { ok: false, text: '3–30 chars, lowercase letters, numbers, or hyphens.' }
    if (available === true) return { ok: true, text: `tap.zakapedia.in/${lowered} is yours!` }
    if (available === false) return { ok: false, text: 'Username is taken. Try another.' }
    return null
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setResumeError('File too large — max 5 MB.'); return }
    setResumeError('')
    setResumeExtracting(true)
    setResumeExtracted(false)
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      const base64 = btoa(binary)
      const extracted = await extractResume(base64)
      if (extracted.name) setName(extracted.name)
      if (extracted.role) setRole(extracted.role)
      if (extracted.bio) setBio(extracted.bio.slice(0, 500))
      setResumeData(extracted)

      // Auto-enable sections for any field the resume returned data for
      const autoSections: Record<string, boolean> = {
        skills:      !!extracted.skills,
        services:    !!extracted.services,
        credentials: !!extracted.credentials,
        talks:       !!extracted.talks,
        contact:     !!(extracted.phone),
      }
      setEnabledSections(prev => {
        const next = new Set(prev)
        Object.entries(autoSections).forEach(([type, has]) => { if (has) next.add(type) })
        return next
      })

      setResumeExtracted(true)
    } catch (err) {
      setResumeError((err as Error).message ?? 'Could not read resume. Fill in manually.')
    } finally {
      setResumeExtracting(false)
      if (resumeInputRef.current) resumeInputRef.current.value = ''
    }
  }

  async function handleCreate() {
    if (!user || !profileType || !available) return
    setSaving(true)
    setError('')
    try {
      // 1. Create tap user
      const { error: userErr } = await supabase.from('users').insert({
        id: user.id, username: lowered,
      })
      if (userErr) throw userErr

      // 2. Create page with profile type and theme
      const { data: pageData, error: pageErr } = await supabase
        .from('pages')
        .insert({
          user_id: user.id,
          theme,
          accent_color: DEFAULT_ACCENTS[theme],
          name,
          bio,
          role: role || null,
          profile_type: profileType,
          published: false,
        })
        .select('id')
        .single()
      if (pageErr) throw pageErr

      // 3. Create selected sections, pre-filled from resume if available
      const pageId = pageData.id
      const rd = resumeData
      const sectionRows = Array.from(enabledSections).map((type, i) => {
        const content: Record<string, string> = {}
        if (type === 'about') content.text = bio
        if (type === 'contact') {
          content.email = user.email ?? ''
          if (rd?.phone) content.phone = rd.phone
        }
        if (type === 'skills' && rd?.skills) content.text = rd.skills
        if (type === 'services' && rd?.services) content.text = rd.services
        if (type === 'credentials' && rd?.credentials) content.text = rd.credentials
        if (type === 'talks' && rd?.talks) content.text = rd.talks
        return { page_id: pageId, type, position: i, content }
      })
      if (sectionRows.length > 0) {
        const { error: secErr } = await supabase.from('sections').insert(sectionRows)
        if (secErr) throw secErr
      }

      // 4. Grant 20 free signup credits (deduct 5 if resume was parsed)
      await supabase.rpc('grant_signup_bonus', { p_user_id: user.id })
      if (resumeExtracted) {
        await supabase.from('credits')
          .update({ balance: 15, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      }

      // 5. Apply referral if one was stored before signup
      try {
        const refCode = localStorage.getItem('tap_referral')
        if (refCode && refCode !== lowered) {
          const { data: referrer } = await supabase.from('users').select('id').eq('username', refCode).maybeSingle()
          if (referrer) {
            await supabase.from('referrals').insert({
              referrer_user_id: referrer.id,
              referred_user_id: user.id,
              credits_awarded: 20,
            })
            const { data: rc } = await supabase.from('credits').select('balance').eq('user_id', referrer.id).maybeSingle()
            const newBal = ((rc as { balance: number } | null)?.balance ?? 0) + 20
            await supabase.from('credits').update({ balance: newBal, updated_at: new Date().toISOString() }).eq('user_id', referrer.id)
          }
        }
      } catch {
        // Referral errors never block account creation
      } finally {
        localStorage.removeItem('tap_referral')
      }

      await refreshTapUser()
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message ?? 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  const hint = usernameHint()
  const fields = profileType ? TYPE_FIELDS[profileType] : null

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-dark text-brand-text flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5 bg-brand-border">
        <div
          className="h-full bg-brand-gold transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <Logo />
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1 text-xs text-brand-faint hover:text-brand-muted transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="px-5 pb-1">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-brand-faint uppercase">
          Step {step} of 5
        </span>
      </div>

      {/* ── STEP 1 — Profile type ── */}
      {step === 1 && (
        <div className="flex-1 px-5 pt-4 pb-10 overflow-y-auto">
          <h1 className="font-display italic text-3xl sm:text-4xl text-brand-text mb-2">
            What best describes you?
          </h1>
          <p className="text-brand-muted text-sm mb-8">
            This shapes your page, sections, and AI output.
          </p>
          <div className="flex flex-col gap-3">
            {PROFILE_TYPES.map(pt => {
              const PtIcon = pt.icon
              return (
              <button
                key={pt.id}
                onClick={() => selectProfileType(pt.id)}
                className="w-full flex items-center gap-4 bg-brand-surface border border-brand-border rounded-2xl px-5 py-4 text-left hover:border-brand-muted hover:bg-brand-border/40 transition-all group"
              >
                <PtIcon className="w-6 h-6 text-brand-faint group-hover:text-brand-muted transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-brand-text group-hover:text-white transition-colors">
                    {pt.label}
                  </div>
                  <div className="text-xs text-brand-faint mt-0.5">{pt.desc}</div>
                </div>
              </button>
            )
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2 — Basic details ── */}
      {step === 2 && profileType && fields && (
        <div className="flex-1 px-5 pt-4 pb-10 overflow-y-auto">
          <h1 className="font-display italic text-3xl sm:text-4xl text-brand-text mb-2">
            Tell us about yourself.
          </h1>
          <p className="text-brand-muted text-sm mb-8">
            These fill your page. You can edit everything later.
          </p>

          <div className="flex flex-col gap-5">
            {/* Resume upload — professional + service_pro only */}
            {(profileType === 'professional' || profileType === 'service_pro') && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-muted">Resume <span className="text-brand-faint font-normal">(optional)</span></label>
                <label className={`flex items-center justify-center gap-2 border border-dashed rounded-xl px-4 py-4 cursor-pointer transition-colors text-xs ${
                  resumeExtracting
                    ? 'border-brand-border text-brand-faint cursor-wait'
                    : resumeExtracted
                      ? 'border-green-800/50 bg-green-950/20 text-green-400 hover:bg-green-950/30'
                      : 'border-brand-border text-brand-faint hover:border-brand-muted hover:text-brand-muted'
                }`}>
                  {resumeExtracting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-brand-border border-t-brand-muted rounded-full animate-spin flex-shrink-0" />
                      Reading resume…
                    </>
                  ) : resumeExtracted ? (
                    <>
                      <Check className="w-4 h-4 flex-shrink-0" />
                      Fields filled — upload another to replace
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      Upload PDF — AI fills your details
                      <span className="text-brand-faint font-normal">· 5 credits</span>
                    </>
                  )}
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleResumeUpload}
                    disabled={resumeExtracting}
                  />
                </label>
                {resumeError && <p className="text-[10px] text-red-400">{resumeError}</p>}
                {resumeExtracted && <p className="text-[10px] text-brand-faint">Extracted from resume — review and edit below.</p>}
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-brand-muted">Your URL</label>
              <div className="flex rounded-xl border border-brand-border overflow-hidden focus-within:border-brand-muted transition-colors bg-brand-surface">
                <span className="flex items-center px-3 text-xs text-brand-faint border-r border-brand-border select-none whitespace-nowrap">
                  tap.zakapedia.in/
                </span>
                <div className="flex-1 flex items-center">
                  <input
                    value={username}
                    onChange={e => { setUsername(e.target.value.toLowerCase()); setAvailable(null) }}
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
              {hint && (
                <p className={`text-xs ${hint.ok ? 'text-green-400' : 'text-red-400'}`}>{hint.text}</p>
              )}
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-brand-muted">
                {profileType === 'business' ? 'Business Name' : 'Full Name'}
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={fields.namePlaceholder}
                className="px-4 py-3 text-sm bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder:text-brand-faint focus:outline-none focus:border-brand-muted transition-colors"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-brand-muted">{fields.roleLabel}</label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder={fields.rolePlaceholder}
                className="px-4 py-3 text-sm bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder:text-brand-faint focus:outline-none focus:border-brand-muted transition-colors"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-brand-muted">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder={fields.bioPlaceholder}
                rows={4}
                maxLength={500}
                className="px-4 py-3 text-sm bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder:text-brand-faint focus:outline-none focus:border-brand-muted transition-colors resize-none"
              />
              <p className={`text-right text-[10px] tabular-nums transition-colors ${bio.length > 450 ? 'text-amber-400' : 'text-brand-faint'}`}>
                {bio.length}/500
              </p>
            </div>
          </div>

          <button
            onClick={() => { if (available && name.trim()) setStep(3) }}
            disabled={!available || !name.trim()}
            className="w-full mt-6 bg-brand-gold text-brand-dark text-sm font-bold py-3 rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {/* ── STEP 3 — Sections ── */}
      {step === 3 && profileType && (
        <div className="flex-1 px-5 pt-4 pb-10 overflow-y-auto">
          <h1 className="font-display italic text-3xl sm:text-4xl text-brand-text mb-2">
            What goes on your page?
          </h1>
          <p className="text-brand-muted text-sm mb-6">
            We've pre-selected the best sections for you. Toggle any you don't need.
          </p>

          <div className="flex flex-col gap-2">
            {SECTIONS_BY_TYPE[profileType].map(type => {
              const meta = SECTION_META[type]
              const SectionIcon = meta.icon
              const on = enabledSections.has(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleSection(type)}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                    on
                      ? 'bg-brand-gold/[0.08] border-brand-gold/50'
                      : 'bg-brand-surface border-brand-border hover:border-brand-muted/40'
                  }`}
                >
                  <SectionIcon className={`w-5 h-5 flex-shrink-0 transition-colors ${on ? 'text-brand-gold' : 'text-brand-faint'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm transition-colors ${on ? 'text-brand-gold' : 'text-brand-text'}`}>
                      {meta.label}
                    </div>
                    <div className="text-xs text-brand-faint mt-0.5">{meta.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                    on ? 'bg-brand-gold border-brand-gold' : 'border-brand-border'
                  }`}>
                    {on && <Check className="w-3 h-3 text-brand-dark" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Callout */}
          <div className="mt-5 flex items-start gap-3 bg-brand-surface border border-brand-border rounded-2xl px-4 py-3.5">
            <span className="text-brand-gold text-base leading-none mt-0.5">✦</span>
            <p className="text-xs text-brand-muted leading-relaxed">
              You'll fill in the content for each section from the{' '}
              <span className="text-brand-text font-semibold">Portfolio tab</span> in your dashboard — no need to do it now.
            </p>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full mt-5 bg-brand-gold text-brand-dark text-sm font-bold py-3 rounded-xl hover:bg-brand-gold-light transition-colors"
          >
            Continue ({enabledSections.size} section{enabledSections.size !== 1 ? 's' : ''})
          </button>
        </div>
      )}

      {/* ── STEP 4 — Theme ── */}
      {step === 4 && profileType && (
        <div className="flex-1 px-5 pt-4 pb-10 overflow-y-auto">
          <h1 className="font-display italic text-3xl sm:text-4xl text-brand-text mb-2">
            Pick your look.
          </h1>
          <p className="text-brand-muted text-sm mb-8">
            Each theme is a complete design system — not just a colour swap.
          </p>

          <div className="flex flex-col gap-3">
            {THEMES.map(t => {
              const recommended = t.id === THEME_RECOMMENDATIONS[profileType]
              const selected = theme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                    selected ? 'border-brand-gold bg-brand-gold/[0.06]' : 'border-brand-border bg-brand-surface hover:border-brand-muted/40'
                  }`}
                >
                  {/* Mini theme preview swatch */}
                  <div
                    className="w-12 h-10 rounded-lg flex-shrink-0 relative overflow-hidden"
                    style={{ background: t.bg }}
                  >
                    <div className="absolute inset-x-2 top-2 h-1.5 rounded-full" style={{ background: t.accent }} />
                    <div className="absolute inset-x-2 bottom-2 h-1 rounded-full opacity-40" style={{ background: t.textColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${selected ? 'text-brand-gold' : 'text-brand-text'}`}>
                        {t.label}
                      </span>
                      {recommended && (
                        <span className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-brand-faint mt-0.5">{t.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? 'bg-brand-gold border-brand-gold' : 'border-brand-border'
                  }`}>
                    {selected && <Check className="w-3 h-3 text-brand-dark" />}
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setStep(5)}
            className="w-full mt-6 bg-brand-gold text-brand-dark text-sm font-bold py-3 rounded-xl hover:bg-brand-gold-light transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* ── STEP 5 — Summary & create ── */}
      {step === 5 && profileType && (
        <div className="flex-1 px-5 pt-4 pb-10 overflow-y-auto">
          <h1 className="font-display italic text-3xl sm:text-4xl text-brand-text mb-2">
            Ready to launch.
          </h1>
          <p className="text-brand-muted text-sm mb-8">
            Your page will be created — then generate your portfolio with AI from the dashboard.
          </p>

          {/* Summary */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-brand-border">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-brand-faint uppercase mb-3">Your setup</p>
              <div className="flex flex-col gap-3">
                <Row label="Profile type" value={PROFILE_TYPES.find(p => p.id === profileType)!.label} />
                <Row label="URL" value={`tap.zakapedia.in/${lowered}`} />
                <Row label="Name" value={name || '—'} />
                <Row label="Theme" value={THEMES.find(t => t.id === theme)!.label} />
                <Row label="Sections" value={`${enabledSections.size} selected`} />
              </div>
            </div>
            <div className="px-5 py-4 bg-brand-gold/[0.04]">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-brand-gold uppercase mb-1">Free credits on us</p>
              {resumeExtracted ? (
                <p className="text-xs text-brand-muted">
                  You'll start with <span className="text-brand-gold font-semibold">15 credits</span> — 20 free minus 5 for resume parsing.
                </p>
              ) : (
                <p className="text-xs text-brand-muted">You'll receive <span className="text-brand-gold font-semibold">20 free credits</span> — enough for 2 portfolio generations. No card required.</p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving || !available}
            className="w-full bg-brand-gold text-brand-dark text-sm font-bold py-3.5 rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Creating your page…' : 'Create My Page →'}
          </button>
          <p className="text-center text-[11px] text-brand-faint mt-3">
            You can edit everything from the dashboard.
          </p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-brand-faint flex-shrink-0">{label}</span>
      <span className="text-xs text-brand-text text-right">{value}</span>
    </div>
  )
}
