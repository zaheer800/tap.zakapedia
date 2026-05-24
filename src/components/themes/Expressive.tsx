import type { Page, Link } from '../../types'
import { trackLinkClick } from '../../utils/trackEvent'
import { USER_TYPE_LABELS } from '../../data/userTypes'
import { FloatingActions, filterFloatingLinks } from './FloatingActions'

interface Props {
  page: Page
  links: Link[]
  isPreview?: boolean
  userType?: string
  userTypes?: string[]
}

export function Expressive({ page, links, isPreview = false, userTypes = [] }: Props) {
  const accent = page.accent_color || '#8B5CF6'
  const bannerUrl = (page as Page & { banner_url?: string | null }).banner_url
  const blob2Color = shiftHue(accent, 42)
  const blob3Color = shiftHue(accent, -28)

  async function handleLinkClick(link: Link) {
    if (!isPreview) {
      await trackLinkClick(link.id, page.id)
      window.open(ensureHttp(link.url), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#080810',
        fontFamily: '"Nunito", ui-rounded, system-ui, sans-serif',
      }}
    >
      {/* Background blobs — mesh gradient effect */}
      <div
        aria-hidden
        className={!isPreview ? 'animate-blob-1' : undefined}
        style={{
          position: 'absolute',
          top: -140, right: -120,
          width: 400, height: 400,
          borderRadius: '50%',
          backgroundColor: accent,
          opacity: 0.42,
          filter: 'blur(92px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        className={!isPreview ? 'animate-blob-2' : undefined}
        style={{
          position: 'absolute',
          bottom: -120, left: -100,
          width: 350, height: 350,
          borderRadius: '50%',
          backgroundColor: blob2Color,
          opacity: 0.36,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        className={!isPreview ? 'animate-blob-3' : undefined}
        style={{
          position: 'absolute',
          top: '42%', left: '52%',
          width: 240, height: 240,
          borderRadius: '50%',
          backgroundColor: blob3Color,
          opacity: 0.22,
          filter: 'blur(64px)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle noise over blobs */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
      />

      {/* Banner */}
      {bannerUrl && (
        <div style={{ position: 'relative', zIndex: 2, height: 166, overflow: 'hidden' }}>
          <img
            src={bannerUrl} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, mixBlendMode: 'luminosity' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 35%, #080810 100%)` }} />
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 360, margin: '0 auto', padding: '0 20px 56px' }}>

        {/* Profile */}
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
            paddingTop: bannerUrl ? 0 : 52,
            marginTop: bannerUrl ? -32 : 0,
            marginBottom: 32,
          }}
        >
          {/* Avatar */}
          {page.avatar_url ? (
            <img
              src={page.avatar_url} alt={page.name || ''}
              style={{
                width: 100, height: 100, objectFit: 'cover',
                borderRadius: 24,
                border: '3px solid rgba(255,255,255,0.45)',
                boxShadow: `0 0 0 7px rgba(255,255,255,0.06), 0 20px 55px ${accent}60, 0 4px 16px rgba(0,0,0,0.4)`,
                marginBottom: 22,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 100, height: 100, borderRadius: 24, flexShrink: 0,
                background: `linear-gradient(145deg, ${accent}70, ${blob2Color}60)`,
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,255,255,0.35)',
                boxShadow: `0 0 0 7px rgba(255,255,255,0.05), 0 20px 55px ${accent}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 900, color: '#FFFFFF',
                fontFamily: '"Nunito", sans-serif',
                marginBottom: 22,
              }}
            >
              {(page.name || 'Y')[0].toUpperCase()}
            </div>
          )}

          {/* Name */}
          <h1
            style={{
              fontFamily: '"Nunito", sans-serif',
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              marginBottom: 12,
              textShadow: `0 2px 24px ${accent}55, 0 0 60px ${accent}28`,
            }}
          >
            {page.name || 'Your Name'}
          </h1>

          {/* Bio */}
          {page.bio && (
            <p
              style={{
                fontSize: 14, lineHeight: 1.62,
                color: 'rgba(255,255,255,0.68)',
                fontWeight: 600,
                maxWidth: 260,
              }}
            >
              {page.bio}
            </p>
          )}

          {/* Personality chips — frosted glass */}
          {userTypes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              {userTypes.map((type) => (
                <span
                  key={type}
                  style={{
                    fontSize: 12, fontWeight: 700,
                    color: 'rgba(255,255,255,0.88)',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    borderRadius: 100,
                    paddingLeft: 12, paddingRight: 12,
                    paddingTop: 4, paddingBottom: 4,
                    fontFamily: '"Nunito", sans-serif',
                  }}
                >
                  {USER_TYPE_LABELS[type] ?? type}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 60 }}>
          {sortedLinks(filterFloatingLinks(links)).map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                borderRadius: 20,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.09)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1.5px solid rgba(255,255,255,0.18)',
                boxShadow: '0 4px 28px rgba(0,0,0,0.25)',
                transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={(e) => {
                if (isPreview) return
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'scale(1.025)'
                el.style.background = 'rgba(255,255,255,0.15)'
                el.style.boxShadow = `0 8px 36px ${accent}30, 0 4px 16px rgba(0,0,0,0.3)`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'scale(1)'
                el.style.background = 'rgba(255,255,255,0.09)'
                el.style.boxShadow = '0 4px 28px rgba(0,0,0,0.25)'
              }}
              onMouseDown={(e) => {
                if (isPreview) return
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(0.975)'
              }}
              onMouseUp={(e) => {
                if (!isPreview) (e.currentTarget as HTMLElement).style.transform = 'scale(1.025)'
              }}
            >
              {link.icon ? (
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                    backgroundColor: `${accent}38`,
                    border: '1px solid rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 19,
                  }}
                >
                  {link.icon}
                </div>
              ) : null}

              <span
                style={{
                  flex: 1, fontSize: 15,
                  fontWeight: 700, color: '#FFFFFF',
                  fontFamily: '"Nunito", sans-serif',
                }}
              >
                {link.title}
              </span>

              <svg
                style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700, paddingBottom: 8 }}>
          <a
            href="https://tap.zakapedia.in"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => isPreview && e.preventDefault()}
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
          >
            Made with Tap.Zakapedia.in
          </a>
        </p>
      </div>
      <FloatingActions page={page} links={links} isPreview={isPreview} />
    </div>
  )
}

function ensureHttp(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
}

function sortedLinks(links: Link[]) {
  return [...links].sort((a, b) => a.position - b.position)
}

function shiftHue(hex: string, deg: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0
  const s = max === 0 ? 0 : (max - min) / max
  const v = max
  if (max !== min) {
    const d = max - min
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  h = (h + deg / 360 + 1) % 1
  const i = Math.floor(h * 6), f = h * 6 - i
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  let nr = 0, ng = 0, nb = 0
  switch (i % 6) {
    case 0: nr = v; ng = t; nb = p; break
    case 1: nr = q; ng = v; nb = p; break
    case 2: nr = p; ng = v; nb = t; break
    case 3: nr = p; ng = q; nb = v; break
    case 4: nr = t; ng = p; nb = v; break
    case 5: nr = v; ng = p; nb = q; break
  }
  return `#${Math.round(nr * 255).toString(16).padStart(2, '0')}${Math.round(ng * 255).toString(16).padStart(2, '0')}${Math.round(nb * 255).toString(16).padStart(2, '0')}`
}
