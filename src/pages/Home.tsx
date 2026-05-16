import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
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
  { id: '1', page_id: '', title: 'My Podcast',     url: '#', icon: '', position: 0, created_at: '' },
  { id: '2', page_id: '', title: 'Gumroad Presets', url: '#', icon: '', position: 1, created_at: '' },
  { id: '3', page_id: '', title: 'Instagram',       url: '#', icon: '', position: 2, created_at: '' },
  { id: '4', page_id: '', title: 'YouTube',         url: '#', icon: '', position: 3, created_at: '' },
]

const MARQUEE_ITEMS = [
  'Your brand online', 'Not a link dump', 'Built in India',
  'Three design systems', 'NFC cards', 'Visiting cards',
  'Analytics built-in', 'Free forever',
]

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            setValue(Math.round((1 - Math.pow(1 - p, 3)) * target))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { value, ref }
}

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
          <div className="flex items-center gap-3">
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
            Brand builder · Not a link aggregator
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
            Not a link page.
            <br />
            <span className="text-brand-text">Your brand, online.</span>
          </p>

          <p className="text-[14px] text-brand-faint max-w-[320px] mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '420ms' }}>
            Beautiful brand pages for creators, professionals, and small businesses across India.
            Three distinct design systems. Always free.
          </p>

          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '520ms' }}>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-brand-gold text-brand-dark text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-brand-gold-light transition-all"
            >
              Build your brand
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-brand-border text-brand-muted text-sm font-medium px-6 py-3.5 rounded-xl hover:border-brand-faint hover:text-brand-text transition-colors"
            >
              Sign in
            </Link>
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
          style={{ animation: 'marquee 28s linear infinite' }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-5 mx-6">
              <span className="text-[10px] font-semibold tracking-[0.22em] text-brand-muted/65 uppercase">{item}</span>
              <span className="text-brand-gold/60 text-[8px]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Analytics ──────────────────────────────────── */}
      <AnalyticsSection />

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
              A brand identity, not a skin.
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
              badge="Personality"
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

      {/* ── Stats ──────────────────────────────────────── */}
      <section className="border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-brand-border">
            <Stat value="100%" label="Free. All themes, all features, always." />
            <Stat value="3" label="Complete brand design systems." />
            <Stat value="0" label="Paywalls. No plans. No catches." />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-16">Why it works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-border">
          <FeatureBlock
            n="01"
            title="You look like a brand"
            desc="Not like everyone else's Linktree. Your page has its own design language — typography, spacing, motion. The design does the talking."
          />
          <FeatureBlock
            n="02"
            title="Know your audience"
            desc="Page views, link clicks, CTR, traffic sources — NFC taps tracked separately. Real analytics, no third-party tools."
          />
          <FeatureBlock
            n="03"
            title="Take it offline too"
            desc="Optional NFC cards and printed visiting cards that open your brand page. Tap to share. Hand it out like a business card."
          />
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="border-t border-brand-border overflow-hidden">
        <div className="border-b border-brand-border py-8 overflow-hidden select-none">
          <div
            className="flex whitespace-nowrap will-change-transform"
            style={{ animation: 'marquee 20s linear infinite' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="font-display font-black italic text-[clamp(64px,12vw,180px)] leading-none text-brand-gold/[0.07] tracking-tight pr-16 flex-shrink-0">
                Your brand.
              </span>
            ))}
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display italic font-bold text-[clamp(44px,7vw,88px)] leading-[0.88] text-brand-text mb-6">
            Your brand.<br />
            <span className="text-brand-gold">Fully unlocked.</span>
          </h2>
          <p className="text-brand-faint text-base mb-10 leading-relaxed">
            Three design systems, built-in analytics, NFC tracking —<br />
            all yours. No plan needed, no features held back.
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 bg-brand-gold text-brand-dark text-base font-bold px-8 py-4 rounded-xl hover:bg-brand-gold-light transition-all"
          >
            Start building
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
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

