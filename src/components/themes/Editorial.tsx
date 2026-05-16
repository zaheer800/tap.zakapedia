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

export function Editorial({ page, links, isPreview = false, userTypes = [] }: Props) {
  const accent = page.accent_color || '#F59E0B'
  const bannerUrl = (page as Page & { banner_url?: string | null }).banner_url
  const nameInitial = (page.name || 'T')[0].toUpperCase()

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
        backgroundColor: '#060608',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        color: '#EEECEA',
      }}
    >
      {/* Grain texture */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          opacity: 0.038,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px',
        }}
      />

      {/* Masthead accent line */}
      <div style={{ height: 3, backgroundColor: accent, position: 'relative', zIndex: 2 }} />

      {/* Banner or decorative block */}
      {bannerUrl ? (
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', zIndex: 1 }}>
          <img
            src={bannerUrl} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.42) saturate(0.65)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 20%, #060608 100%)` }} />
        </div>
      ) : (
        <div style={{ position: 'relative', height: 116, overflow: 'hidden', zIndex: 1, backgroundColor: `${accent}0A` }}>
          {/* Giant faded initial behind content */}
          <span
            aria-hidden
            style={{
              position: 'absolute', right: -8, bottom: -42,
              fontFamily: '"Fraunces", serif',
              fontStyle: 'italic', fontWeight: 700,
              fontSize: 210, lineHeight: 0.85,
              color: accent, opacity: 0.065,
              letterSpacing: '-0.04em',
              userSelect: 'none', pointerEvents: 'none',
            }}
          >
            {nameInitial}
          </span>
          {/* Faint vertical rule on left */}
          <div style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 1, backgroundColor: `${accent}18` }} />
        </div>
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto', padding: '0 24px 56px' }}>

        {/* Profile */}
        <div style={{ marginTop: bannerUrl ? -48 : 0, marginBottom: 44 }}>

          {/* Avatar + label row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 22 }}>
            {page.avatar_url ? (
              <img
                src={page.avatar_url} alt={page.name || ''}
                style={{
                  width: 80, height: 80, objectFit: 'cover',
                  borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${accent}`,
                  filter: 'grayscale(0.1) contrast(1.05)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 80, height: 80, flexShrink: 0,
                  borderRadius: 5,
                  border: `2px solid ${accent}`,
                  backgroundColor: `${accent}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Fraunces", serif',
                  fontStyle: 'italic', fontWeight: 700,
                  fontSize: 30, color: accent,
                }}
              >
                {nameInitial}
              </div>
            )}
            <div style={{ paddingBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 1, width: 20, backgroundColor: `${accent}60` }} />
                <span style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: `${accent}AA`, fontWeight: 600 }}>
                  Profile
                </span>
              </div>
            </div>
          </div>

          {/* Name — the hero element */}
          <h1
            style={{
              fontFamily: '"Fraunces", serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 46,
              lineHeight: 0.97,
              letterSpacing: '-0.03em',
              color: '#F3F1EA',
              marginBottom: 16,
              fontOpticalSizing: 'auto',
            } as React.CSSProperties}
          >
            {page.name || 'Your Name'}
          </h1>

          {/* Accent rule */}
          <div style={{ height: 2, width: 44, backgroundColor: accent, borderRadius: 1, marginBottom: 18 }} />

          {/* Bio */}
          {page.bio && (
            <p
              style={{
                fontSize: 13.5, lineHeight: 1.72,
                color: '#6E6E7A',
                fontStyle: 'italic',
                maxWidth: 340,
              }}
            >
              {page.bio}
            </p>
          )}

          {/* Personality tags — editorial footnote style */}
          {userTypes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
              {userTypes.map((type) => (
                <span
                  key={type}
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: `${accent}CC`,
                    borderLeft: `2px solid ${accent}`,
                    paddingLeft: 7,
                    paddingRight: 8,
                    paddingTop: 2,
                    paddingBottom: 2,
                    backgroundColor: `${accent}08`,
                  }}
                >
                  {USER_TYPE_LABELS[type] ?? type}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div>
            {/* Section divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#141418' }} />
              <span style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: accent, fontWeight: 700 }}>
                Links
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#141418' }} />
            </div>

            {sortedLinks(filterFloatingLinks(links)).map((link, i) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={!isPreview ? 'group' : undefined}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 13,
                  padding: '14px 0',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  borderBottom: '1px solid #111114',
                  background: 'transparent',
                  transition: 'padding-left 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!isPreview) (e.currentTarget as HTMLElement).style.paddingLeft = '6px' }}
                onMouseLeave={(e) => { if (!isPreview) (e.currentTarget as HTMLElement).style.paddingLeft = '0px' }}
              >
                {/* Index */}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: `${accent}48`,
                  width: 22, textAlign: 'right', flexShrink: 0,
                  letterSpacing: '0.04em',
                  transition: 'color 0.15s',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                {link.icon && (
                  <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{link.icon}</span>
                )}

                {/* Title */}
                <span
                  style={{
                    flex: 1, fontSize: 14, fontWeight: 500,
                    color: '#BBBBC6',
                    transition: 'color 0.15s',
                  }}
                  ref={(el) => {
                    if (!el || isPreview) return
                    el.closest('button')?.addEventListener('mouseenter', () => { el.style.color = '#F0F0F5' })
                    el.closest('button')?.addEventListener('mouseleave', () => { el.style.color = '#BBBBC6' })
                  }}
                >
                  {link.title}
                </span>

                {/* Arrow */}
                <svg
                  style={{ width: 14, height: 14, color: `${accent}38`, flexShrink: 0, transition: 'transform 0.15s, color 0.15s' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  ref={(el) => {
                    if (!el || isPreview) return
                    el.closest('button')?.addEventListener('mouseenter', () => { (el as SVGElement).style.transform = 'translateX(3px)'; (el as SVGElement).style.color = `${accent}80` })
                    el.closest('button')?.addEventListener('mouseleave', () => { (el as SVGElement).style.transform = 'translateX(0)'; (el as SVGElement).style.color = `${accent}38` })
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 52 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#0E0E12' }} />
          <span style={{ fontSize: 9, color: '#1C1C22', letterSpacing: '0.14em' }}>TAP.ZAKAPEDIA.IN</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#0E0E12' }} />
        </div>
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
