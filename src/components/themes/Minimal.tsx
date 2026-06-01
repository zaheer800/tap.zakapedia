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
  username?: string
}

export function Minimal({ page, links, isPreview = false, userTypes = [], username }: Props) {
  const accent = page.accent_color || '#3B82F6'
  const bannerUrl = (page as Page & { banner_url?: string | null }).banner_url

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
        fontFamily: '"DM Sans", system-ui, sans-serif',
        background: `radial-gradient(ellipse 85% 55% at 50% -10%, ${accent}1A 0%, transparent 65%), #FAFAFA`,
      }}
    >
      {/* Subtle dot grid — adds a premium tactile feel */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          opacity: 0.55,
          backgroundImage: `radial-gradient(circle, ${accent}22 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 80%)',
        }}
      />

      {/* Banner */}
      {bannerUrl && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: 130, overflow: 'hidden' }}>
          <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 360, margin: '0 auto', padding: '0 20px' }}>

        {/* Profile — centered */}
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
            paddingTop: bannerUrl ? 0 : 56,
            marginTop: bannerUrl ? -40 : 0,
            marginBottom: 36,
          }}
        >
          {/* Avatar with gradient ring */}
          {page.avatar_url ? (
            <div
              style={{
                padding: 3,
                borderRadius: '50%',
                background: `linear-gradient(145deg, ${accent}, ${accent}55)`,
                boxShadow: `0 0 0 4px #FAFAFA, 0 8px 32px ${accent}2E`,
                marginBottom: 20,
                flexShrink: 0,
              }}
            >
              <img
                src={page.avatar_url} alt={page.name || ''}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(145deg, ${accent}, ${accent}88)`,
                boxShadow: `0 8px 32px ${accent}38`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, fontWeight: 700, color: '#fff',
                marginBottom: 20,
              }}
            >
              {(page.name || 'Y')[0].toUpperCase()}
            </div>
          )}

          {/* Name */}
          <h1
            style={{
              fontSize: 22, fontWeight: 600, lineHeight: 1.18,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            {page.name || 'Your Name'}
          </h1>

          {/* Bio */}
          {page.bio && (
            <p
              style={{
                fontSize: 13.5, lineHeight: 1.65,
                color: '#6B7280',
                maxWidth: 268,
              }}
            >
              {page.bio}
            </p>
          )}

          {/* Personality pills */}
          {userTypes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginTop: 14 }}>
              {userTypes.map((type) => (
                <span
                  key={type}
                  style={{
                    fontSize: 11, fontWeight: 500,
                    color: accent,
                    backgroundColor: `${accent}12`,
                    borderRadius: 100,
                    paddingLeft: 10, paddingRight: 10,
                    paddingTop: 3, paddingBottom: 3,
                    border: `1px solid ${accent}20`,
                  }}
                >
                  {USER_TYPE_LABELS[type] ?? type}
                </span>
              ))}
            </div>
          )}

          {/* Accent dot trio — rhythm marker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: userTypes.length > 0 ? 18 : 24 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: accent, opacity: 0.35 }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accent }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: accent, opacity: 0.35 }} />
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 64 }}>
          {sortedLinks(filterFloatingLinks(links)).map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                borderRadius: 16, overflow: 'hidden',
                display: 'flex', alignItems: 'center',
                background: '#FFFFFF',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                if (isPreview) return
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = `0 6px 24px ${accent}22, 0 0 0 1.5px ${accent}30`
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = '0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'
                el.style.transform = 'translateY(0)'
              }}
            >
              {/* Left accent stripe */}
              <div
                style={{
                  width: 4, alignSelf: 'stretch', flexShrink: 0,
                  backgroundColor: accent,
                  borderRadius: '0 2px 2px 0',
                  minHeight: 56,
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', flex: 1 }}>
                {link.icon ? (
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      backgroundColor: `${accent}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17,
                    }}
                  >
                    {link.icon}
                  </div>
                ) : null}

                <span
                  style={{
                    flex: 1, fontSize: 14, fontWeight: 500,
                    color: '#111827',
                  }}
                >
                  {link.title}
                </span>

                <svg
                  style={{ width: 15, height: 15, color: accent, opacity: 0.6, flexShrink: 0 }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingBottom: 40, paddingTop: 8 }}>
          <a
            href={username ? `https://tap.zakapedia.in/?ref=${username}` : 'https://tap.zakapedia.in'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => isPreview && e.preventDefault()}
            style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.01em' }}
          >
            Made with Tap.Zakapedia.in
          </a>
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
