import type { Page, Link } from '../../types'
import { trackLinkClick } from '../../utils/trackEvent'

interface Props {
  page: Page
  links: Link[]
  isPreview?: boolean
}

export function Minimal({ page, links, isPreview = false }: Props) {
  const accent = page.accent_color || '#3B82F6'

  async function handleLinkClick(link: Link) {
    if (!isPreview) {
      await trackLinkClick(link.id, page.id)
      window.open(ensureHttp(link.url), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-sm mx-auto px-5 py-14">
        {/* Profile */}
        <div className={`flex flex-col items-center text-center mb-8 ${isPreview ? '' : 'animate-fade-in'}`}>
          {page.avatar_url ? (
            <img
              src={page.avatar_url}
              alt={page.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md mb-4"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-semibold text-white shadow-md"
              style={{ backgroundColor: accent }}
            >
              {(page.name || 'Y')[0].toUpperCase()}
            </div>
          )}

          <h1 className="text-xl font-semibold text-gray-900">
            {page.name || 'Your Name'}
          </h1>

          {page.bio && (
            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed max-w-xs">
              {page.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2.5">
          {sortedLinks(links).map((link, i) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className={`
                group w-full text-left
                bg-white rounded-2xl px-5 py-4
                shadow-sm hover:shadow-md
                border border-transparent
                transition-all duration-200
                ${isPreview ? '' : 'animate-fade-in'}
              `}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                {link.icon && (
                  <span className="text-xl leading-none flex-shrink-0">{link.icon}</span>
                )}
                <span className="flex-1 text-sm font-medium text-gray-900">
                  {link.title}
                </span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: accent + '20', color: accent }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-xs text-gray-300">
          Made with{' '}
          <a
            href="https://tap.zakapedia.in"
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