function Stat({ value, label }: { value: string; label: string }) {
  const numeric = parseInt(value.replace(/\D/g, ''), 10) || 0
  const suffix = value.replace(/\d/g, '')
  const { value: counted, ref } = useCountUp(numeric)
  return (
    <div ref={ref} className="py-12 px-6 sm:px-10">
      <p className="font-display font-black italic text-[clamp(40px,5.5vw,72px)] text-brand-gold leading-none mb-3">
        {counted}{suffix}
      </p>
      <p className="text-sm text-brand-faint leading-snug">{label}</p>
    </div>
  )
}

function FeatureBlock({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="bg-brand-dark p-8 hover:bg-brand-surface/50 transition-colors duration-200 group">
      <p className="font-display italic text-[56px] text-brand-border/60 mb-6 select-none leading-none group-hover:text-brand-border transition-colors duration-200">{n}</p>
      <h3 className="text-base font-semibold text-brand-text mb-2">{title}</h3>
      <p className="text-sm text-brand-faint leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Physical products section ───────────────────────────────────────────────

function makeFakeQR(): number[][] {
  const g: number[][] = Array.from({ length: 21 }, () => new Array(21).fill(0))
  const finder = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++)
      for (let dc = 0; dc < 7; dc++) {
        const edge = dr === 0 || dr === 6 || dc === 0 || dc === 6
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        g[r + dr][c + dc] = edge || core ? 1 : 0
      }
  }
  finder(0, 0); finder(0, 14); finder(14, 0)
  for (let i = 8; i <= 12; i += 2) { g[6][i] = 1; g[i][6] = 1 }
  let s = 42317
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 }
  for (let r = 0; r < 21; r++)
    for (let c = 0; c < 21; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue
      if (r === 6 || c === 6) continue
      if (g[r][c] === 0) g[r][c] = rng() > 0.42 ? 1 : 0
    }
  return g
}
const QR_GRID = makeFakeQR()

