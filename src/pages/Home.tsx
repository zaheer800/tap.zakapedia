import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Palette, Briefcase, ShoppingBag, Wrench, Mic, Sparkles } from 'lucide-react'
import { Logo, ZakapediaAttribution } from '../components/Logo'
import { Editorial } from '../components/themes/Editorial'
import { Minimal } from '../components/themes/Minimal'
import { Expressive } from '../components/themes/Expressive'
import type { Page, Link as TapLink, Theme } from '../types'

const THEMES: Theme[] = ['minimal', 'editorial', 'expressive']

const ACCENT: Record<Theme, string> = {
  minimal:    '#3B82F6',
  editorial:  '#F59E0B',
  expressive: '#8B5CF6',
}

const PREVIEW_PAGE: Page = {
  id: 'preview', user_id: '', theme: 'minimal', accent_color: '#3B82F6',
  name: 'Riya Kannan', bio: 'Creator · Podcast Host · Preset Maker',
  avatar_url: null, published: true,
}

const PREVIEW_LINKS: TapLink[] = [
  { id: '1', page_id: '', title: 'My Podcast',      url: '#', icon: '', position: 0, created_at: '' },
  { id: '2', page_id: '', title: 'Gumroad Presets',  url: '#', icon: '', position: 1, created_at: '' },
  { id: '3', page_id: '', title: 'Instagram',        url: '#', icon: '', position: 2, created_at: '' },
  { id: '4', page_id: '', title: 'YouTube',          url: '#', icon: '', position: 3, created_at: '' },
]

const MARQUEE_ITEMS = [
  'One link for everything', 'AI builds your story', 'Built in India',
  'Three design systems', 'NFC cards', 'Analytics built-in',
  '20 free credits', 'WhatsApp-first sharing', 'Your page in seconds',
]

const PROFILE_TYPES_DATA = [
  { Icon: Palette,     type: 'Creator',      desc: 'Podcasters, YouTubers, Reels creators',  theme: 'Editorial',  accent: '#F59E0B' },
  { Icon: Briefcase,   type: 'Professional', desc: 'Freelancers, consultants, designers',     theme: 'Minimal',    accent: '#3B82F6' },
  { Icon: ShoppingBag, type: 'Business',     desc: 'Shops, salons, home bakers, restaurants', theme: 'Expressive', accent: '#8B5CF6' },
  { Icon: Wrench,      type: 'Service Pro',  desc: 'Doctors, lawyers, photographers, tutors', theme: 'Minimal',    accent: '#10B981' },
  { Icon: Mic,         type: 'Speaker',      desc: 'Conference speakers, networkers',         theme: 'Minimal',    accent: '#EC4899' },
]

const CREDIT_PACKS = [
  { name: 'Starter',  credits: 20,  price: '₹0',   note: 'Free on signup',  highlight: false },
  { name: 'Basic',    credits: 50,  price: '₹49',  note: 'Buy anytime',     highlight: false },
  { name: 'Standard', credits: 150, price: '₹99',  note: 'Most popular',    highlight: true  },
  { name: 'Pro',      credits: 500, price: '₹249', note: 'For power users', highlight: false },
]

