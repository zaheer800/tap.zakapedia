import { useRef, useState } from 'react'
import { Plus, Trash2, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { compressImage } from '../../utils/compressImage'
import type { Section, ProductItem } from '../../types'

interface Props {
  section: Section
  userId: string
  onUpdate: (section: Section) => void
}

const inputCls = 'w-full px-3 py-2 text-xs bg-brand-dark border border-brand-border rounded-lg text-brand-text placeholder:text-brand-faint/60 focus:outline-none focus:border-brand-muted transition-colors'

function parseItems(content: Record<string, unknown>): ProductItem[] {
  try {
    const raw = content.items
    if (typeof raw === 'string') return JSON.parse(raw)
    if (Array.isArray(raw)) return raw as ProductItem[]
  } catch {}
  return []
}

async function persist(section: Section, items: ProductItem[], onUpdate: (s: Section) => void) {
  const content = { ...section.content, items }
  await supabase.from('sections').update({ content }).eq('id', section.id)
  onUpdate({ ...section, content })
}

export function ProductSectionEditor({ section, userId, onUpdate }: Props) {
  const [items, setItems] = useState<ProductItem[]>(() => parseItems(section.content))
  const [expanded, setExpanded] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function updateItem(id: string, patch: Partial<ProductItem>) {
    const next = items.map(i => i.id === id ? { ...i, ...patch } : i)
    setItems(next)
    persist(section, next, onUpdate)
  }

  function addProduct() {
    const id = crypto.randomUUID()
    const next = [...items, { id, name: '', price: '', in_stock: true }]
    setItems(next)
    setExpanded(id)
    persist(section, next, onUpdate)
  }

  function removeProduct(id: string) {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    persist(section, next, onUpdate)
  }

  async function handleImageUpload(id: string, file: File) {
    setUploading(id)
    try {
      const compressed = await compressImage(file, 600, 600, 0.85)
      const path = `${userId}/products/${id}.jpg`
      await supabase.storage.from('tap-avatars').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
      const { data } = supabase.storage.from('tap-avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      updateItem(id, { image_url: url })
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && (
        <p className="text-[10px] text-brand-faint py-2">No products yet. Add your first one below.</p>
      )}

      {items.map((item, idx) => {
        const isOpen = expanded === item.id
        return (
          <div key={item.id} className="rounded-xl border border-brand-border bg-brand-dark overflow-hidden">
            {/* Row header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-brand-border/20 transition-colors"
              onClick={() => setExpanded(isOpen ? null : item.id)}
            >
              {item.image_url ? (
                <img src={item.image_url} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-md bg-brand-surface flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-faint" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brand-text truncate">{item.name || `Product ${idx + 1}`}</p>
                {item.price && <p className="text-[10px] text-brand-faint">{item.price}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!item.in_stock && (
                  <span className="text-[9px] text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded-full">Out of stock</span>
                )}
                {isOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-brand-faint" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-brand-faint" />
                )}
              </div>
            </div>

            {/* Expanded form */}
            {isOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-brand-border flex flex-col gap-2">
                <input
                  value={item.name}
                  onChange={e => updateItem(item.id, { name: e.target.value })}
                  placeholder="Product name"
                  className={inputCls}
                />
                <input
                  value={item.price}
                  onChange={e => updateItem(item.id, { price: e.target.value })}
                  placeholder="Price, e.g. ₹350 or Free"
                  className={inputCls}
                />
                <input
                  value={item.description ?? ''}
                  onChange={e => updateItem(item.id, { description: e.target.value })}
                  placeholder="Description (optional)"
                  className={inputCls}
                />
                <input
                  value={item.category ?? ''}
                  onChange={e => updateItem(item.id, { category: e.target.value })}
                  placeholder="Category (optional, e.g. Starters)"
                  className={inputCls}
                />

                {/* Image */}
                <div className="flex items-center gap-2">
                  <input
                    value={item.image_url?.includes('?t=') ? '' : (item.image_url ?? '')}
                    onChange={e => updateItem(item.id, { image_url: e.target.value || undefined })}
                    placeholder="Image URL (optional)"
                    className={inputCls + ' flex-1'}
                  />
                  <input
                    ref={el => { fileRefs.current[item.id] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handleImageUpload(item.id, f)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[item.id]?.click()}
                    disabled={uploading === item.id}
                    className="flex-shrink-0 px-2.5 py-2 text-[10px] bg-brand-surface border border-brand-border rounded-lg text-brand-faint hover:text-brand-text hover:border-brand-muted transition-colors disabled:opacity-50"
                  >
                    {uploading === item.id ? '...' : 'Upload'}
                  </button>
                </div>

                {/* In stock toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => updateItem(item.id, { in_stock: !item.in_stock })}
                    className={`w-8 h-4 rounded-full transition-colors relative ${item.in_stock ? 'bg-green-600' : 'bg-brand-surface border border-brand-border'}`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.in_stock ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                  <span className="text-[10px] text-brand-faint">{item.in_stock ? 'In stock' : 'Out of stock'}</span>
                </label>

                <button
                  type="button"
                  onClick={() => removeProduct(item.id)}
                  className="flex items-center gap-1 text-[10px] text-brand-faint hover:text-red-400 transition-colors mt-1 self-start"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove product
                </button>
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={addProduct}
        className="flex items-center justify-center gap-1.5 border border-dashed border-brand-border rounded-xl py-2.5 text-xs text-brand-faint hover:text-brand-muted hover:border-brand-muted transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add product
      </button>
    </div>
  )
}
