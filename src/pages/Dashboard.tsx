import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Share2, LogOut, Globe, Layers, BarChart2,
  CreditCard, Wifi, Camera, Copy, ExternalLink,
  Plus, ChevronDown, Check, ImageIcon,
  Palette, Code2, Briefcase, BookOpen, PenTool, Store, TrendingUp,
  Eye, X, MessageSquare, Settings, XCircle, Package, Layout,
  Zap, Sparkles, RefreshCw,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { compressImage } from '../utils/compressImage'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import { ThemeSelector } from '../components/builder/ThemeSelector'
import { LinkList } from '../components/builder/LinkList'
import { Editorial } from '../components/themes/Editorial'
import { Minimal } from '../components/themes/Minimal'
import { Expressive } from '../components/themes/Expressive'
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard'
import { NFCOrderForm } from '../components/orders/NFCOrderForm'
import { VisitingCardOrderForm } from '../components/orders/VisitingCardOrderForm'
import { SectionContentEditor } from '../components/portfolio/SectionContentEditor'
import { ProductSectionEditor } from '../components/portfolio/ProductSectionEditor'
import { SECTION_META } from '../constants/sectionMeta'
import { generatePortfolio, rewriteBio } from '../services/ai'
import type { Page, Link, Theme, Section, ContactMessage, OrderMessage, NFCOrder, VisitingCardOrder } from '../types'

type Tab = 'build' | 'portfolio' | 'analytics' | 'nfc' | 'cards' | 'messages'

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'build',     label: 'Build',     Icon: Layers        },
  { id: 'portfolio', label: 'Portfolio', Icon: Layout        },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2     },
  { id: 'nfc',       label: 'NFC',       Icon: Wifi          },
  // { id: 'cards', label: 'Cards', Icon: CreditCard },  // visiting cards — hidden until re-enabled
  { id: 'messages',  label: 'Inbox',     Icon: MessageSquare },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const QUICK_LINKS: { title: string; url: string; icon: string; Logo: () => React.ReactElement }[] = [
  {
    title: 'Instagram', url: 'https://instagram.com/yourhandle', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig)"/><rect x="6.5" y="6.5" width="11" height="11" rx="3" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="16.3" cy="7.7" r="0.9" fill="white"/></svg>
    ),
  },
  {
    title: 'WhatsApp', url: 'https://wa.me/91', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><rect width="24" height="24" rx="6" fill="#25D366"/><path d="M12 5a7 7 0 0 0-5.9 10.7L5 19l3.4-1.1A7 7 0 1 0 12 5zm0 12.5a5.5 5.5 0 0 1-2.8-.8l-.2-.1-2 .6.6-1.9-.1-.2A5.5 5.5 0 1 1 12 17.5zm3-4.1c-.2-.1-.9-.4-1-.5-.2 0-.3-.1-.4.1l-.6.7c-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-1-.6-.5-1-1.1-1-1.3s0-.2.1-.3l.3-.4c.1-.1.1-.2.2-.3v-.3c0-.1-.4-1-.5-1.3-.1-.3-.3-.2-.4-.2h-.4c-.1 0-.3.1-.5.3-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.1 1.2 1.9 3 2.6.4.2.8.3 1 .3.4 0 .8-.2 1-.5.3-.3.3-.7.2-.8z" fill="white"/></svg>
    ),
  },
  {
    title: 'LinkedIn', url: 'https://linkedin.com/in/', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path d="M7.2 10.2h2.1v6.8H7.2zm1-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm3.3 3.2H13v.9h.1c.3-.6 1-1 2-1 2.1 0 2.5 1.4 2.5 3.2V17h-2.1v-3.3c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.8V17h-2.1v-6.8z" fill="white"/></svg>
    ),
  },
  {
    title: 'GitHub', url: 'https://github.com/', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><rect width="24" height="24" rx="6" fill="#24292e"/><path d="M12 4.5a7.5 7.5 0 0 0-2.37 14.62c.37.07.5-.16.5-.36v-1.37c-2.1.46-2.54-1.01-2.54-1.01-.34-.87-.83-1.1-.83-1.1-.68-.47.05-.46.05-.46.75.05 1.15.77 1.15.77.68 1.16 1.78.83 2.21.63.07-.49.26-.83.47-1.02-1.68-.19-3.44-.84-3.44-3.74 0-.83.3-1.5.78-2.03-.08-.19-.34-.96.07-2 0 0 .64-.2 2.08.77a7.2 7.2 0 0 1 3.77 0c1.44-.98 2.08-.77 2.08-.77.4 1.04.15 1.81.07 2 .49.53.78 1.2.78 2.03 0 2.91-1.77 3.55-3.45 3.74.27.23.52.69.52 1.4v2.07c0 .2.13.44.5.36A7.5 7.5 0 0 0 12 4.5z" fill="white"/></svg>
    ),
  },
  {
    title: 'Facebook', url: 'https://facebook.com/', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><rect width="24" height="24" rx="6" fill="#1877F2"/><path d="M13.5 8h2V5.5h-2C12.1 5.5 11 6.6 11 8v1.5H9V12h2v7h2.5v-7H15l.5-2.5h-2.5V8c0-.28.22-.5.5-.5z" fill="white"/></svg>
    ),
  },
  {
    title: 'YouTube', url: 'https://youtube.com/@', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><rect width="24" height="24" rx="6" fill="#FF0000"/><path d="M19.6 8.2s-.2-1.3-.8-1.9c-.7-.8-1.5-.8-1.9-.8C14.9 5.3 12 5.3 12 5.3s-2.9 0-4.9.2c-.4 0-1.2.1-1.9.8-.6.6-.8 1.9-.8 1.9S4.2 9.6 4.2 11v1.3c0 1.5.2 2.8.2 2.8s.2 1.3.8 1.9c.7.8 1.7.7 2.2.8 1.5.1 6.6.2 6.6.2s2.9 0 4.9-.2c.4-.1 1.2-.1 1.9-.8.6-.6.8-1.9.8-1.9s.2-1.4.2-2.8V11c0-1.4-.2-2.8-.2-2.8zM10.2 14v-5l5.2 2.5-5.2 2.5z" fill="white"/></svg>
    ),
  },
  {
    title: 'X', url: 'https://x.com/', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><rect width="24" height="24" rx="6" fill="#000"/><path d="M13.2 11.2 17.8 6h-1.1l-4 4.6L9.5 6H5.8l4.8 7-4.8 5.5h1.1l4.2-4.9 3.4 4.9h3.7l-5-7.3zm-1.5 1.7-.5-.7L6.9 6.9h1.7l3.1 4.4.5.7 4.1 5.8H14.6l-2.9-4.2z" fill="white"/></svg>
    ),
  },
  {
    title: 'Spotify', url: 'https://open.spotify.com/', icon: '',
    Logo: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0"><rect width="24" height="24" rx="12" fill="#1DB954"/><path d="M17.1 10.9c-3-1.8-8-1.9-10.8-1-.4.1-.8-.1-.9-.5s.1-.8.5-.9c3.3-.9 8.8-.8 12.2 1.3.4.2.5.7.3 1-.2.4-.9.4-1.3.1zm-.1 2.6c-.3.4-.7.5-1 .2-2.5-1.5-6.2-2-9.1-1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.4-.9 7.7-.5 10.7 1.2.4.2.5.6.2 1zm-1.1 2.5c-.2.3-.6.4-.9.2-2.1-1.3-4.8-1.5-8-.8-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7 3.4-.8 6.6-.5 9.1.9.3.1.3.5 0 .8z" fill="white"/></svg>
    ),
  },
]

