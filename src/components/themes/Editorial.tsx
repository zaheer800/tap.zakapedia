import type { Page, Link } from '../../types'
import { trackLinkClick } from '../../utils/trackEvent'

interface Props {
  page: Page
  links: Link[]
  isPreview?: boolean
}

export function Editorial({ page, links, isPreview = false }: Props) {
  const accent = page.accent_color || '#F59E0B'

  async function handleLinkClick(link: Link) {
    if (!isPreview) {
      await trackLinkClick(link.id, page.id)
      window.open(ensureHttp(link.url), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: '#0a0a0a', fontFamily: '"Playfair Display", Georgia, serif' }}
    >
      <div className="max-w-md mx-auto px-6 py-14">
        {/* Profile */}
        <div className={`${isPreview ? '' : 'animate-fade-in'} mb-10`}>
          {page.avatar_url && (
            <div
              className="w-20 h-20 rounded-full overflow-hidden mb-6"
              style={{ border: `2px solid ${accent}` }}
            >
              <img
                src={page.avatar_url}
                alt={page.name}
                className="w-full h-full object-cover grayscale"
              />
            </div>
          )}

          {/* Accent rule */}
          <div className="w-8 h-0.5 mb-4" style={{ backgroundColor: accent }} />

          <h1
            className="text-3xl font-bold text-white leading-tight"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {page.name || 'Your Name'}
          </h1>

          {page.bio && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
              {page.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          {sortedLinks(links).map((link, i) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className={`
                group w-full text-left px-5 py-4 rounded-sm
                border border-zinc-800 bg-transparent
                transition-all duration-200
                hover:border-[var(--accent)] hover:bg-white/[0.02]
                ${isPreview ? '' : 'animate-slide-up'}
              `}
              style={
                { '--accent': accent, animationDelay: `${i * 60}ms` } as React.CSSProperties
              }
            >
              <div className="flex items-center gap-3">
                {link.icon && (
                  <span className="text-lg leading-none flex-shrink-0">{link.icon}</span>
                )}
                <span className="text-sm font-medium text-white group-hover:text-white flex-1">
                  {link.title}
                </span>
                <svg
                  className="w-4 h-4 opacity-30 group-hover:opacity-80 transition-opacity"
                  style={{ color: accent }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-14 text-xs" style={{ color: '#4b5563' }}>
          Made with{' '}
          <a
            href="https://tap.zakapedia.in"
            className="underline hover:text-gray-500 transition-colors"
            style={{ color: '#4b5563' }}
            onClick={(e) => isPreview && e.preventDefault()}
          >
            Tap
          </a>
        </p>
      </div>
    </div>
  )
}

function ensureHttp(url: string) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return `https://${url}`
  return url
}

function sortedLinks(links: Link[]) {
  return [...links].sort((a, b) => a.position - b.position)
}
