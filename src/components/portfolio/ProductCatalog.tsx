import { ShoppingBag } from 'lucide-react'
import type { Page, Section, Link, ProductItem } from '../../types'

interface Props {
  page: Page
  sections: Section[]
  links: Link[]
}

function extractWhatsApp(links: Link[]): string | null {
  const waLink = links.find(l => l.url.includes('wa.me') || l.url.includes('api.whatsapp.com'))
  if (!waLink) return null
  const match = waLink.url.match(/wa\.me\/(\d+)/)
  return match ? match[1] : null
}

function parseItems(section: Section): ProductItem[] {
  try {
    const raw = section.content.items
    if (typeof raw === 'string') return JSON.parse(raw)
    if (Array.isArray(raw)) return raw as ProductItem[]
  } catch {}
  return []
}

function whatsappOrderUrl(phone: string, name: string, price: string): string {
  const text = encodeURIComponent(`Hi, I'd like to order: ${name} (${price})`)
  return `https://wa.me/${phone}?text=${text}`
}

export function ProductCatalog({ page, sections, links }: Props) {
  const productSection = sections.find(s => s.type === 'products')
  const items = productSection ? parseItems(productSection) : []
  const waPhone = extractWhatsApp(links)
  const accent = page.accent_color || '#6366f1'

  // Group by category
  const grouped: { category: string; items: ProductItem[] }[] = []
  const seen = new Set<string>()
  for (const item of items) {
    const cat = item.category?.trim() || ''
    if (!seen.has(cat)) {
      seen.add(cat)
      grouped.push({ category: cat, items: [] })
    }
    grouped.find(g => g.category === cat)!.items.push(item)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No products listed yet.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 text-center">
        {page.avatar_url && (
          <img
            src={page.avatar_url}
            alt={page.name}
            className="w-14 h-14 rounded-full object-cover mx-auto mb-3 border-2"
            style={{ borderColor: accent }}
          />
        )}
        <h1 className="text-lg font-bold text-gray-900">{page.name}</h1>
        {page.bio && <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{page.bio}</p>}
      </div>

      {/* Product grid */}
      <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-6">
        {grouped.map(({ category, items: catItems }) => (
          <div key={category}>
            {category && (
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{category}</h2>
            )}
            <div className="flex flex-col gap-3">
              {catItems.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 ${!item.in_stock ? 'opacity-60' : ''}`}
                >
                  {item.image_url && (
                    <div className="aspect-[3/2] overflow-hidden bg-gray-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</p>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color: accent }}>{item.price}</span>
                        {!item.in_stock && (
                          <span className="text-[9px] text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                    )}
                    {item.in_stock && waPhone && (
                      <a
                        href={whatsappOrderUrl(waPhone, item.name, item.price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: accent }}
                      >
                        Order on WhatsApp
                      </a>
                    )}
                    {item.in_stock && !waPhone && (
                      <p className="mt-2 text-[10px] text-gray-400 text-center">Contact seller to order</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-300 pb-8">
        Powered by <a href="https://tap.zakapedia.in" className="underline">Tap by Zakapedia</a>
      </p>
    </div>
  )
}