const PROFILE_TO_USER_TYPE: Record<string, string> = {
  creator: 'creator',
  professional: 'business',
  business: 'local',
  service_pro: 'business',
  speaker: 'creator',
}

const PROFESSION_THEMES: Record<string, { theme: Theme; accent: string }> = {
  creator:    { theme: 'editorial',  accent: '#F59E0B' },
  influencer: { theme: 'expressive', accent: '#E11D48' },
  tech:       { theme: 'minimal',    accent: '#3B82F6' },
  business:   { theme: 'minimal',    accent: '#64748B' },
  education:  { theme: 'minimal',    accent: '#10B981' },
  artist:     { theme: 'expressive', accent: '#8B5CF6' },
  local:      { theme: 'expressive', accent: '#EC4899' },
}

const USER_TYPES: { id: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'creator',    label: 'Creator',               Icon: Palette    },
  { id: 'influencer', label: 'Social Media Influencer',Icon: TrendingUp },
  { id: 'tech',       label: 'Tech Pro',              Icon: Code2      },
  { id: 'business',   label: 'Professional',          Icon: Briefcase  },
  { id: 'education',  label: 'Educator',              Icon: BookOpen   },
  { id: 'artist',     label: 'Artist',                Icon: PenTool    },
  { id: 'local',      label: 'Business',              Icon: Store      },
]