function FakeQRCode({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg viewBox="0 0 21 21" shapeRendering="crispEdges" style={{ width: '100%', height: '100%' }}>
      {QR_GRID.flatMap((row, r) =>
        row.map((cell, c) =>
          cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={color} /> : null
        )
      )}
    </svg>
  )
}

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
    <section className="border-b border-brand-border py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase mb-4">Physical Products</p>
            <h2 className="font-display font-bold text-[clamp(38px,5vw,64px)] leading-[0.9] text-brand-text">
              Take your brand<br />
              <span className="italic text-brand-muted/45">offline.</span>
            </h2>
          </div>
          <p className="text-brand-faint text-sm leading-relaxed max-w-[280px] pb-1">
            Your Tap page, in their hands. No app required — just tap or scan and your brand opens instantly.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── NFC Card ── */}
          <div className="group relative bg-brand-surface border border-brand-border rounded-2xl p-7 hover:border-brand-faint transition-colors duration-300 overflow-hidden">
            {/* Subtle gold glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Card mockup */}
            <div className="relative mb-8 flex justify-center">
              {/* Glow behind card */}
              <div className="absolute inset-[-20%] bg-brand-gold/[0.06] blur-3xl rounded-full pointer-events-none" />

              {/* The NFC card — credit card aspect ratio 85.6×54mm */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:-translate-y-1"
                style={{ width: '300px', height: '189px', background: 'linear-gradient(135deg, #1a1510 0%, #0C0A08 50%, #1e1a14 100%)' }}
              >
                {/* Foil sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02]" />
                {/* Edge highlight */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />

                {/* Chip */}
                <div className="absolute top-5 left-5 w-9 h-7 rounded-md overflow-hidden"
                     style={{ background: 'linear-gradient(135deg, #C9963A 0%, #E8B84B 40%, #9A7028 100%)' }}>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px p-px opacity-60">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-brand-gold/40 rounded-[1px]" />
                    ))}
                  </div>
                </div>

                {/* Brand name */}
                <div className="absolute top-5 left-16 font-display italic font-black text-brand-gold text-xl leading-none">
                  Tap.
                </div>

                {/* Username */}
                <div className="absolute bottom-5 left-5">
                  <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase mb-1">Your page</p>
                  <p className="text-white/90 text-sm font-semibold tracking-wide">@riyakannan</p>
                </div>

                {/* NFC waves — bottom right */}
                <div className="absolute bottom-5 right-6">
                  <NFCWaves />
                </div>

                {/* Subtle horizontal lines texture */}
                <div className="absolute inset-0 opacity-[0.04]"
                     style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)' }} />
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display italic text-2xl text-brand-text mb-2">NFC Card</h3>
                <p className="text-brand-faint text-sm leading-relaxed max-w-xs">
                  Hand it to someone. They tap with their phone. Your brand page opens — no app, no friction.
                  Every tap shows up in your analytics so you know exactly how your card is performing.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-brand-gold font-semibold text-sm">From ₹299 / card</span>
              <span className="text-[10px] text-brand-faint border border-brand-border rounded-full px-2.5 py-0.5">NTAG213 · PVC</span>
            </div>
          </div>

          {/* ── Visiting Card ── */}
          <div className="group relative bg-brand-surface border border-brand-border rounded-2xl p-7 hover:border-brand-faint transition-colors duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Card mockup */}
            <div className="relative mb-8 flex justify-center">
              <div className="absolute inset-[-20%] bg-blue-500/[0.04] blur-3xl rounded-full pointer-events-none" />

              {/* Visiting card — landscape, white */}
              <div
                className="relative rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden transition-transform duration-500 group-hover:-translate-y-1 flex"
                style={{ width: '300px', height: '189px', background: '#F9F7F4' }}
              >
                {/* Left content */}
                <div className="flex-1 flex flex-col justify-between p-6">
                  {/* Top: brand + divider */}
                  <div>
                    <span className="font-display italic font-black text-gray-900 text-lg leading-none">Tap.</span>
                    <div className="w-5 h-0.5 mt-1.5 mb-3" style={{ backgroundColor: '#C9963A' }} />
                    <p className="text-gray-900 text-sm font-semibold leading-tight">Riya Kannan</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">Creator · Podcast Host</p>
                  </div>
                  {/* Bottom: URL */}
                  <div>
                    <p className="text-gray-300 text-[9px] mb-0.5">Scan to visit</p>
                    <p className="text-gray-500 text-[10px] font-medium">tap.zakapedia.in/riya</p>
                  </div>
                </div>

                {/* Right: QR code panel */}
                <div className="w-[90px] flex items-center justify-center border-l border-gray-100 bg-white p-3">
                  <div className="w-full aspect-square text-gray-900">
                    <FakeQRCode color="#111" />
                  </div>
                </div>

                {/* Subtle paper texture */}
                <div className="absolute inset-0 opacity-[0.015]"
                     style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />
              </div>

              {/* Stack effect — second card peeking behind */}
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-xl -z-10 transition-transform duration-500 group-hover:-translate-y-0.5"
                style={{ width: '288px', height: '183px', background: '#EEEBE6', transform: 'rotate(1.5deg) translateX(-50%)' }}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display italic text-2xl text-brand-text mb-2">Visiting Card</h3>
                <p className="text-brand-faint text-sm leading-relaxed max-w-xs">
                  85×54mm printed cards with your QR code. Scan to open your Tap page.
                  Matte or glossy, 3 templates matching your theme.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-brand-gold font-semibold text-sm">From ₹599 / 100 cards</span>
              <span className="text-[10px] text-brand-faint border border-brand-border rounded-full px-2.5 py-0.5">MOQ 100 · Matte / Glossy</span>
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

          {/* Copy */}
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
                'Traffic sources: Instagram, Direct, and more',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-brand-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/70 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Analytics card */}
          <div ref={ref} className="relative">
            <div className="absolute inset-[-15%] bg-brand-gold/[0.045] blur-3xl rounded-full pointer-events-none" />

            <div className="relative bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">

              {/* Header */}
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

                {/* Stat cells */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <StatCell label="Views"  value={1284} animated={animated} delay={0}   />
                  <StatCell label="Clicks" value={312}  animated={animated} delay={80}  />
                  <StatCell label="CTR"    value={24}   animated={animated} delay={160} suffix="%" />
                  <StatCell label="NFC"    value={47}   animated={animated} delay={240} />
                </div>

                {/* Bar chart */}
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

                {/* Day labels + legend row */}
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

                {/* Traffic sources */}
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