export function Home() {
  const [themeIdx, setThemeIdx] = useState(0)
  const activeTheme = THEMES[themeIdx]

  useEffect(() => {
    const t = setInterval(() => setThemeIdx((i) => (i + 1) % THEMES.length), 3200)
    return () => clearInterval(t)
  }, [])

  const previewPage: Page = { ...PREVIEW_PAGE, theme: activeTheme, accent_color: ACCENT[activeTheme] }
  const ThemeComp = activeTheme === 'editorial' ? Editorial : activeTheme === 'expressive' ? Expressive : Minimal

  return (
    <div className="bg-brand-dark text-brand-text min-h-screen font-sans relative overflow-x-hidden">

      {/* Grain texture */}
      <div className="grain-overlay" />

      {/* Top accent rule */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

      {/* ── Nav ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-brand-border bg-brand-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <a
              href="#how-it-works"
              className="hidden sm:block text-sm text-brand-muted hover:text-brand-text transition-colors"
            >
              How it works
            </a>
            <Link to="/login" className="text-sm text-brand-muted hover:text-brand-text transition-colors px-3 py-1.5">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-12 lg:py-0 lg:min-h-[calc(100vh-65px)] grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-8 items-center">

        {/* Aurora blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-[5%] w-[520px] h-[520px] rounded-full bg-brand-gold/[0.05] blur-[110px] animate-blob-1" />
          <div className="absolute top-[20%] right-[-6%] w-[440px] h-[440px] rounded-full bg-blue-600/[0.04] blur-[100px] animate-blob-2" />
          <div className="absolute bottom-[-10%] left-[30%] w-[460px] h-[460px] rounded-full bg-violet-600/[0.035] blur-[110px] animate-blob-3" />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.013]"
          style={{ backgroundImage: 'radial-gradient(circle, #F2EDE4 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
        />

        {/* Text */}
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-brand-muted border border-brand-border rounded-full px-3 py-1.5 mb-10 uppercase animate-fade-in">
            <Sparkles className="w-3 h-3 text-brand-gold" />
            AI-powered · 20 free credits
          </div>

          <h1 className="font-display font-black leading-[0.84] mb-8 select-none">
            <span className="block animate-slide-up" style={{ animationDelay: '60ms' }}>
              <span className="text-[clamp(84px,12vw,152px)] text-brand-text">One</span>
            </span>
            <span className="block animate-slide-up" style={{ animationDelay: '160ms' }}>
              <span className="text-[clamp(84px,12vw,152px)] text-brand-gold italic">tap.</span>
              <span className="inline-block w-[0.055em] h-[0.68em] bg-brand-gold ml-[0.06em] translate-y-[-0.08em] animate-cursor-blink" />
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-brand-muted font-display leading-snug mb-4 animate-fade-in" style={{ animationDelay: '320ms' }}>
            All your links,
            <br />
            <span className="text-brand-text">one beautiful page.</span>
          </p>

          <p className="text-[14px] text-brand-faint max-w-[340px] mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '420ms' }}>
            Share one link everywhere — bio, work, socials, contact. AI writes your story and turns your links into a portfolio, not just a list.
          </p>

          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '520ms' }}>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-brand-gold text-brand-dark text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-brand-gold-light transition-all"
            >
              Create my page
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-brand-border text-brand-muted text-sm font-medium px-6 py-3.5 rounded-xl hover:border-brand-faint hover:text-brand-text transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center lg:justify-end pb-10 lg:pb-0">
          <div className="relative">
            <div
              className="absolute inset-[-28%] blur-3xl opacity-[0.18] rounded-full transition-all duration-1000"
              style={{ backgroundColor: ACCENT[activeTheme] }}
            />
            {/* Mobile phone */}
            <div className="relative sm:hidden w-[186px] h-[390px] rounded-[32px] border-[5px] border-brand-border bg-brand-surface overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.65)] animate-levitate">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-2.5 bg-brand-border rounded-full z-20" />
              <div style={{ width: '375px', height: '812px', transform: 'scale(0.48)', transformOrigin: 'top left', overflowY: 'hidden', pointerEvents: 'none' }}>
                <ThemeComp page={previewPage} links={PREVIEW_LINKS} isPreview />
              </div>
              <div className="absolute inset-0 pointer-events-none z-30">
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
              </div>
            </div>
            {/* Desktop phone */}
            <div className="relative hidden sm:block w-[248px] h-[520px] rounded-[42px] border-[6px] border-brand-border bg-brand-surface overflow-hidden shadow-[0_48px_96px_rgba(0,0,0,0.65)] animate-levitate">
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-brand-border rounded-full z-20" />
              <div style={{ width: '375px', height: '812px', transform: 'scale(0.661)', transformOrigin: 'top left', overflowY: 'hidden', pointerEvents: 'none' }}>
                <ThemeComp page={previewPage} links={PREVIEW_LINKS} isPreview />
              </div>
              <div className="absolute inset-0 pointer-events-none z-30">
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {THEMES.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setThemeIdx(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: themeIdx === i ? '22px' : '6px',
                    backgroundColor: themeIdx === i ? ACCENT[activeTheme] : '#2A2520',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-6 hidden lg:flex items-center gap-2.5 text-brand-faint/40 text-[10px] tracking-[0.22em] uppercase animate-fade-in" style={{ animationDelay: '900ms' }}>
          <div className="w-px h-8 bg-brand-border" />
          Scroll
        </div>
      </section>

      {/* ── Marquee ────────────────────────────────────── */}
      <div className="border-y border-brand-border bg-brand-surface/50 py-4 overflow-hidden">
        <div
          className="flex whitespace-nowrap will-change-transform"
          style={{ animation: 'marquee 18s linear infinite' }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-5 mx-6">
              <span className="text-[10px] font-semibold tracking-[0.22em] text-brand-muted/65 uppercase">{item}</span>
              <span className="text-brand-gold/60 text-[8px]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Profile Types ───────────────────────────────── */}
      <ProfileTypesSection />

      {/* ── How it works ───────────────────────────────── */}
      <HowItWorksSection />

      {/* ── Analytics ──────────────────────────────────── */}
      <AnalyticsSection />

      {/* ── Credits ────────────────────────────────────── */}
      <CreditsSection />

      {/* ── Physical products ──────────────────────────── */}
      <ProductsSection />

      {/* ── Themes ─────────────────────────────────────── */}
      <section className="py-28 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-4">Brand Identities</p>
              <h2 className="font-display font-bold text-[clamp(42px,6vw,80px)] leading-[0.88] text-brand-text">
                Three<br />
                <span className="italic text-brand-muted/45">personalities.</span>
              </h2>
            </div>
            <p className="text-brand-faint text-sm leading-relaxed max-w-[280px] pb-1">
              Not colour swaps — each is a complete design system.
              AI respects the design language of your chosen theme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemeCard
              name="Editorial"
              badge="Creator"
              accent="#F59E0B"
              desc="Bold serif, magazine-feel. For creators who want their brand to make a statement."
              preview={
                <div className="bg-zinc-950 h-44 flex items-center justify-center border-b border-zinc-800/70">
                  <div className="text-left px-6 w-full">
                    <div className="w-6 h-0.5 bg-amber-400 mb-3" />
                    <p className="font-display italic text-white text-2xl font-bold leading-tight">Riya Kannan</p>
                    <p className="text-zinc-500 text-xs mt-1.5">Creator · Podcast Host</p>
                    <div className="mt-4 border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-zinc-400 inline-block">My Podcast →</div>
                  </div>
                </div>
              }
            />
            <ThemeCard
              name="Minimal"
              badge="Professional"
              accent="#3B82F6"
              desc="Clean, confident, credible. For professionals whose brand is built on trust."
              preview={
                <div className="bg-gray-50 h-44 flex items-center justify-center border-b border-gray-100">
                  <div className="text-center w-full px-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 mx-auto mb-2">R</div>
                    <p className="font-semibold text-gray-900 text-sm">Riya Kannan</p>
                    <p className="text-gray-400 text-xs">Creator · Podcast Host</p>
                    <div className="mt-3 bg-white rounded-xl shadow-sm px-3 py-1.5 text-xs text-gray-700 mx-auto inline-block">My Podcast</div>
                  </div>
                </div>
              }
            />
            <ThemeCard
              name="Expressive"
              badge="Business"
              accent="#8B5CF6"
              desc="Colourful, warm, full of character. For brands that refuse to blend in."
              preview={
                <div className="bg-gradient-to-br from-violet-600 to-pink-500 h-44 flex items-center justify-center border-b border-white/10">
                  <div className="text-center w-full px-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-base font-extrabold text-white font-expressive mx-auto mb-2">R</div>
                    <p className="font-expressive font-extrabold text-white text-sm">Riya Kannan</p>
                    <div className="mt-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-3 py-1.5 text-xs text-white font-semibold inline-block">My Podcast →</div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="border-t border-brand-border overflow-hidden">
        <div className="border-b border-brand-border py-8 overflow-hidden select-none">
          <div
            className="flex whitespace-nowrap will-change-transform"
            style={{ animation: 'marquee 13s linear infinite' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="font-display font-black italic text-[clamp(64px,12vw,180px)] leading-none text-brand-gold/[0.07] tracking-tight pr-16 flex-shrink-0">
                One link.
              </span>
            ))}
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display italic font-bold text-[clamp(44px,7vw,88px)] leading-[0.88] text-brand-text mb-6">
            One link.<br />
            <span className="text-brand-gold">Every door.</span>
          </h2>
          <p className="text-brand-faint text-base mb-10 leading-relaxed">
            Share one page for everything you do — and let AI make it look like a portfolio.
            20 free credits on signup. No monthly plan. No card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-brand-gold text-brand-dark text-base font-bold px-8 py-4 rounded-xl hover:bg-brand-gold-light transition-all"
            >
              Create my page
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-xs text-brand-faint">20 credits free · No card required</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-brand-border">
        <div className="py-12 flex flex-col items-center gap-4 border-b border-brand-border">
          <ZakapediaAttribution />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-faint">© 2026 Zakapedia · tap.zakapedia.in</p>
          <div className="flex items-center gap-6 text-xs text-brand-muted">
            <Link to="/privacy"  className="hover:text-brand-text transition-colors">Privacy Policy</Link>
            <Link to="/terms"    className="hover:text-brand-text transition-colors">Terms of Use</Link>
            <a href="mailto:info@zakapedia.in" className="hover:text-brand-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── ThemeCard ───────────────────────────────────────────────────────────────

function ThemeCard({ name, badge, accent, desc, preview }: {
  name: string; badge: string; accent: string; desc: string; preview: React.ReactNode
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-brand-border bg-brand-dark hover:border-brand-faint transition-all duration-300 group hover:-translate-y-1">
      <div className="relative">
        {preview}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: accent }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-display italic text-xl text-brand-text">{name}</h3>
          <span className="text-[10px] font-semibold tracking-wide text-brand-muted border border-brand-border rounded-full px-2 py-0.5 uppercase">{badge}</span>
        </div>
        <p className="text-sm text-brand-faint leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

// ── Profile Types Section ───────────────────────────────────────────────────

function ProfileTypesSection() {
  return (
    <section className="py-24 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-4">Built For Everyone</p>
            <h2 className="font-display font-bold text-[clamp(42px,6vw,80px)] leading-[0.88] text-brand-text">
              Five types.<br />
              <span className="italic text-brand-muted/45">One platform.</span>
            </h2>
          </div>
          <p className="text-brand-faint text-sm leading-relaxed max-w-[280px] pb-1">
            Pick your profile type and everything adapts — sections, AI prompt, theme. No two portfolios look the same.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PROFILE_TYPES_DATA.map(({ Icon, type, desc, theme, accent }) => (
            <div
              key={type}
              className="group relative bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-faint transition-all duration-300 cursor-default hover:-translate-y-0.5"
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: accent }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${accent}18` }}
              >
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <p className="font-display italic font-bold text-brand-text text-base mb-1">{type}</p>
              <p className="text-[11px] text-brand-faint leading-relaxed mb-3">{desc}</p>
              <div className="inline-flex items-center gap-1.5 text-[9px] font-semibold tracking-wide border border-brand-border text-brand-faint rounded-full px-2 py-0.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                {theme}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works Section ────────────────────────────────────────────────────

function StepVisual1() {
  const types = [
    { accent: '#F59E0B', label: 'Creator',      active: true  },
    { accent: '#3B82F6', label: 'Professional', active: false },
    { accent: '#8B5CF6', label: 'Business',     active: false },
    { accent: '#10B981', label: 'Service Pro',  active: false },
    { accent: '#EC4899', label: 'Speaker',      active: false },
  ]
  return (
    <div className="bg-brand-dark border border-brand-border rounded-xl p-4 space-y-1.5">
      <p className="text-[9px] text-brand-faint uppercase tracking-[0.18em] font-semibold mb-3">
        What best describes you?
      </p>
      {types.map(({ accent, label, active }) => (
        <div
          key={label}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
            active
              ? 'bg-brand-gold/12 border border-brand-gold/35 text-brand-gold'
              : 'border border-transparent text-brand-faint'
          }`}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: active ? '#C9963A' : accent + '80' }} />
          <span className="font-medium">{label}</span>
          {active && <span className="ml-auto text-brand-gold text-[10px]">selected</span>}
        </div>
      ))}
    </div>
  )
}