function StatusStepper({ steps, status }: { steps: string[]; status: string }) {
  if (status === 'cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F87171', flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cancelled</span>
      </div>
    )
  }
  const n = steps.length
  const activeIdx = Math.max(0, steps.indexOf(status))
  const fillPct = n > 1 ? (activeIdx / (n - 1)) * 100 : 0
  return (
    <div style={{ marginTop: 10, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 2, backgroundColor: '#252018', borderRadius: 1 }} />
      <div style={{ position: 'absolute', top: 4, left: 0, height: 2, width: `${fillPct}%`, backgroundColor: '#C9963A', borderRadius: 1 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {steps.map((step, i) => {
          const done = i < activeIdx
          const active = i === activeIdx
          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', position: 'relative', zIndex: 1, flexShrink: 0,
                backgroundColor: done || active ? '#C9963A' : '#1E1A12',
                border: done || active ? 'none' : '1.5px solid #3A3A44',
                boxShadow: active ? '0 0 0 3px rgba(201,150,58,0.2)' : 'none',
              }} />
              <span style={{ fontSize: 9, lineHeight: 1, textTransform: 'capitalize', whiteSpace: 'nowrap', color: done || active ? '#C9963A' : '#3A3A44' }}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user, tapUser, signOut } = useAuth()
  const navigate = useNavigate()

  const [page, setPage] = useState<Page | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('build')
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userTypes, setUserTypes] = useState<string[]>(() => {
    const raw = tapUser?.user_type ?? localStorage.getItem('tap_user_type') ?? '[]'
    try { return JSON.parse(raw) } catch { return raw ? [raw] : [] }
  })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [orderMessages, setOrderMessages] = useState<OrderMessage[]>([])
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [supportText, setSupportText] = useState('')
  const [supportSending, setSupportSending] = useState(false)
  const [supportSent, setSupportSent] = useState(false)
  const [nfcOrders, setNfcOrders] = useState<NFCOrder[]>([])
  const [visitingOrders, setVisitingOrders] = useState<VisitingCardOrder[]>([])
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)

  // Portfolio tab state
  const [sections, setSections] = useState<Section[]>([])
  const [slugDraft, setSlugDraft] = useState('portfolio')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [sectionEdits, setSectionEdits] = useState<Record<string, Record<string, string>>>({})
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [generateSuccess, setGenerateSuccess] = useState(false)
  const [bioRewriting, setBioRewriting] = useState(false)
  const [bioRewriteError, setBioRewriteError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!tapUser && !loading) navigate('/onboarding')
  }, [tapUser, loading, navigate])

  useEffect(() => {
    if (!tapUser) return
    loadPageData()
  }, [tapUser])

  async function loadPageData() {
    if (!user) return
    const pageRes = await supabase.from('pages').select('*').eq('user_id', user.id).maybeSingle()
    if (pageRes.data) {
      setPage(pageRes.data as Page)
      setSlugDraft(pageRes.data.portfolio_slug ?? 'portfolio')
      const [lr, mr, omr, nfcr, vcr, crr, sr] = await Promise.all([
        supabase.from('links').select('*').eq('page_id', pageRes.data.id).order('position'),
        supabase.from('contact_messages').select('*').eq('page_id', pageRes.data.id).order('created_at', { ascending: false }),
        supabase.from('order_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('nfc_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('visiting_card_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('credits').select('balance').eq('user_id', user.id).maybeSingle(),
        supabase.from('sections').select('*').eq('page_id', pageRes.data.id).order('position'),
      ])
      setLinks((lr.data ?? []) as Link[])
      setMessages((mr.data ?? []) as ContactMessage[])
      setOrderMessages((omr.data ?? []) as OrderMessage[])
      setNfcOrders((nfcr.data ?? []) as NFCOrder[])
      setVisitingOrders((vcr.data ?? []) as VisitingCardOrder[])
      setCredits((crr.data as { balance: number } | null)?.balance ?? null)
      setSections((sr.data ?? []) as Section[])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user || !page) return
    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'tap', table: 'order_messages', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as OrderMessage
          setOrderMessages(prev => [msg, ...prev])
        }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'tap', table: 'contact_messages', filter: `page_id=eq.${page.id}` },
        (payload) => {
          const msg = payload.new as ContactMessage
          setMessages(prev => [msg, ...prev])
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'tap', table: 'nfc_orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as NFCOrder
          setNfcOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'tap', table: 'visiting_card_orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as VisitingCardOrder
          setVisitingOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, page?.id])

  useEffect(() => {
    if (!page || userTypes.length > 0) return
    const mapped = PROFILE_TO_USER_TYPE[page.profile_type ?? '']
    if (!mapped) return
    const next = [mapped]
    setUserTypes(next)
    const serialized = JSON.stringify(next)
    localStorage.setItem('tap_user_type', serialized)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from('users').update({ user_type: serialized } as any).eq('id', user!.id)
  }, [page?.id])

  const debouncedPage = useDebounce(page, 1500)
  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    if (!debouncedPage) return
    savePage(debouncedPage)
  }, [debouncedPage])

  async function savePage(p: Page) {
    setSaving(true)
    await supabase.from('pages').update({
      name: p.name,
      bio: p.bio,
      theme: p.theme,
      accent_color: p.accent_color,
      ...(p.banner_url !== undefined ? { banner_url: p.banner_url } : {}),
    }).eq('id', p.id)
    setSaving(false)
  }

  function updatePage(updates: Partial<Page>) {
    setPage((prev) => prev ? { ...prev, ...updates } : prev)
  }

  async function togglePublish() {
    if (!page) return
    const newVal = !page.published
    setPage((prev) => prev ? { ...prev, published: newVal } : prev)
    await supabase.from('pages').update({ published: newVal }).eq('id', page.id)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !page || !user) return
    setAvatarUploading(true)
    const compressed = await compressImage(file, 300, 300, 0.85)
    const path = `${user.id}/avatar.jpg`
    await supabase.storage.from('tap-avatars').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
    const { data } = supabase.storage.from('tap-avatars').getPublicUrl(path)
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`
    await supabase.from('pages').update({ avatar_url: avatarUrl }).eq('id', page.id)
    setPage((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev)
    setAvatarUploading(false)
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !page || !user) return
    setBannerUploading(true)
    const compressed = await compressImage(file, 1200, 400, 0.82)
    const path = `${user.id}/banner.jpg`
    await supabase.storage.from('tap-avatars').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
    const { data } = supabase.storage.from('tap-avatars').getPublicUrl(path)
    const bannerUrl = `${data.publicUrl}?t=${Date.now()}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('pages').update({ banner_url: bannerUrl } as any).eq('id', page.id)
    setPage((prev) => prev ? { ...prev, banner_url: bannerUrl } : prev)
    setBannerUploading(false)
  }

  async function addQuickLink(preset: typeof QUICK_LINKS[0]) {
    if (!page || links.some((l) => l.title === preset.title)) return
    const { data } = await supabase
      .from('links')
      .insert({ page_id: page.id, title: preset.title, url: preset.url, icon: preset.icon, position: links.length })
      .select().single()
    if (data) setLinks((prev) => [...prev, data as Link])
  }

  async function addLink() {
    if (!page) return
    const { data } = await supabase
      .from('links')
      .insert({ page_id: page.id, title: 'New link', url: 'https://', icon: '', position: links.length })
      .select().single()
    if (data) setLinks((prev) => [...prev, data as Link])
  }

  async function updateLink(id: string, updates: Partial<Link>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)))
    await supabase.from('links').update(updates).eq('id', id)
  }

  async function deleteLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    await supabase.from('links').delete().eq('id', id)
  }

  async function reorderLinks(reordered: Link[]) {
    setLinks(reordered)
    await Promise.all(reordered.map((l) => supabase.from('links').update({ position: l.position }).eq('id', l.id)))
  }

  function copyLink() {
    if (!tapUser) return
    navigator.clipboard.writeText(`https://tap.zakapedia.in/${tapUser.username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    if (!tapUser) return
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my brand page: https://tap.zakapedia.in/${tapUser.username}`)}`, '_blank')
  }

  async function handleUserTypeChange(type: string) {
    const isAdding = !userTypes.includes(type)
    const next = isAdding ? [...userTypes, type] : userTypes.filter((t) => t !== type)
    const serialized = JSON.stringify(next)
    setUserTypes(next)
    localStorage.setItem('tap_user_type', serialized)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('users').update({ user_type: serialized } as any).eq('id', user!.id)
    if (isAdding && userTypes.length === 0 && PROFESSION_THEMES[type]) {
      const { theme, accent } = PROFESSION_THEMES[type]
      updatePage({ theme, accent_color: accent })
    }
  }

  // ── Portfolio helpers ───────────────────────────────────────────────────────

  async function saveSlug() {
    const clean = slugDraft.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
    if (!clean || clean === (page?.portfolio_slug ?? 'portfolio')) return
    setSlugDraft(clean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('pages').update({ portfolio_slug: clean } as any).eq('id', page!.id)
    setPage(prev => prev ? { ...prev, portfolio_slug: clean } : prev)
  }

  async function saveSectionContent(section: Section, edits: Record<string, string>) {
    if (!Object.keys(edits).length) return
    const merged = { ...section.content as Record<string, string>, ...edits }
    await supabase.from('sections').update({ content: merged }).eq('id', section.id)
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, content: merged } : s))
    setSectionEdits(prev => { const next = { ...prev }; delete next[section.id]; return next })
  }

  async function handleAddSection(type: string) {
    if (!page) return
    const position = sections.length
    const { data } = await supabase
      .from('sections')
      .insert({ page_id: page.id, type, position, content: {} })
      .select()
      .single()
    if (data) {
      setSections(prev => [...prev, data as Section])
      setExpandedSection(data.id)
    }
    setAddSectionOpen(false)
  }

  function extractWhatsAppNumber(): string {
    const waLink = links.find(l => {
      const url = l.url.toLowerCase()
      const title = l.title.toLowerCase()
      return url.includes('wa.me') || url.includes('whatsapp.com') || title === 'whatsapp'
    })
    if (!waLink) return ''
    try {
      const url = new URL(waLink.url)
      const num = url.pathname.replace(/^\//, '').split('?')[0]
      return num ? `+${num.replace(/^\+/, '')}` : ''
    } catch {
      return ''
    }
  }

  function handleExpandSection(section: Section) {
    const isExpanded = expandedSection === section.id
    if (!isExpanded) {
      const edits = sectionEdits[section.id] ?? {}
      const content = { ...section.content as Record<string, string>, ...edits }
      if (section.type === 'contact' && !content.phone) {
        const num = extractWhatsAppNumber()
        if (num) setSectionEdits(prev => ({ ...prev, [section.id]: { ...(prev[section.id] ?? {}), phone: num } }))
      }
      if ((section.type === 'whatsapp_order' || section.type === 'book_appointment') && !content.number) {
        const num = extractWhatsAppNumber()
        if (num) setSectionEdits(prev => ({ ...prev, [section.id]: { ...(prev[section.id] ?? {}), number: num } }))
      }
    }
    setExpandedSection(isExpanded ? null : section.id)
  }

  async function handleRemoveSection(id: string) {
    await supabase.from('sections').delete().eq('id', id)
    setSections(prev => prev.filter(s => s.id !== id))
    if (expandedSection === id) setExpandedSection(null)
  }

  async function handleAddToProfile() {
    if (!page || !tapUser) return
    const portfolioUrl = `https://tap.zakapedia.in/${tapUser.username}/${slugDraft}`
    if (links.some(l => l.url === portfolioUrl)) return
    const { data } = await supabase
      .from('links')
      .insert({ page_id: page.id, title: 'My Portfolio', url: portfolioUrl, icon: '', position: links.length })
      .select().single()
    if (data) setLinks(prev => [...prev, data as Link])
  }

  async function handleGeneratePortfolio() {
    if (!page || !tapUser || !user) return

    // Always sync from DB before checking — prevents stale state blocking generation
    const { data: latestCredits } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
    const currentBalance = latestCredits?.balance ?? 0
    setCredits(currentBalance)
    if (currentBalance < 10) return

    setGenerating(true)
    setGenerateError('')
    setGenerateSuccess(false)
    try {
      const input = {
        profileType: (page.profile_type ?? 'professional') as import('../services/ai').ProfileType,
        theme: page.theme as import('../services/ai').Theme,
        name: page.name,
        bio: page.bio,
        role: page.role ?? undefined,
        userRoles: userTypes,
        accentColor: page.accent_color,
        avatarUrl: page.avatar_url ?? undefined,
        profileUrl: `https://tap.zakapedia.in/${tapUser.username}`,
        links: links.map(l => ({ title: l.title, url: l.url })),
        sections: sections.map(s => ({
          type: s.type,
          content: { ...s.content as Record<string, unknown>, ...(sectionEdits[s.id] ?? {}) },
        })),
      }
      const html = await generatePortfolio(input)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('pages').update({ portfolio_html: html } as any).eq('id', page.id)
      setPage(prev => prev ? { ...prev, portfolio_html: html } : prev)
      // Deduct credits — read fresh balance from DB to avoid stale state
      const { data: freshCredits } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
      const newBalance = Math.max(0, (freshCredits?.balance ?? 0) - 10)
      await supabase.from('credits').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      setCredits(newBalance)
      setGenerateSuccess(true)
    } catch (err) {
      setGenerateError((err as Error).message ?? 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRewriteBio() {
    if (!page || !user || !page.bio.trim()) return

    const { data: latestCredits } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
    const currentBalance = latestCredits?.balance ?? 0
    setCredits(currentBalance)
    if (currentBalance < 3) return

    setBioRewriting(true)
    setBioRewriteError('')
    try {
      const rewritten = await rewriteBio(
        page.bio,
        (page.profile_type ?? 'professional') as import('../services/ai').ProfileType
      )
      updatePage({ bio: rewritten })
      const { data: freshCredits } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
      const newBalance = Math.max(0, (freshCredits?.balance ?? 0) - 3)
      await supabase.from('credits').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      setCredits(newBalance)
    } catch (err) {
      setBioRewriteError((err as Error).message ?? 'Rewrite failed. Please try again.')
    } finally {
      setBioRewriting(false)
    }
  }

  // ── End portfolio helpers ────────────────────────────────────────────────────

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  async function markRead(id: string) {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
    await supabase.from('contact_messages').update({ read: true }).eq('id', id)
  }

function toggleMessage(id: string) {
    const isOpening = selectedMsgId !== id
    setSelectedMsgId(isOpening ? id : null)
    if (isOpening) {
      const msg = messages.find((m) => m.id === id)
      if (msg && !msg.read) markRead(id)
    }
  }

  async function markOrderMsgRead(id: string) {
    setOrderMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
    await supabase.from('order_messages').update({ read: true }).eq('id', id)
  }

  async function sendSupportMessage() {
    if (!user || !supportText.trim()) return
    setSupportSending(true)
    await supabase.from('order_messages').insert({
      user_id: user.id,
      order_id: null,
      order_type: 'support',
      message: supportText.trim(),
      from_admin: false,
      read: false,
    })
    setSupportSending(false)
    setSupportSent(true)
    setSupportText('')
    setTimeout(() => { setSupportSent(false); setSupportModalOpen(false) }, 2000)
  }

  async function cancelNFCOrder(id: string) {
    await supabase.from('nfc_orders').update({ status: 'cancelled' }).eq('id', id).eq('status', 'placed')
    setNfcOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o))
    setCancelConfirmId(null)
  }

  async function cancelVisitingOrder(id: string) {
    await supabase.from('visiting_card_orders').update({ status: 'cancelled' }).eq('id', id).eq('status', 'placed')
    setVisitingOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o))
    setCancelConfirmId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-border border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!tapUser) return null // useEffect redirects to /onboarding

  if (!page) {
    return (
      <div className="min-h-screen bg-brand-dark text-brand-text flex flex-col items-center justify-center px-5 text-center">
        <Logo linkTo="/dashboard" />
        <h2 className="font-display italic text-2xl text-brand-text mt-8 mb-2">Your page wasn't created.</h2>
        <p className="text-sm text-brand-muted mb-6 max-w-xs">Something went wrong during setup. Let's get you sorted.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="bg-brand-gold text-brand-dark text-sm font-bold px-6 py-3 rounded-xl hover:bg-brand-gold-light transition-colors"
        >
          Set up your page →
        </button>
      </div>
    )
  }

  const ThemeComponent = page.theme === 'editorial' ? Editorial : page.theme === 'expressive' ? Expressive : Minimal
  const pageUrl = `tap.zakapedia.in/${tapUser.username}`
  const bioLen = page.bio?.length ?? 0
  const unreadCount = messages.filter((m) => !m.read).length + orderMessages.filter((m) => m.from_admin && !m.read).length

  return (
    <div
      className="min-h-screen bg-brand-dark text-brand-text flex flex-col font-sans"
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Logo linkTo="/dashboard" />
          <span className="text-[11px] text-brand-faint font-mono hidden sm:block">/{tapUser.username}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user?.email === 'zaheer800@gmail.com' && (
            <a
              href="/admin"
              className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-brand-faint hover:text-brand-gold transition-colors px-2 py-1 rounded-md hover:bg-brand-gold/10"
            >
              <Settings className="w-3 h-3" />
              Admin
            </a>
          )}
          {saving && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-brand-faint">
              <span className="w-3 h-3 border border-brand-border border-t-brand-muted rounded-full animate-spin" />
              Saving
            </span>
          )}

          {credits !== null && (
            <div className="flex items-center gap-1 bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1" title="AI credits remaining">
              <Zap className="w-3 h-3 text-brand-gold" />
              <span className="text-[11px] font-semibold text-brand-gold tabular-nums">{credits}</span>
              <span className="text-[11px] text-brand-faint">credits</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
              className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-xs font-bold text-brand-gold">
                {tapUser.username[0].toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-brand-surface rounded-xl shadow-2xl border border-brand-border py-1 z-40">
                <p className="px-3 py-2 text-[10px] text-brand-faint">@{tapUser.username}</p>
                <hr className="border-brand-border my-1" />
                <a
                  href={`/${tapUser.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View my page
                </a>
                {user?.email === 'zaheer800@gmail.com' && (
                  <a
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-brand-gold hover:text-brand-gold-light hover:bg-brand-gold/10 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Admin
                  </a>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 overflow-hidden">

        {/* BUILD */}
        {activeTab === 'build' && (
          <div className="flex h-full">
            <div className="flex-1 overflow-y-auto pb-24">

              {/* Go Live card */}
              <div className={`mx-4 sm:mx-6 mt-5 rounded-2xl border overflow-hidden transition-colors ${
                page.published
                  ? 'border-green-800/50 bg-green-950/20'
                  : 'border-brand-gold/40 bg-brand-gold/[0.05]'
              }`}>
                {page.published ? (
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] font-semibold tracking-[0.18em] text-green-400 uppercase">Your brand is live</span>
                    </div>
                    <p className="text-brand-faint text-xs font-mono mb-4">{pageUrl}</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={copyLink}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text rounded-lg px-3 py-2 transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy link'}
                      </button>
                      <button onClick={shareWhatsApp}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text rounded-lg px-3 py-2 transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                      <a href={`/${tapUser.username}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text rounded-lg px-3 py-2 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        View page
                      </a>
                      <button onClick={togglePublish}
                        className="inline-flex items-center text-xs text-brand-faint hover:text-brand-muted rounded-lg px-3 py-2 transition-colors ml-auto">
                        Take offline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-display italic font-bold text-xl text-brand-text mb-1">Ready to launch?</p>
                      <p className="text-brand-muted text-sm">Publish your brand page and share it with the world.</p>
                    </div>
                    <button onClick={togglePublish}
                      className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-gold text-brand-dark font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-gold-light transition-colors whitespace-nowrap">
                      <Globe className="w-4 h-4" />
                      Launch Your Brand
                    </button>
                  </div>
                )}
              </div>

              <div className="px-4 sm:px-6 pt-6 pb-2 flex flex-col gap-7 max-w-xl">

                {/* Profile section */}
                <section>
                  <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em] mb-3">Profile</h2>

                  {/* Banner */}
                  <div
                    className="relative w-full h-28 rounded-xl overflow-hidden border border-brand-border cursor-pointer group mb-4"
                    onClick={() => bannerInputRef.current?.click()}
                    style={{ background: page.banner_url ? undefined : 'linear-gradient(135deg,#1a1510 0%,#252018 100%)' }}
                  >
                    {page.banner_url
                      ? <img src={page.banner_url} alt="Banner" className="w-full h-full object-cover" />
                      : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                          <ImageIcon className="w-5 h-5 text-brand-faint" />
                          <span className="text-[10px] text-brand-faint">Add cover image</span>
                        </div>
                      )
                    }
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 bg-black/60 rounded-lg px-3 py-1.5 text-xs text-white font-medium">
                        <Camera className="w-3.5 h-3.5" />
                        {bannerUploading ? 'Uploading…' : 'Change cover'}
                      </span>
                    </div>
                    <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      {page.avatar_url
                        ? <img src={page.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-brand-surface" />
                        : (
                          <div className="w-16 h-16 rounded-full bg-brand-surface border-2 border-brand-border flex items-center justify-center text-xl font-bold text-brand-gold">
                            {(page.name || tapUser.username)[0].toUpperCase()}
                          </div>
                        )
                      }
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center hover:bg-brand-gold-light transition-colors disabled:opacity-50"
                      >
                        {avatarUploading
                          ? <span className="w-3 h-3 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                          : <Camera className="w-3 h-3 text-brand-dark" />
                        }
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-text">Profile photo</p>
                      <p className="text-xs text-brand-faint mt-0.5">JPG or PNG · Max 5 MB</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-medium text-brand-muted block mb-1.5">Name</label>
                      <input
                        value={page.name}
                        onChange={(e) => updatePage({ name: e.target.value })}
                        placeholder="Your name or brand"
                        maxLength={60}
                        className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-faint focus:border-brand-muted focus:outline-none transition-colors"
                      />
                    </div>
                    {/* Bio with AI rewrite */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-brand-muted">Bio</label>
                        <button
                          onClick={handleRewriteBio}
                          disabled={bioRewriting || !page.bio.trim() || (credits !== null && credits < 3)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-gold border border-brand-gold/30 bg-brand-gold/5 rounded-full px-2.5 py-1 hover:bg-brand-gold/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {bioRewriting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Rewriting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              Rewrite with AI
                              <span className="text-brand-faint font-normal">· 3 credits</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        value={page.bio}
                        onChange={(e) => { setBioRewriteError(''); updatePage({ bio: e.target.value }) }}
                        placeholder="Tell the world what you're about — your brand in a few words"
                        rows={3}
                        maxLength={500}
                        disabled={bioRewriting}
                        className={`w-full bg-brand-surface border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-faint focus:border-brand-muted focus:outline-none transition-all resize-none ${bioRewriting ? 'opacity-50 cursor-not-allowed border-brand-border' : 'border-brand-border'}`}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-red-400">{bioRewriteError}</p>
                        <p className={`text-[10px] tabular-nums transition-colors ${bioLen > 450 ? 'text-amber-400' : 'text-brand-faint'}`}>
                          {bioLen}/500
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* User type */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em]">Your Roles</h2>
                    {userTypes.length > 0 && (
                      <span className="text-[10px] text-brand-gold font-medium">
                        {userTypes.length} selected
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-brand-faint mb-3">Select all that apply — you can wear multiple hats</p>
                  <div className="flex flex-wrap gap-2">
                    {USER_TYPES.map((t) => {
                      const active = userTypes.includes(t.id)
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleUserTypeChange(t.id)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                            active
                              ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                              : 'border-brand-border text-brand-muted hover:border-brand-faint hover:text-brand-text'
                          }`}
                        >
                          <t.Icon className="w-3.5 h-3.5" />
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* Links */}
                <section>
                  <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em] mb-3">Links</h2>
                  {/* Quick add */}
                  <div className="mb-4">
                    <p className="text-[10px] text-brand-faint mb-2">Quick add</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_LINKS.map((preset) => {
                        const exists = links.some((l) => l.title === preset.title)
                        return (
                          <button
                            key={preset.title}
                            onClick={() => addQuickLink(preset)}
                            disabled={exists}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                              exists
                                ? 'border-brand-border/40 text-brand-faint/40 cursor-default opacity-50'
                                : 'border-brand-border text-brand-muted hover:border-brand-gold/50 hover:text-brand-gold'
                            }`}
                          >
                            <preset.Logo />
                            {preset.title}
                            {exists ? <Check className="w-3 h-3 text-brand-gold/50" /> : <Plus className="w-3 h-3" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <LinkList
                    links={links}
                    onAdd={addLink}
                    onUpdate={updateLink}
                    onDelete={deleteLink}
                    onReorder={reorderLinks}
                  />
                </section>

                {/* Theme / Design */}
                <section>
                  <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em] mb-3">Design</h2>
                  <ThemeSelector
                    theme={page.theme}
                    accentColor={page.accent_color}
                    onThemeChange={(t: Theme) => updatePage({ theme: t })}
                    onAccentChange={(c: string) => updatePage({ accent_color: c })}
                  />
                </section>

              </div>
            </div>

            {/* Preview — desktop */}
            <div className="hidden lg:flex flex-shrink-0 w-80 xl:w-96 items-start justify-center p-8 bg-brand-surface border-l border-brand-border overflow-y-auto">
              <div className="sticky top-8">
                <p className="text-[10px] font-semibold text-brand-faint text-center mb-4 uppercase tracking-[0.18em]">Preview</p>
                <div className="relative">
                  <div className="w-[240px] h-[500px] rounded-[32px] border-[6px] border-brand-border overflow-hidden shadow-2xl bg-white">
                    <div style={{ width: '375px', height: '780px', transform: 'scale(0.64)', transformOrigin: 'top left', overflowY: 'hidden' }}>
                      <ThemeComponent page={page} links={links} isPreview userTypes={userTypes} />
                    </div>
                  </div>
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-brand-border rounded-full" />
                </div>
                {page.published && (
                  <a
                    href={`/${tapUser.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center text-[10px] text-brand-faint hover:text-brand-muted transition-colors"
                  >
                    <span className="flex items-center justify-center gap-1">{pageUrl} <ExternalLink className="w-2.5 h-2.5" /></span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4 sm:px-6 pt-5 max-w-xl">

              {/* URL row */}
              <section className="mb-6">
                <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em] mb-3">Portfolio URL</h2>
                <div className="bg-brand-surface border border-brand-border rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    <span className="text-xs text-brand-faint font-mono whitespace-nowrap">tap.zakapedia.in/{tapUser.username}/</span>
                    <input
                      value={slugDraft}
                      onChange={e => setSlugDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      onBlur={saveSlug}
                      maxLength={40}
                      className="flex-1 min-w-16 bg-transparent text-brand-gold font-mono text-xs focus:outline-none border-b border-dashed border-brand-gold/50 focus:border-brand-gold pb-0.5"
                    />
                    <a
                      href={`/${tapUser.username}/${slugDraft}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-faint hover:text-brand-text transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[10px] text-brand-faint">
                    e.g. <span className="text-brand-muted font-mono">portfolio</span>, <span className="text-brand-muted font-mono">cv</span>, <span className="text-brand-muted font-mono">menu</span>, <span className="text-brand-muted font-mono">showcase</span>
                  </p>
                </div>
              </section>

              {/* Sections */}
              <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em]">Sections</h2>
                  <span className="text-[10px] text-brand-faint">{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {sections.map(section => {
                    const meta = SECTION_META[section.type]
                    if (!meta) return null
                    const SectionIcon = meta.icon
                    const isExpanded = expandedSection === section.id
                    const edits = sectionEdits[section.id] ?? {}
                    const content = { ...section.content as Record<string, string>, ...edits }
                    return (
                      <div key={section.id} className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
                        <div
                          onClick={() => handleExpandSection(section)}
                          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-brand-border/20 transition-colors"
                        >
                          <SectionIcon className="w-5 h-5 flex-shrink-0 text-brand-faint" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-brand-text">{meta.label}</p>
                            <p className="text-xs text-brand-faint mt-0.5 truncate">{meta.desc}</p>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-brand-faint transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        {isExpanded && (
                          <div
                            className="px-4 pb-4 border-t border-brand-border"
                            onBlur={section.type !== 'products' ? () => saveSectionContent(section, edits) : undefined}
                          >
                            <p className="text-[10px] text-brand-faint mt-3 mb-2.5">
                              {section.type === 'products' ? 'Changes save immediately.' : 'Changes auto-save when you leave a field.'}
                            </p>
                            {section.type === 'products' ? (
                              <ProductSectionEditor
                                section={section}
                                userId={user!.id}
                                onUpdate={updated => setSections(prev => prev.map(s => s.id === updated.id ? updated : s))}
                              />
                            ) : (
                              <SectionContentEditor
                                type={section.type}
                                content={content}
                                onChange={(key, value) => setSectionEdits(prev => ({
                                  ...prev,
                                  [section.id]: { ...(prev[section.id] ?? {}), [key]: value }
                                }))}
                              />
                            )}
                            <button
                              onClick={() => handleRemoveSection(section.id)}
                              className="mt-3 text-[10px] text-brand-faint hover:text-red-400 transition-colors"
                            >
                              Remove section
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Add section */}
                <div className="mt-2.5">
                  {addSectionOpen ? (
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4">
                      <p className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em] mb-3">Add a section</p>
                      <div className="flex flex-col gap-1">
                        {Object.entries(SECTION_META)
                          .filter(([type]) => !sections.some(s => s.type === type))
                          .map(([type, meta]) => {
                            const AddIcon = meta.icon
                            return (
                            <button
                              key={type}
                              onClick={() => handleAddSection(type)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-border/40 transition-colors text-left"
                            >
                              <AddIcon className="w-4 h-4 flex-shrink-0 text-brand-faint" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-brand-text">{meta.label}</p>
                                <p className="text-[10px] text-brand-faint">{meta.desc}</p>
                              </div>
                            </button>
                            )
                          })
                        }
                        {Object.keys(SECTION_META).filter(t => !sections.some(s => s.type === t)).length === 0 && (
                          <p className="text-xs text-brand-faint text-center py-4">All sections added!</p>
                        )}
                      </div>
                      <button
                        onClick={() => setAddSectionOpen(false)}
                        className="mt-3 text-xs text-brand-faint hover:text-brand-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddSectionOpen(true)}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-brand-border rounded-2xl py-3 text-xs text-brand-faint hover:text-brand-muted hover:border-brand-muted transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add section
                    </button>
                  )}
                </div>
              </section>

              {/* Credits */}
              <section>
                <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em] mb-3">AI Credits</h2>
                <div className="rounded-2xl border border-brand-border bg-brand-surface px-5 py-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-brand-gold" />
                      <span className="text-sm font-bold text-brand-gold tabular-nums">{credits ?? '—'}</span>
                      <span className="text-xs text-brand-muted">credits remaining</span>
                    </div>
                    {credits !== null && credits < 10 && (
                      <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Low</span>
                    )}
                  </div>
                  <div className="w-full bg-brand-border rounded-full h-1 mb-3">
                    <div
                      className="bg-brand-gold rounded-full h-1 transition-all"
                      style={{ width: `${Math.min(100, ((credits ?? 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-brand-muted mb-3">Each generation costs 10 credits. Get more credits to keep building.</p>
                  <a
                    href={`https://wa.me/916381601740?text=${encodeURIComponent('Hi! I\'d like to buy AI credits for my Tap portfolio.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 text-xs font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" /> Buy Credits
                  </a>
                </div>
              </section>

              {/* Status + actions */}
              <section>
                <h2 className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em] mb-3">Publish</h2>

                {/* Portfolio status */}
                <div className={`rounded-2xl border px-5 py-4 mb-3 transition-colors ${
                  page.portfolio_html
                    ? 'border-green-800/50 bg-green-950/20'
                    : 'border-brand-border bg-brand-surface'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${page.portfolio_html ? (generateSuccess ? 'bg-green-400 animate-pulse' : 'bg-green-400') : 'bg-brand-faint'}`} />
                    <span className={`text-[10px] font-semibold tracking-[0.14em] uppercase ${page.portfolio_html ? 'text-green-400' : 'text-brand-faint'}`}>
                      {generateSuccess ? 'Just generated!' : page.portfolio_html ? 'Portfolio ready' : 'Not generated yet'}
                    </span>
                  </div>
                  {page.portfolio_html && (
                    <a
                      href={`/${tapUser.username}/${slugDraft}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-text transition-colors mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      tap.zakapedia.in/{tapUser.username}/{slugDraft}
                    </a>
                  )}
                </div>

                {/* Add to profile */}
                {(() => {
                  const portfolioUrl = `https://tap.zakapedia.in/${tapUser.username}/${slugDraft}`
                  const alreadyAdded = links.some(l => l.url === portfolioUrl)
                  return (
                    <button
                      onClick={handleAddToProfile}
                      disabled={alreadyAdded}
                      className={`w-full flex items-center justify-center gap-2 border rounded-xl py-3 text-sm font-medium transition-colors mb-3 ${
                        alreadyAdded
                          ? 'border-green-800/50 text-green-400 bg-green-950/20 cursor-default'
                          : 'border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-faint'
                      }`}
                    >
                      {alreadyAdded
                        ? <><Check className="w-4 h-4" /> Added to profile links</>
                        : <><Plus className="w-4 h-4" /> Add portfolio link to profile</>
                      }
                    </button>
                  )
                })()}

                {/* Generate */}
                {generateError && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 mb-3">
                    {generateError}
                  </p>
                )}
                <button
                  onClick={handleGeneratePortfolio}
                  disabled={generating || (credits !== null && credits < 10)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-dark text-sm font-bold py-3.5 rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-40"
                >
                  {generating
                    ? <><span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" /> Generating…</>
                    : page.portfolio_html
                      ? <><RefreshCw className="w-4 h-4" /> Regenerate · <Zap className="w-3.5 h-3.5" /> 10 credits</>
                      : <><Sparkles className="w-4 h-4" /> Generate Portfolio with AI · <Zap className="w-3.5 h-3.5" /> 10 credits</>
                  }
                </button>
                {credits !== null && credits < 10 && !generating && !generateSuccess && (
                  <p className="text-center text-xs text-red-400 mt-2">
                    Not enough credits (need 10, have {credits})
                  </p>
                )}
                {credits !== null && credits < 10 && !generating && generateSuccess && (
                  <p className="text-center text-xs text-brand-muted mt-2">
                    Buy more credits to regenerate
                  </p>
                )}

                {/* Custom portfolio CTA */}
                <div className="mt-4 border border-brand-border rounded-2xl px-5 py-4">
                  <p className="text-xs font-semibold text-brand-text mb-1">Want something more?</p>
                  <p className="text-[11px] text-brand-muted mb-3 leading-relaxed">Get a custom-designed portfolio on your own domain, or have us redesign this page to match your brand.</p>
                  <a
                    href={`https://wa.me/916381601740?text=${encodeURIComponent(`Hi! I'd like a custom portfolio page on my own domain. My Tap profile: https://tap.zakapedia.in/${tapUser?.username}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-faint text-xs font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat with us on WhatsApp
                  </a>
                </div>
              </section>

            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="p-4 sm:p-6 pb-24 max-w-2xl">
            {page.published ? (
              <AnalyticsDashboard page={page} links={links} />
            ) : (
              <div className="text-center py-20">
                <BarChart2 className="w-10 h-10 text-brand-faint mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-brand-text mb-2">Launch your brand to unlock analytics</h3>
                <p className="text-sm text-brand-muted mb-6 max-w-xs mx-auto">Page views, link clicks, and NFC tap data appear here once your page is live.</p>
                <button onClick={togglePublish}
                  className="bg-brand-gold text-brand-dark text-sm font-bold px-6 py-3 rounded-xl hover:bg-brand-gold-light transition-colors">
                  Launch your brand
                </button>
              </div>
            )}
          </div>
        )}

        {/* NFC */}
        {activeTab === 'nfc' && (
          <div className="p-4 sm:p-6 pb-24 max-w-xl">
            <NFCOrderForm page={page} tapUser={tapUser} onGoToInbox={() => setActiveTab('messages')} />
          </div>
        )}

        {/* VISITING CARDS */}
        {activeTab === 'cards' && (
          <div className="p-4 sm:p-6 pb-24 max-w-xl">
            <VisitingCardOrderForm page={page} tapUser={tapUser} onGoToInbox={() => setActiveTab('messages')} />
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4 sm:px-6 pt-5 max-w-xl">

              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-brand-text">Inbox</h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-gold text-brand-dark text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-brand-faint mb-5">Messages from visitors · Order updates from Tap</p>

              {/* Combined feed */}
              {(() => {
                const NFC_STEPS = ['placed', 'printing', 'shipped', 'delivered']
                const VC_STEPS = ['placed', 'printing', 'shipped', 'delivered']
                const feed = [
                  ...messages.map(m => ({ kind: 'contact' as const, id: m.id, read: m.read, created_at: m.created_at, m })),
                  ...orderMessages.filter(m => m.from_admin).map(m => ({ kind: 'order' as const, id: m.id, read: m.read, created_at: m.created_at, m })),
                  ...orderMessages.filter(m => !m.from_admin).map(m => ({ kind: 'sent' as const, id: m.id, read: true, created_at: m.created_at, m })),
                  ...nfcOrders.map(o => ({ kind: 'nfc_order' as const, id: o.id, read: true, created_at: o.created_at, o })),
                  ...visitingOrders.map(o => ({ kind: 'visiting_order' as const, id: o.id, read: true, created_at: o.created_at, o })),
                ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                if (feed.length === 0) return (
                  <div className="text-center py-16">
                    <MessageSquare className="w-10 h-10 text-brand-faint mx-auto mb-3" />
                    <p className="text-sm font-medium text-brand-muted mb-1">No messages yet</p>
                    <p className="text-xs text-brand-faint">Visitor messages and your orders will appear here.</p>
                  </div>
                )

                return (
                  <div className="flex flex-col gap-2">
                    {feed.map((item) => {
                      if (item.kind === 'contact') {
                        const msg = item.m as ContactMessage
                        const isOpen = selectedMsgId === msg.id
                        return (
                          <button key={item.id} onClick={() => toggleMessage(msg.id)}
                            className="w-full text-left rounded-xl overflow-hidden border transition-colors"
                            style={{ borderColor: !msg.read ? 'rgba(201,150,58,0.35)' : '#252018', backgroundColor: !msg.read ? 'rgba(201,150,58,0.05)' : '#141210' }}>
                            <div className="flex items-start gap-3 px-4 py-3.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: page.accent_color + '22', color: page.accent_color }}>
                                {msg.sender_name[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className={`text-sm font-semibold truncate ${!msg.read ? 'text-brand-text' : 'text-brand-muted'}`}>{msg.sender_name}</span>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                    <span className="text-[10px] text-brand-faint">{timeAgo(msg.created_at)}</span>
                                  </div>
                                </div>
                                <p className={`text-xs leading-relaxed ${isOpen ? 'text-brand-muted whitespace-pre-wrap break-words' : 'text-brand-faint truncate'}`}>{msg.message}</p>
                              </div>
                            </div>
                          </button>
                        )
                      }

                      if (item.kind === 'nfc_order') {
                        const order = item.o as NFCOrder
                        const isOpen = selectedMsgId === order.id
                        const addr = order.address as { name?: string; line1?: string; city?: string } | null
                        return (
                          <button key={item.id} onClick={() => setSelectedMsgId(isOpen ? null : order.id)}
                            className="w-full text-left rounded-xl overflow-hidden border transition-colors"
                            style={{ borderColor: '#252018', backgroundColor: '#141210' }}>
                            <div className="px-4 py-3.5">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-brand-gold/10">
                                  <Wifi className="w-3.5 h-3.5 text-brand-gold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-brand-text">NFC Card Order</span>
                                    <span className="text-[10px] text-brand-faint flex-shrink-0">{timeAgo(order.created_at)}</span>
                                  </div>
                                  <p className="text-xs text-brand-faint mb-0.5">
                                    {order.quantity} card{order.quantity > 1 ? 's' : ''}
                                    {order.name_on_card ? ` · ${order.name_on_card}` : ''}
                                  </p>
                                  <StatusStepper steps={NFC_STEPS} status={order.status} />
                                </div>
                              </div>
                              {isOpen && (
                                <div className="mt-3 pt-3 border-t border-brand-border ml-11">
                                  {addr && (
                                    <p className="text-[11px] text-brand-faint mb-2 leading-relaxed">
                                      {[addr.name, addr.line1, addr.city].filter(Boolean).join(', ')}
                                    </p>
                                  )}
                                  {order.status === 'placed' && (
                                    cancelConfirmId === order.id ? (
                                      <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-brand-muted">Cancel this order?</span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); cancelNFCOrder(order.id) }}
                                          className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors"
                                        >Yes, cancel</button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setCancelConfirmId(null) }}
                                          className="text-[11px] text-brand-faint hover:text-brand-muted transition-colors"
                                        >Keep it</button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setCancelConfirmId(order.id) }}
                                        className="flex items-center gap-1.5 text-[11px] text-brand-faint hover:text-red-400 transition-colors"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Cancel order
                                      </button>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      }

                      if (item.kind === 'visiting_order') {
                        const order = item.o as VisitingCardOrder
                        const isOpen = selectedMsgId === order.id
                        const addr = order.address as { name?: string; line1?: string; city?: string } | null
                        return (
                          <button key={item.id} onClick={() => setSelectedMsgId(isOpen ? null : order.id)}
                            className="w-full text-left rounded-xl overflow-hidden border transition-colors"
                            style={{ borderColor: '#252018', backgroundColor: '#141210' }}>
                            <div className="px-4 py-3.5">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-indigo-900/30">
                                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-brand-text">Visiting Card Order</span>
                                    <span className="text-[10px] text-brand-faint flex-shrink-0">{timeAgo(order.created_at)}</span>
                                  </div>
                                  <p className="text-xs text-brand-faint mb-0.5">
                                    {order.quantity} cards · {order.finish} · {order.template}
                                  </p>
                                  <StatusStepper steps={VC_STEPS} status={order.status} />
                                </div>
                              </div>
                              {isOpen && (
                                <div className="mt-3 pt-3 border-t border-brand-border ml-11">
                                  {addr && (
                                    <p className="text-[11px] text-brand-faint mb-2 leading-relaxed">
                                      {[addr.name, addr.line1, addr.city].filter(Boolean).join(', ')}
                                    </p>
                                  )}
                                  {order.status === 'placed' && (
                                    cancelConfirmId === order.id ? (
                                      <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-brand-muted">Cancel this order?</span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); cancelVisitingOrder(order.id) }}
                                          className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors"
                                        >Yes, cancel</button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setCancelConfirmId(null) }}
                                          className="text-[11px] text-brand-faint hover:text-brand-muted transition-colors"
                                        >Keep it</button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setCancelConfirmId(order.id) }}
                                        className="flex items-center gap-1.5 text-[11px] text-brand-faint hover:text-red-400 transition-colors"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Cancel order
                                      </button>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      }

                      if (item.kind === 'order') {
                        const msg = item.m as OrderMessage
                        const isOpen = selectedMsgId === msg.id
                        const label = msg.order_type === 'nfc' ? 'NFC Card Update' : msg.order_type === 'visiting_card' ? 'Visiting Card Update' : 'Support Reply'
                        return (
                          <button key={item.id}
                            onClick={() => { setSelectedMsgId(isOpen ? null : msg.id); if (!isOpen && !msg.read) markOrderMsgRead(msg.id) }}
                            className="w-full text-left rounded-xl overflow-hidden border transition-colors"
                            style={{ borderColor: !msg.read ? 'rgba(99,102,241,0.4)' : '#252018', backgroundColor: !msg.read ? 'rgba(99,102,241,0.06)' : '#141210' }}>
                            <div className="flex items-start gap-3 px-4 py-3.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-indigo-900/40">
                                <Package className="w-3.5 h-3.5 text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className={`text-sm font-semibold truncate ${!msg.read ? 'text-brand-text' : 'text-brand-muted'}`}>Tap · {label}</span>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                    <span className="text-[10px] text-brand-faint">{timeAgo(msg.created_at)}</span>
                                  </div>
                                </div>
                                <p className={`text-xs leading-relaxed ${isOpen ? 'text-brand-muted whitespace-pre-wrap break-words' : 'text-brand-faint truncate'}`}>{msg.message}</p>
                                {msg.order_id && <p className="text-[10px] text-brand-faint/60 mt-1">Order #{msg.order_id.slice(0, 8)}</p>}
                              </div>
                            </div>
                          </button>
                        )
                      }

                      // sent (from_admin = false — user's own support messages)
                      const msg = item.m as OrderMessage
                      return (
                        <div key={item.id} className="rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-3.5 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 bg-brand-border text-brand-muted">
                            {tapUser.username[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-brand-muted">You · Sent to Support</span>
                              <span className="text-[10px] text-brand-faint">{timeAgo(msg.created_at)}</span>
                            </div>
                            <p className="text-xs text-brand-faint leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

      </div>

      {/* ── Floating Contact Support button (messages tab) ── */}
      {activeTab === 'messages' && (
        <button
          onClick={() => setSupportModalOpen(true)}
          className="fixed bottom-20 right-4 z-30 flex items-center gap-2 text-sm font-bold px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
          style={{
            backgroundColor: page?.accent_color || '#C9963A',
            color: '#0F0E0C',
            boxShadow: `0 4px 18px ${(page?.accent_color || '#C9963A')}55, 0 2px 6px rgba(0,0,0,0.25)`,
          }}
        >
          <MessageSquare className="w-4 h-4" />
          Contact Support
        </button>
      )}

      {/* ── Mobile preview button ── */}
      {activeTab === 'build' && (
        <button
          onClick={() => setPreviewOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 bg-brand-gold text-brand-dark text-xs font-bold px-4 py-2.5 rounded-full shadow-lg hover:bg-brand-gold-light transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      )}

      {/* ── Mobile preview modal ── */}
      {previewOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="flex-1 bg-black/70 backdrop-blur-sm" />
          <div
            className="bg-brand-surface rounded-t-3xl border-t border-brand-border px-4 pt-4 pb-8 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-brand-border rounded-full mb-5" />
            <div className="flex items-center justify-between w-full mb-5">
              <p className="text-[10px] font-semibold text-brand-faint uppercase tracking-[0.18em]">Preview</p>
              <button onClick={() => setPreviewOpen(false)} className="text-brand-faint hover:text-brand-text transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <div className="w-[240px] h-[500px] rounded-[32px] border-[6px] border-brand-border overflow-hidden shadow-2xl bg-white">
                <div style={{ width: '375px', height: '780px', transform: 'scale(0.64)', transformOrigin: 'top left', overflowY: 'hidden' }}>
                  <ThemeComponent page={page} links={links} isPreview userTypes={userTypes} />
                </div>
              </div>
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-brand-border rounded-full" />
            </div>
            {page.published && (
              <a
                href={`/${tapUser.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-[10px] text-brand-faint hover:text-brand-muted transition-colors"
              >
                {pageUrl} ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Contact Support modal ── */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setSupportModalOpen(false)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div className="relative z-10 bg-brand-surface border-t border-brand-border rounded-t-3xl px-5 pt-5 pb-10 max-w-lg w-full mx-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-brand-border rounded-full mx-auto mb-5" />
            {supportSent ? (
              <div className="text-center py-6">
                <Check className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-brand-text mb-1">Message sent!</p>
                <p className="text-xs text-brand-faint">We'll get back to you soon.</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-brand-text mb-1">Contact Support</p>
                <p className="text-xs text-brand-faint mb-4">Questions about your order, account, or anything else.</p>
                <textarea
                  value={supportText}
                  onChange={e => setSupportText(e.target.value)}
                  placeholder="Describe your issue or question…"
                  rows={4}
                  maxLength={1000}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-faint focus:border-brand-muted focus:outline-none resize-none mb-3"
                />
                <button
                  onClick={sendSupportMessage}
                  disabled={supportSending || !supportText.trim()}
                  className="w-full bg-brand-gold text-brand-dark text-sm font-bold py-3 rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {supportSending && <span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />}
                  Send message
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-brand-surface/95 backdrop-blur-sm border-t border-brand-border safe-bottom">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id
            const badge = id === 'messages' ? unreadCount : 0
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                  active ? 'text-brand-gold' : 'text-brand-faint hover:text-brand-muted'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-gold rounded-b-full" />
                )}
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium tracking-wide">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
