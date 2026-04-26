import type { Page, Link } from '../../types'
import { trackLinkClick } from '../../utils/trackEvent'

interface Props {
  page: Page
  links: Link[]
  isPreview?: boolean
}

export function Expressive({ page, links, isPreview = false }: Props) {
  const accent = page.accent_color || '#8B5CF6'

  async function handleLinkClick(link: Link) {
    if (!isPreview) {
      await trackLinkClick(link.id, page.id)
      window.open(ensureHttp(link.url), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(135deg, ${accent}dd 0%, ${shiftHue(accent, 40)}cc 100%)`,
        fontFamily: 'Nunito, ui-rounded, system-ui, sans-serif',
      }}
    >
      <div className="max-w-sm mx-auto px-5 py-12">
        {/* Profile */}
        <div
          className={`flex flex-col items-center text-center mb-8 ${
            isPreview ? '' : 'animate-bounce-in'
          }`}
        >
          {page.avatar_url ? (
            <img
              src={page.avatar_url}
              alt={page.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/60 shadow-lg mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center text-3xl font-extrabold text-white border-4 border-white/40 shadow-lg bg-white/20">
              {(page.name || 'Y')[0].toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl font-extrabold text-white drop-shadow-sm">
            {page.name || 'Your Name'}
          </h1>

          {page.bio && (
            <p className="mt-2 text-sm text-white/80 leading-relaxed max-w-xs font-semibold">
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
                group w-full text-left
                bg-white/20 backdrop-blur-sm
                rounded-2xl px-5 py-4
                border-2 border-white/30
                hover:bg-white/35 hover:border-white/50
                transition-all duration-200 hover:scale-[1.02]
                active:scale-[0.98]
                ${isPreview ? '' : 'animate-bounce-in'}
              `}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                {link.icon && (
                  <span className="text-2xl leading-none flex-shrink-0">{link.icon}</span>
                )}
                <span className="flex-1 text-sm font-bold text-white">
                  {link.title}
                </span>
                <span className="text-white/60 group-hover:text-white/90 transition-colors text-lg">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-xs text-white/40 font-semibold">
          Made with{' '}
          <a
            href="https://tap.zakapedia.in"
            className="text-white/60 hover:text-white/80 transition-colors"
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

// Shifts a hex color's hue by `deg` degrees for gradient variety
function shiftHue(hex: string, deg: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const s = max === 0 ? 0 : (max - min) / max
  const v = max

  if (max !== min) {
    const d = max - min
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  h = (h + deg / 360) % 1
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

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