function StepVisual2() {
  return (
    <div className="bg-brand-dark border border-brand-border rounded-xl p-4">
      <p className="text-[9px] text-brand-faint uppercase tracking-[0.18em] font-semibold mb-3">
        Your profile
      </p>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-sm font-bold text-brand-gold flex-shrink-0">
          R
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-2 bg-brand-border rounded-full w-20 mb-1.5" />
          <div className="h-1.5 bg-brand-border/50 rounded-full w-28" />
        </div>
      </div>
      <div className="bg-brand-surface border border-brand-border rounded-lg p-2.5 mb-3">
        <div className="h-1.5 bg-brand-border/60 rounded-full w-full mb-1.5" />
        <div className="h-1.5 bg-brand-border/40 rounded-full w-4/5 mb-1.5" />
        <div className="h-1.5 bg-brand-border/25 rounded-full w-2/3" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {['Links', 'Platforms', 'Latest Post'].map(s => (
          <span key={s} className="text-[9px] border border-brand-border text-brand-faint px-2 py-0.5 rounded-full">{s}</span>
        ))}
        <span className="text-[9px] border border-dashed border-brand-gold/40 text-brand-gold/60 px-2 py-0.5 rounded-full">+ Add</span>
      </div>
    </div>
  )
}

function StepVisual3() {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          let p = 0
          const id = setInterval(() => {
            p += Math.random() * 14 + 4
            if (p >= 100) {
              p = 100
              clearInterval(id)
              setTimeout(() => setDone(true), 500)
            }
            setProgress(Math.round(Math.min(p, 100)))
          }, 110)
          obs.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const WRITING_LABELS = [
    'Reading your links...',
    'Writing your bio...',
    'Building your sections...',
    'Applying your theme...',
    'Almost there...',
  ]
  const labelIdx = Math.min(Math.floor(progress / 22), WRITING_LABELS.length - 1)

  return (
    <div ref={ref} className="bg-brand-dark border border-brand-border rounded-xl p-4 min-h-[130px] flex flex-col justify-center">
      {!done ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse flex-shrink-0" />
            <p className="text-[10px] text-brand-gold font-semibold">Generating your portfolio...</p>
          </div>
          <div className="h-1.5 bg-brand-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] text-brand-faint mb-4">{WRITING_LABELS[labelIdx]}</p>
          <div className="space-y-1.5">
            {[1, 0.7, 0.45].map((opacity, i) => (
              <div
                key={i}
                className="h-1.5 bg-brand-border rounded-full animate-pulse"
                style={{ width: `${85 - i * 18}%`, opacity, animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-1">
          <div className="w-10 h-10 rounded-full bg-green-500/12 border border-green-500/35 flex items-center justify-center mx-auto mb-3">
            <span className="text-green-400 text-base leading-none">✓</span>
          </div>
          <p className="text-xs font-semibold text-brand-text mb-1.5">Portfolio ready!</p>
          <p className="text-[11px] text-brand-gold font-medium font-display italic mb-3">tap.zakapedia.in/riya</p>
          <div className="inline-flex items-center gap-1.5 bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-[10px] text-brand-muted">
            View your portfolio <ArrowRight className="w-2.5 h-2.5" />
          </div>
        </div>
      )}
    </div>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-4">The Process</p>
            <h2 className="font-display font-bold text-[clamp(42px,6vw,80px)] leading-[0.88] text-brand-text">
              Three<br />
              <span className="italic text-brand-muted/45">steps.</span>
            </h2>
          </div>
          <p className="text-brand-faint text-sm leading-relaxed max-w-[280px] pb-1">
            From signup to published portfolio — takes minutes, not days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">

          {/* Step 01 */}
          <div>
            <p className="font-display italic font-black text-[88px] leading-none text-brand-border/35 mb-1 select-none">01</p>
            <h3 className="text-lg font-semibold text-brand-text mb-2 -mt-5">Pick your type</h3>
            <p className="text-sm text-brand-faint leading-relaxed mb-6">
              Creator, Professional, Business, Service Pro, or Speaker — one choice and your sections, AI prompt, and theme recommendation all adapt to you.
            </p>
            <StepVisual1 />
          </div>

          {/* Step 02 */}
          <div>
            <p className="font-display italic font-black text-[88px] leading-none text-brand-border/35 mb-1 select-none">02</p>
            <h3 className="text-lg font-semibold text-brand-text mb-2 -mt-5">Add your links</h3>
            <p className="text-sm text-brand-faint leading-relaxed mb-6">
              Name, photo, bio, and links — social profiles, products, services, portfolio pieces. Add sections that fit your type; leave out what doesn't.
            </p>
            <StepVisual2 />
          </div>

          {/* Step 03 */}
          <div>
            <p className="font-display italic font-black text-[88px] leading-none text-brand-border/35 mb-1 select-none">03</p>
            <h3 className="text-lg font-semibold text-brand-text mb-2 -mt-5">AI elevates it to a portfolio</h3>
            <p className="text-sm text-brand-faint leading-relaxed mb-6">
              10 credits. AI writes your copy, arranges your sections, and produces a portfolio that sounds like you — not a template, not a plain list of links.
            </p>
            <StepVisual3 />
          </div>

        </div>
      </div>
    </section>
  )
}

// ── Credits Section ────────────────────────────────────────────────────────

function CreditsSection() {
  return (
    <section className="py-24 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-16 items-start">

          {/* Copy + credit costs */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-4">Pricing</p>
            <h2 className="font-display font-bold text-[clamp(38px,5vw,64px)] leading-[0.9] text-brand-text mb-4">
              Simple.<br />
              <span className="italic text-brand-muted/45">No subscriptions.</span>
            </h2>
            <p className="text-brand-faint text-sm leading-relaxed mb-8 max-w-xs">
              20 credits free on signup — enough to generate 2 complete portfolios and see the wow moment. Buy more only when you need them.
            </p>

            <div className="border border-brand-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-brand-border bg-brand-surface/40">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-brand-muted uppercase">What costs credits</p>
              </div>
              {[
                { action: 'Generate portfolio', cost: '10' },
                { action: 'Regenerate portfolio', cost: '10' },
                { action: 'AI bio rewrite', cost: '3' },
              ].map(({ action, cost }, i, arr) => (
                <div
                  key={action}
                  className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-brand-border' : ''}`}
                >
                  <span className="text-sm text-brand-muted">{action}</span>
                  <span className="font-display italic font-bold text-brand-gold text-sm">{cost} credits</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit packs */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              {CREDIT_PACKS.map(({ name, credits, price, note, highlight }) => (
                <div
                  key={name}
                  className={`relative rounded-2xl p-5 border transition-colors ${
                    highlight
                      ? 'border-brand-gold/45 bg-brand-gold/[0.04]'
                      : 'border-brand-border bg-brand-surface'
                  }`}
                >
                  {highlight && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-brand-gold" />
                  )}
                  {highlight && (
                    <div className="absolute -top-3 right-4">
                      <span className="text-[9px] font-bold bg-brand-gold text-brand-dark px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {note}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-brand-faint/70 uppercase tracking-[0.15em] font-semibold mb-2">{name}</p>
                  <p className="font-display font-black italic text-brand-gold text-3xl leading-none mb-1">{price}</p>
                  <p className="text-sm text-brand-text font-semibold mb-1">{credits} credits</p>
                  {!highlight && (
                    <p className="text-[10px] text-brand-faint">{note}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-brand-faint mt-4 leading-relaxed">
              Credits never expire. Pay via Razorpay — UPI, cards, and netbanking accepted.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

// ── Physical products section ───────────────────────────────────────────────

function NFCWaves() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      {[0, 550, 1100].map(delay => (
        <span
          key={delay}
          className="absolute inset-0 rounded-full border border-brand-gold/50"
          style={{ animation: 'nfcPulse 2.2s ease-out infinite', animationDelay: `${delay}ms` }}
        />
      ))}
      <span className="w-2 h-2 rounded-full bg-brand-gold z-10" />
    </div>
  )
}

function ProductsSection() {
  return (
    <section className="border-b border-brand-border py-24">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-16 items-center">

          {/* Copy */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-4">Physical Product</p>
            <h2 className="font-display font-bold text-[clamp(38px,5vw,64px)] leading-[0.9] text-brand-text mb-6">
              Take your brand<br />
              <span className="italic text-brand-muted/45">offline.</span>
            </h2>
            <p className="text-brand-faint text-sm leading-relaxed mb-8 max-w-xs">
              Your portfolio, in their hands. Hand someone the card — they tap with their phone and your page opens instantly. No app, no friction.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {[
                'Opens your portfolio page instantly on tap',
                'Every tap tracked in your analytics dashboard',
                'Works on any NFC-enabled phone',
                'Ships with your username pre-written',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-brand-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/70 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <span className="text-brand-gold font-semibold text-sm">From ₹299 / card</span>
              <span className="text-[10px] text-brand-faint border border-brand-border rounded-full px-2.5 py-0.5">NTAG213 · PVC</span>
            </div>
          </div>

          {/* NFC card mockup */}
          <div className="group relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-[-20%] bg-brand-gold/[0.07] blur-3xl rounded-full pointer-events-none" />
              <div
                className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.75)] transition-transform duration-500 group-hover:-translate-y-1"
                style={{ width: '340px', height: '214px', background: 'linear-gradient(135deg, #1a1510 0%, #0C0A08 50%, #1e1a14 100%)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02]" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                <div className="absolute top-6 left-6 w-10 h-8 rounded-md overflow-hidden"
                     style={{ background: 'linear-gradient(135deg, #C9963A 0%, #E8B84B 40%, #9A7028 100%)' }}>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px p-px opacity-60">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-brand-gold/40 rounded-[1px]" />
                    ))}
                  </div>
                </div>
                <div className="absolute top-6 left-[72px] font-display italic font-black text-brand-gold text-2xl leading-none">
                  Tap.
                </div>
                <div className="absolute bottom-6 left-6">
                  <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase mb-1">Your page</p>
                  <p className="text-white/90 text-base font-semibold tracking-wide">@riyakannan</p>
                </div>
                <div className="absolute bottom-6 right-7">
                  <NFCWaves />
                </div>
                <div className="absolute inset-0 opacity-[0.04]"
                     style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ── Analytics section ───────────────────────────────────────────────────────

const CHART_BARS = [
  { day: 'M', views: 42,  clicks: 8  },
  { day: 'T', views: 58,  clicks: 14 },
  { day: 'W', views: 35,  clicks: 9  },
  { day: 'T', views: 71,  clicks: 18 },
  { day: 'F', views: 94,  clicks: 24 },
  { day: 'S', views: 83,  clicks: 19 },
  { day: 'S', views: 127, clicks: 31 },
]
const MAX_BAR = 127

const SOURCES = [
  { label: 'Direct',    pct: 45, highlight: false },
  { label: 'Instagram', pct: 32, highlight: false },
  { label: 'NFC ◆',    pct: 17, highlight: true  },
  { label: 'Other',     pct: 6,  highlight: false },
]

function StatCell({ label, value, suffix = '', animated, delay = 0 }: {
  label: string; value: number; suffix?: string; animated: boolean; delay?: number
}) {
  const [counted, setCounted] = useState(0)
  useEffect(() => {
    if (!animated) return
    const t = setTimeout(() => {
      const dur = 1000
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1)
        setCounted(Math.round((1 - Math.pow(1 - p, 3)) * value))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(t)
  }, [animated, value, delay])

  return (
    <div>
      <p className="font-display font-black italic text-lg text-brand-gold leading-none tabular-nums">
        {counted.toLocaleString()}{suffix}
      </p>
      <p className="text-[9px] text-brand-faint mt-0.5">{label}</p>
    </div>
  )
}

function AnalyticsSection() {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAnimated(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="border-y border-brand-border py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-16 items-center">

          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-4">Analytics</p>
            <h2 className="font-display font-bold text-[clamp(38px,5vw,64px)] leading-[0.9] text-brand-text mb-6">
              Know who's<br />
              <span className="italic text-brand-muted/45">tapping.</span>
            </h2>
            <p className="text-brand-faint text-sm leading-relaxed mb-8 max-w-xs">
              Every view, every click, every NFC tap — tracked and visualised.
              No third-party tools. No extra setup.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                'Page views by day',
                'Link click-through rates',
                'NFC taps — tracked separately from web',
                'Traffic sources: Instagram, WhatsApp, Direct',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-brand-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/70 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div ref={ref} className="relative">
            <div className="absolute inset-[-15%] bg-brand-gold/[0.045] blur-3xl rounded-full pointer-events-none" />

            <div className="relative bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">

              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
                <div>
                  <p className="text-xs font-semibold text-brand-text">Page Views</p>
                  <p className="text-[10px] text-brand-faint mt-0.5">Last 7 days</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-brand-faint">Live</span>
                </div>
              </div>

              <div className="p-5">

                <div className="grid grid-cols-4 gap-2 mb-6">
                  <StatCell label="Views"  value={1284} animated={animated} delay={0}   />
                  <StatCell label="Clicks" value={312}  animated={animated} delay={80}  />
                  <StatCell label="CTR"    value={24}   animated={animated} delay={160} suffix="%" />
                  <StatCell label="NFC"    value={47}   animated={animated} delay={240} />
                </div>

                <div className="flex items-end gap-1.5 mb-2" style={{ height: '96px' }}>
                  {CHART_BARS.map((bar, i) => {
                    const h = (bar.views / MAX_BAR) * 96
                    const clickFrac = bar.clicks / bar.views
                    return (
                      <div key={i} className="flex-1">
                        <div
                          className="w-full relative rounded-t-sm"
                          style={{
                            height: `${h}px`,
                            background: 'rgba(201,150,58,0.14)',
                            transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                            transformOrigin: 'bottom',
                            transition: `transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 55}ms`,
                          }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-brand-gold/60 rounded-t-sm"
                            style={{
                              height: `${clickFrac * 100}%`,
                              transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                              transformOrigin: 'bottom',
                              transition: `transform 0.4s ease-out ${i * 55 + 380}ms`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1.5">
                    {CHART_BARS.map((bar, i) => (
                      <div key={i} className="flex-1 w-0 min-w-[1rem] text-center">
                        <span className="text-[9px] text-brand-faint">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(201,150,58,0.14)' }} />
                      <span className="text-[9px] text-brand-faint">Views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm bg-brand-gold/60" />
                      <span className="text-[9px] text-brand-faint">Clicks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border flex flex-col gap-2.5">
                  <p className="text-[9px] font-semibold text-brand-muted/60 uppercase tracking-[0.18em] mb-1">
                    Traffic Sources
                  </p>
                  {SOURCES.map((src, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] text-brand-faint w-[68px] flex-shrink-0">{src.label}</span>
                      <div className="flex-1 h-[3px] bg-brand-border rounded-full overflow-hidden">
                        <div
                          style={{
                            width: animated ? `${src.pct}%` : '0%',
                            transition: `width 0.7s ease-out ${520 + i * 90}ms`,
                          }}
                          className={`h-full rounded-full ${src.highlight ? 'bg-brand-gold' : 'bg-brand-gold/35'}`}
                        />
                      </div>
                      <span className="text-[10px] text-brand-faint w-6 text-right">{src.pct}%</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
