import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Copy, Check, LogOut, Wifi, CreditCard, RefreshCw,
  Phone, ArrowRight, ExternalLink, Users, Globe,
  Eye, MousePointerClick, TrendingUp, MessageSquare,
  Package, Settings, X, Search,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { NFCOrder, VisitingCardOrder, OrderStatus, PrintingStatus, ShippingAddress } from '../types'

const ADMIN_EMAIL = 'zaheer800@gmail.com'

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'orders' | 'inbox'
type OrdersTab = 'nfc' | 'cards'

type AdminNFCOrder = NFCOrder & {
  users: { username: string }
  pages: { name: string; theme: string; accent_color: string }
}

type AdminCardOrder = VisitingCardOrder & {
  users: { username: string }
  pages: { name: string; bio: string; theme: string; accent_color: string }
}

interface DayActivity {
  label: string     // Mon, Tue…
  date: string      // YYYY-MM-DD
  views: number
  clicks: number
}

interface TopProfile {
  username: string
  name: string
  views: number
}

interface SourceStat {
  source: string
  label: string
  count: number
  pct: number
}

interface UserRow {
  id: string
  username: string
  email: string
  created_at: string
  hasPublishedPage: boolean
}

interface PageRow {
  id: string
  name: string
  username: string
  theme: string
  published: boolean
  views30: number
}

interface AdminData {
  totalUsers: number
  newUsersLast7: number
  totalPages: number
  publishedPages: number
  totalViews: number
  viewsLast7: number
  totalClicks: number
  clicksLast7: number
  dailyActivity: DayActivity[]
  trafficSources: SourceStat[]
  topProfiles: TopProfile[]
  nfcOrders: AdminNFCOrder[]
  cardOrders: AdminCardOrder[]
  pendingNfc: number
  pendingCards: number
  userMessages: { id: string; user_id: string; message: string; order_type: string; order_id: string | null; read: boolean; created_at: string; users?: { username: string } }[]
  unreadUserMessages: number
  allUsers: UserRow[]
  allPages: PageRow[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const NFC_FLOW: OrderStatus[]    = ['placed', 'printing', 'shipped', 'delivered']
const CARD_FLOW: PrintingStatus[] = ['placed', 'printing', 'shipped', 'delivered']

const STATUS_CHIP: Record<string, string> = {
  placed:    'bg-amber-900/30 text-amber-400 border border-amber-800/50',
  printing:  'bg-blue-900/30 text-blue-400 border border-blue-800/50',
  shipped:   'bg-purple-900/30 text-purple-400 border border-purple-800/50',
  delivered: 'bg-green-900/30 text-green-400 border border-green-800/50',
  cancelled: 'bg-red-900/30 text-red-400 border border-red-800/50',
}

const SOURCE_LABELS: Record<string, string> = {
  nfc: 'NFC Tap', instagram: 'Instagram', whatsapp: 'WhatsApp',
  twitter: 'Twitter / X', linkedin: 'LinkedIn', direct: 'Direct', web: 'Web',
}

const SOURCE_COLORS: Record<string, string> = {
  nfc: '#C9963A', whatsapp: '#25D366', instagram: '#E1306C',
  twitter: '#1DA1F2', linkedin: '#0A66C2', direct: '#8B8B98', web: '#6366F1',
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ─── Small shared components ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-brand-faint uppercase tracking-[0.14em] mb-2.5">{children}</p>
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 mb-1.5">
      <span className="text-[10px] text-brand-faint w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs text-brand-muted flex-1 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function AddressBlock({ addr }: { addr: ShippingAddress }) {
  return (
    <div className="bg-brand-dark rounded-xl px-4 py-3 text-xs text-brand-muted space-y-0.5">
      <p className="font-semibold text-brand-text">{addr.name}</p>
      <p>{addr.line1}</p>
      {addr.line2 && <p>{addr.line2}</p>}
      <p>{addr.city}, {addr.state} — {addr.pincode}</p>
      <p className="text-brand-faint pt-0.5 flex items-center gap-1">
        <Phone className="w-3 h-3 flex-shrink-0" />{addr.phone}
      </p>
    </div>
  )
}

function CopyBox({ text, id, copiedId, onCopy }: {
  text: string; id: string; copiedId: string | null
  onCopy: (t: string, i: string) => void
}) {
  return (
    <div className="flex items-center gap-2 bg-brand-dark rounded-lg px-3 py-2 mt-1.5">
      <span className="text-xs font-mono text-brand-gold flex-1 truncate">{text}</span>
      <button onClick={() => onCopy(text, id)} className="text-brand-faint hover:text-brand-text transition-colors flex-shrink-0">
        {copiedId === id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

// ─── Overview components ─────────────────────────────────────────────────────

function StatCard({ icon, label, primary, secondary, accent = false, active = false, onClick }: {
  icon: React.ReactNode; label: string
  primary: string | number; secondary?: string
  accent?: boolean; active?: boolean; onClick?: () => void
}) {
  const isHighlighted = accent || active
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 flex flex-col gap-2 text-left w-full transition-all ${
        active
          ? 'border-brand-gold/50 shadow-[0_0_0_1px_rgba(201,150,58,0.15)]'
          : isHighlighted
          ? 'border-brand-gold/30 bg-brand-gold/[0.06] hover:border-brand-gold/50'
          : 'border-brand-border bg-brand-surface hover:border-brand-faint/30'
      }`}
      style={active ? { backgroundColor: 'rgba(201,150,58,0.08)' } : undefined}
    >
      <div className={`flex items-center gap-2 ${isHighlighted || active ? 'text-brand-gold' : 'text-brand-faint'}`}>
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${isHighlighted || active ? 'text-brand-gold' : 'text-brand-text'}`}>
        {fmt(Number(primary))}
      </p>
      {secondary && <p className="text-[11px] text-brand-faint">{secondary}</p>}
    </button>
  )
}

function ActivityChart({ data, activeMetric }: { data: DayActivity[]; activeMetric: 'views' | 'clicks' | 'all' }) {
  const max = Math.max(...data.map(d => Math.max(d.views, d.clicks)), 1)

  const viewsActive  = activeMetric === 'all' || activeMetric === 'views'
  const clicksActive = activeMetric === 'all' || activeMetric === 'clicks'

  return (
    <div>
      <div className="flex items-end gap-1.5 h-24 mb-2">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex items-end gap-0.5">
            <div className="flex-1 flex flex-col justify-end">
              <div
                className="rounded-t-sm w-full transition-all duration-500"
                style={{
                  height: `${Math.max((d.views / max) * 88, 2)}px`,
                  backgroundColor: viewsActive ? '#C9963A' : 'rgba(201,150,58,0.15)',
                }}
                title={`${d.views} views`}
              />
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div
                className="rounded-t-sm w-full transition-all duration-500"
                style={{
                  height: `${Math.max((d.clicks / max) * 88, 2)}px`,
                  backgroundColor: clicksActive ? '#6366F1' : 'rgba(99,102,241,0.15)',
                }}
                title={`${d.clicks} clicks`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {data.map((d) => (
          <div key={d.date} className="flex-1 text-center">
            <span className="text-[9px] text-brand-faint">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: viewsActive ? '#C9963A' : 'rgba(201,150,58,0.3)' }} />
          <span className="text-[10px]" style={{ color: viewsActive ? '#C9963A' : '#4A4540' }}>Views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: clicksActive ? '#6366F1' : 'rgba(99,102,241,0.3)' }} />
          <span className="text-[10px]" style={{ color: clicksActive ? '#6366F1' : '#4A4540' }}>Clicks</span>
        </div>
      </div>
    </div>
  )
}

function SourceBar({ source, label, count, pct }: SourceStat) {
  const color = SOURCE_COLORS[source] ?? '#8B8B98'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-brand-muted w-24 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] text-brand-faint w-8 text-right tabular-nums">{pct}%</span>
      <span className="text-[11px] text-brand-faint w-8 text-right tabular-nums">{fmt(count)}</span>
    </div>
  )
}

// ─── NFC Order card ───────────────────────────────────────────────────────────

function NfcCard({ order, copiedId, onCopy, onAdvance }: {
  order: AdminNFCOrder; copiedId: string | null
  onCopy: (t: string, i: string) => void; onAdvance: () => void
}) {
  const url = `https://tap.zakapedia.in/${order.users?.username}`
  const nextStatus = order.status === 'cancelled' ? undefined : NFC_FLOW[NFC_FLOW.indexOf(order.status) + 1]
  return (
    <div className="bg-brand-surface">
      <div className="px-5 py-3 border-b border-brand-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${STATUS_CHIP[order.status]}`}>{order.status}</span>
          <span className="text-[11px] font-mono text-brand-faint">#{order.id.slice(0, 8)}</span>
          <span className="text-xs font-bold text-brand-text">@{order.users?.username}</span>
          <span className="text-[11px] text-brand-faint">· {order.quantity} card{order.quantity > 1 ? 's' : ''}</span>
        </div>
        <span className="text-[10px] text-brand-faint">{formatDate(order.created_at)}</span>
      </div>
      <div className="px-5 py-4 grid sm:grid-cols-2 gap-6">
        <div>
          <SectionLabel>What to program</SectionLabel>
          <div className="mb-3">
            <p className="text-[10px] text-brand-faint">URL to write (NFC Tools app)</p>
            <CopyBox text={url} id={`nfc-url-${order.id}`} copiedId={copiedId} onCopy={onCopy} />
          </div>
          <Row label="Name on card" value={order.name_on_card} />
          <Row label="Quantity" value={`${order.quantity} card${order.quantity > 1 ? 's' : ''}`} />
          {order.payment_reference && <Row label="Payment ref" value={order.payment_reference} mono />}
        </div>
        <div>
          <SectionLabel>Ship to</SectionLabel>
          <AddressBlock addr={order.address} />
        </div>
      </div>
      {nextStatus && (
        <div className="px-5 pb-4 flex items-center gap-3">
          <button onClick={onAdvance} className="flex items-center gap-2 bg-brand-gold text-brand-dark text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-brand-gold-light transition-colors">
            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-brand-faint">{NFC_FLOW.indexOf(order.status) + 1} / {NFC_FLOW.length}</span>
        </div>
      )}
    </div>
  )
}

// ─── Visiting card order card ─────────────────────────────────────────────────

function CardCard({ order, copiedId, onCopy, onAdvance }: {
  order: AdminCardOrder; copiedId: string | null
  onCopy: (t: string, i: string) => void; onAdvance: () => void
}) {
  const url = `https://tap.zakapedia.in/${order.users?.username}`
  const nextStatus = order.status === 'cancelled' ? undefined : CARD_FLOW[CARD_FLOW.indexOf(order.status) + 1]
  return (
    <div className="bg-brand-surface">
      <div className="px-5 py-3 border-b border-brand-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${STATUS_CHIP[order.status]}`}>{order.status}</span>
          <span className="text-[11px] font-mono text-brand-faint">#{order.id.slice(0, 8)}</span>
          <span className="text-xs font-bold text-brand-text">@{order.users?.username}</span>
          <span className="text-[11px] text-brand-faint">· {order.quantity} cards · {order.finish}</span>
        </div>
        <span className="text-[10px] text-brand-faint">{formatDate(order.created_at)}</span>
      </div>
      <div className="px-5 py-4 grid sm:grid-cols-2 gap-6">
        <div>
          <SectionLabel>Send to print vendor</SectionLabel>
          <Row label="Template" value={order.template.charAt(0).toUpperCase() + order.template.slice(1)} />
          <Row label="Finish" value={order.finish.charAt(0).toUpperCase() + order.finish.slice(1)} />
          <Row label="Quantity" value={`${order.quantity} cards`} />
          <div className="mt-3 pt-3 border-t border-brand-border">
            <p className="text-[10px] text-brand-faint mb-2">Customer profile data</p>
            <Row label="Name" value={order.pages?.name || '—'} />
            {order.pages?.bio && (
              <div className="flex items-start gap-2 mb-1.5">
                <span className="text-[10px] text-brand-faint w-24 flex-shrink-0 pt-0.5">Bio</span>
                <span className="text-xs text-brand-muted flex-1 leading-relaxed">{order.pages.bio}</span>
              </div>
            )}
            <Row label="Theme" value={order.pages?.theme ? order.pages.theme.charAt(0).toUpperCase() + order.pages.theme.slice(1) : '—'} />
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-brand-faint w-24 flex-shrink-0">Accent</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border border-brand-border" style={{ backgroundColor: order.pages?.accent_color }} />
                <span className="text-xs font-mono text-brand-muted">{order.pages?.accent_color}</span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-brand-faint">Profile URL (for QR code)</p>
              <CopyBox text={url} id={`card-url-${order.id}`} copiedId={copiedId} onCopy={onCopy} />
            </div>
          </div>
          {order.template === 'upload' && order.design_file_url && (
            <div className="mt-3 pt-3 border-t border-brand-border">
              <p className="text-[10px] text-brand-faint mb-1">Custom design file</p>
              <a href={order.design_file_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-brand-gold hover:text-brand-gold-light flex items-center gap-1">
                Download file <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {order.payment_reference && <div className="mt-3"><Row label="Payment ref" value={order.payment_reference} mono /></div>}
        </div>
        <div>
          <SectionLabel>Ship to</SectionLabel>
          <AddressBlock addr={order.address} />
        </div>
      </div>
      {nextStatus && (
        <div className="px-5 pb-4 flex items-center gap-3">
          <button onClick={onAdvance} className="flex items-center gap-2 bg-brand-gold text-brand-dark text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-brand-gold-light transition-colors">
            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-brand-faint">{CARD_FLOW.indexOf(order.status) + 1} / {CARD_FLOW.length}</span>
        </div>
      )}
    </div>
  )
}

// ─── Update panel (shared by NFC + card order cards) ─────────────────────────

function UpdatePanel({ phone, draft, sending, sent, onDraftChange, onSend, onWhatsApp }: {
  phone: string
  draft: string; sending: boolean; sent: boolean
  onDraftChange: (v: string) => void
  onSend: () => void
  onWhatsApp: () => void
}) {
  return (
    <div className="px-5 pb-4 pt-2 border-t border-brand-border">
      <p className="text-[10px] font-bold text-brand-faint uppercase tracking-[0.14em] mb-2">Send update to customer</p>
      <textarea
        value={draft}
        onChange={e => onDraftChange(e.target.value)}
        placeholder="Your NFC card is ready and will be dispatched today…"
        rows={2}
        maxLength={500}
        className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text placeholder:text-brand-faint focus:border-brand-muted focus:outline-none resize-none mb-2.5"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onSend}
          disabled={sending || !draft.trim() || sent}
          className="flex items-center gap-1.5 bg-brand-gold text-brand-dark text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-50"
        >
          {sent ? <Check className="w-3.5 h-3.5" /> : sending ? <span className="w-3.5 h-3.5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
          {sent ? 'Sent!' : 'Send to inbox'}
        </button>
        <button
          onClick={onWhatsApp}
          className="flex items-center gap-1.5 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors"
        >
          {/* WhatsApp icon */}
          <svg width="14" height="14" viewBox="0 0 24 24">
            <rect width="24" height="24" rx="5" fill="#25D366"/>
            <path fill="white" d="M12 5a7 7 0 0 0-5.9 10.7L5 19l3.4-1.1A7 7 0 1 0 12 5zm0 12.5a5.5 5.5 0 0 1-2.8-.8l-.2-.1-2 .6.6-1.9-.1-.2A5.5 5.5 0 1 1 12 17.5zm3-4.1c-.2-.1-.9-.4-1-.5-.2 0-.3-.1-.4.1l-.6.7c-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-1-.6-.5-1-1.1-1-1.3s0-.2.1-.3l.3-.4c.1-.1.1-.2.2-.3v-.3c0-.1-.4-1-.5-1.3-.1-.3-.3-.2-.4-.2h-.4c-.1 0-.3.1-.5.3-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.1 1.2 1.9 3 2.6.4.2.8.3 1 .3.4 0 .8-.2 1-.5.3-.3.3-.7.2-.8z"/>
          </svg>
          WhatsApp
        </button>
        <span className="text-[10px] text-brand-faint ml-auto truncate">{phone}</span>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-20 text-brand-faint">
      <div className="flex justify-center mb-3 opacity-40">{icon}</div>
      <p className="text-sm text-brand-muted">{text}</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminOrders() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [ordersTab, setOrdersTab] = useState<OrdersTab>('nfc')
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState<'views' | 'clicks' | 'all'>('all')
  const [activePanel, setActivePanel] = useState<'users' | 'pages' | null>(null)
  const [panelSearch, setPanelSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [updateDrafts, setUpdateDrafts] = useState<Record<string, string>>({})
  const [sendingUpdate, setSendingUpdate] = useState<string | null>(null)
  const [sentUpdate, setSentUpdate] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [sendingReply, setSendingReply] = useState<string | null>(null)
  const [sentReply, setSentReply] = useState<string | null>(null)
  const [expandedReply, setExpandedReply] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!authLoading && user?.email === ADMIN_EMAIL) loadAll()
  }, [authLoading, user])

  async function loadAll() {
    setLoading(true)
    try {
    const now = Date.now()
    const ms7  = 7  * 24 * 60 * 60 * 1000
    const ms30 = 30 * 24 * 60 * 60 * 1000
    const ago30 = new Date(now - ms30).toISOString()

    const [
      usersRes, pagesRes,
      totalViewsRes, totalClicksRes,
      views30Res, clicks30Res,
      nfcRes, cardRes, userMsgRes,
    ] = await Promise.all([
      supabase.schema('public').rpc('admin_get_users_with_email'),
      supabase.from('pages').select('id, published, user_id, name, theme, users(username)'),
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase.from('link_clicks').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('page_id, timestamp, source').gte('timestamp', ago30),
      supabase.from('link_clicks').select('page_id, timestamp').gte('timestamp', ago30),
      supabase.from('nfc_orders').select('*, users(username), pages(name, theme, accent_color)').order('created_at', { ascending: false }),
      supabase.from('visiting_card_orders').select('*, users(username), pages(name, bio, theme, accent_color)').order('created_at', { ascending: false }),
      supabase.from('order_messages').select('id, user_id, message, order_type, order_id, read, created_at, users(username)').eq('from_admin', false).order('created_at', { ascending: false }).limit(50),
    ])

    const users    = (usersRes.data ?? []) as any[]
    const pages    = pagesRes.data ?? []
    const views30  = views30Res.data ?? []
    const clicks30 = clicks30Res.data ?? []

    // ── 7-day activity ─────────────────────────────────────────────────────────
    const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const dailyActivity: DayActivity[] = Array.from({ length: 7 }, (_, i) => {
      const d    = new Date(now - (6 - i) * 86400000)
      const date = d.toISOString().slice(0, 10)
      return {
        date,
        label: DAY_LABELS[d.getDay()],
        views:  views30.filter(v => v.timestamp.startsWith(date)).length,
        clicks: clicks30.filter(c => c.timestamp.startsWith(date)).length,
      }
    })

    // ── Traffic sources (last 30 days) ─────────────────────────────────────────
    const srcMap: Record<string, number> = {}
    views30.forEach(v => { srcMap[v.source] = (srcMap[v.source] ?? 0) + 1 })
    const totalSrc = Object.values(srcMap).reduce((a, b) => a + b, 0)
    const trafficSources: SourceStat[] = Object.entries(srcMap)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({
        source,
        label: SOURCE_LABELS[source] ?? source,
        count,
        pct: totalSrc > 0 ? Math.round((count / totalSrc) * 100) : 0,
      }))

    // ── Top profiles (last 30 days) ────────────────────────────────────────────
    const pvMap: Record<string, number> = {}
    views30.forEach(v => { pvMap[v.page_id] = (pvMap[v.page_id] ?? 0) + 1 })
    const pageById = Object.fromEntries(
      pages.map(p => [p.id, { name: p.name, username: (p.users as any)?.username ?? '' }])
    )
    const topProfiles: TopProfile[] = Object.entries(pvMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, views]) => ({
        username: pageById[id]?.username ?? id.slice(0, 8),
        name:     pageById[id]?.name ?? '—',
        views,
      }))

    const nfcOrders   = (nfcRes.data ?? []) as AdminNFCOrder[]
    const cardOrders  = (cardRes.data ?? []) as AdminCardOrder[]
    const userMessages = (userMsgRes.data ?? []) as any[]

    // All users enriched with published-page flag
    const publishedByUserId = new Set(pages.filter(p => p.published).map(p => p.user_id))
    const allUsers: UserRow[] = (users as any[])
      .map(u => ({
        id: u.id,
        username: u.username ?? '',
        email: u.email ?? '',
        created_at: u.created_at,
        hasPublishedPage: publishedByUserId.has(u.id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // All pages enriched with 30-day view count
    const allPages: PageRow[] = (pages as any[])
      .map(p => ({
        id: p.id,
        name: p.name ?? '',
        username: (p.users as any)?.username ?? '',
        theme: p.theme ?? '',
        published: p.published,
        views30: pvMap[p.id] ?? 0,
      }))
      .sort((a, b) => b.views30 - a.views30)

    setData({
      totalUsers:    users.length,
      newUsersLast7: users.filter(u => new Date(u.created_at).getTime() > now - ms7).length,
      totalPages:    pages.length,
      publishedPages: pages.filter(p => p.published).length,
      totalViews:    totalViewsRes.count ?? 0,
      viewsLast7:    views30.filter(v => new Date(v.timestamp).getTime() > now - ms7).length,
      totalClicks:   totalClicksRes.count ?? 0,
      clicksLast7:   clicks30.filter(c => new Date(c.timestamp).getTime() > now - ms7).length,
      dailyActivity,
      trafficSources,
      topProfiles,
      nfcOrders,
      cardOrders,
      pendingNfc:    nfcOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
      pendingCards:  cardOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
      userMessages,
      unreadUserMessages: userMessages.filter((m: any) => !m.read).length,
      allUsers,
      allPages,
    })
    } catch (e) {
      console.error('Admin loadAll error:', e)
    } finally {
      setLoading(false)
    }
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function advanceNfc(order: AdminNFCOrder) {
    const i = NFC_FLOW.indexOf(order.status)
    if (i >= NFC_FLOW.length - 1) return
    const next = NFC_FLOW[i + 1]
    setData(d => d ? { ...d, nfcOrders: d.nfcOrders.map(o => o.id === order.id ? { ...o, status: next } : o) } : d)
    await supabase.from('nfc_orders').update({ status: next }).eq('id', order.id)
  }

  async function advanceCard(order: AdminCardOrder) {
    const i = CARD_FLOW.indexOf(order.status)
    if (i >= CARD_FLOW.length - 1) return
    const next = CARD_FLOW[i + 1]
    setData(d => d ? { ...d, cardOrders: d.cardOrders.map(o => o.id === order.id ? { ...o, status: next } : o) } : d)
    await supabase.from('visiting_card_orders').update({ status: next }).eq('id', order.id)
  }

  async function sendOrderUpdate(orderId: string, userId: string, orderType: 'nfc' | 'visiting_card') {
    const message = updateDrafts[orderId]?.trim()
    if (!message) return
    setSendingUpdate(orderId)
    await supabase.from('order_messages').insert({
      user_id: userId, order_id: orderId, order_type: orderType,
      message, from_admin: true, read: false,
    })
    setSendingUpdate(null)
    setSentUpdate(orderId)
    setUpdateDrafts(d => ({ ...d, [orderId]: '' }))
    setTimeout(() => setSentUpdate(null), 2500)
  }

  function openWhatsApp(phone: string, name: string, orderId: string, orderType: string, message: string) {
    const digits = phone.replace(/\D/g, '')
    const wa = digits.length === 10 ? `91${digits}` : digits
    const label = orderType === 'nfc' ? 'NFC Card' : 'Visiting Card'
    const text = `Hi ${name}, regarding your Tap ${label} order #${orderId.slice(0, 8)}: ${message}\n\n— Tap by Zakapedia`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function sendInboxReply(msg: { id: string; user_id: string; order_type: string; order_id: string | null }) {
    const message = replyDrafts[msg.id]?.trim()
    if (!message) return
    setSendingReply(msg.id)
    await supabase.from('order_messages').insert({
      user_id: msg.user_id, order_id: msg.order_id, order_type: msg.order_type,
      message, from_admin: true, read: false,
    })
    await supabase.from('order_messages').update({ read: true }).eq('id', msg.id)
    setData(d => d ? {
      ...d,
      userMessages: d.userMessages.map(m => m.id === msg.id ? { ...m, read: true } : m),
      unreadUserMessages: Math.max(0, d.unreadUserMessages - 1),
    } : d)
    setSendingReply(null)
    setSentReply(msg.id)
    setReplyDrafts(d => ({ ...d, [msg.id]: '' }))
    setTimeout(() => setSentReply(null), 2500)
  }

  if (authLoading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-brand-border border-t-brand-gold rounded-full animate-spin" />
    </div>
  )

  if (user?.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />

  const pendingOrders = (data?.pendingNfc ?? 0) + (data?.pendingCards ?? 0)
  const maxProfileViews = Math.max(...(data?.topProfiles.map(p => p.views) ?? [1]), 1)

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text font-sans">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-border px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Settings className="w-4 h-4 text-brand-gold" />
          <div>
            <h1 className="text-sm font-bold text-brand-text leading-none">Admin Dashboard</h1>
            <p className="text-[10px] text-brand-faint mt-0.5">Tap by Zakapedia</p>
          </div>
        </div>
        <button onClick={loadAll} disabled={loading}
          className="flex items-center gap-1.5 text-[11px] text-brand-faint hover:text-brand-muted transition-colors disabled:opacity-40">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          onClick={async () => { await signOut(); navigate('/login') }}
          className="flex items-center gap-1.5 text-[11px] text-brand-faint hover:text-red-400 transition-colors ml-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </header>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className="border-b border-brand-border px-4 sm:px-6">
        <div className="flex max-w-4xl">
          {([
            { id: 'overview' as const, label: 'Overview',       Icon: TrendingUp,     badge: 0 },
            { id: 'orders'   as const, label: 'Orders',         Icon: Package,        badge: pendingOrders },
            { id: 'inbox'    as const, label: 'Inbox',          Icon: MessageSquare,  badge: data?.unreadUserMessages ?? 0 },
          ]).map(({ id, label, Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                tab === id ? 'border-brand-gold text-brand-gold' : 'border-transparent text-brand-faint hover:text-brand-muted'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === id ? 'bg-brand-gold/15 text-brand-gold' : 'bg-brand-border text-brand-faint'
                }`}>{badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-5 max-w-4xl">

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-brand-border border-t-brand-gold rounded-full animate-spin" />
          </div>
        ) : !data ? null : (

          <>
            {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
            {tab === 'overview' && (
              <div className="flex flex-col gap-5">

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    icon={<Users className="w-4 h-4" />}
                    label="Total users"
                    primary={data.totalUsers}
                    secondary={`+${data.newUsersLast7} this week`}
                    active={activePanel === 'users'}
                    onClick={() => { setActivePanel(p => p === 'users' ? null : 'users'); setPanelSearch('') }}
                  />
                  <StatCard
                    icon={<Globe className="w-4 h-4" />}
                    label="Live pages"
                    primary={data.publishedPages}
                    secondary={`${data.totalPages} total`}
                    active={activePanel === 'pages'}
                    onClick={() => { setActivePanel(p => p === 'pages' ? null : 'pages'); setPanelSearch('') }}
                  />
                  <StatCard
                    icon={<Eye className="w-4 h-4" />}
                    label="Page views"
                    primary={data.totalViews}
                    secondary={`${fmt(data.viewsLast7)} this week`}
                    accent
                    active={activeMetric === 'views'}
                    onClick={() => setActiveMetric(m => m === 'views' ? 'all' : 'views')}
                  />
                  <StatCard
                    icon={<MousePointerClick className="w-4 h-4" />}
                    label="Link clicks"
                    primary={data.totalClicks}
                    secondary={`${fmt(data.clicksLast7)} this week`}
                    accent
                    active={activeMetric === 'clicks'}
                    onClick={() => setActiveMetric(m => m === 'clicks' ? 'all' : 'clicks')}
                  />
                </div>

                {/* ── Users panel ── */}
                {activePanel === 'users' && (() => {
                  const q = panelSearch.toLowerCase()
                  const filtered = data.allUsers.filter(u =>
                    !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
                  )
                  return (
                    <div className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-brand-border flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-brand-text">All users ({data.allUsers.length})</p>
                        <button onClick={() => setActivePanel(null)} className="text-brand-faint hover:text-brand-text transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="px-5 py-3 border-b border-brand-border">
                        <div className="flex items-center gap-2 bg-brand-dark rounded-xl px-3 py-2">
                          <Search className="w-3.5 h-3.5 text-brand-faint flex-shrink-0" />
                          <input
                            value={panelSearch}
                            onChange={e => setPanelSearch(e.target.value)}
                            placeholder="Search by username or email…"
                            className="flex-1 bg-transparent text-xs text-brand-text placeholder:text-brand-faint focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-[420px] overflow-y-auto divide-y divide-brand-border scrollbar-thin">
                        {filtered.length === 0 ? (
                          <p className="text-xs text-brand-faint px-5 py-6 text-center">No users match "{panelSearch}"</p>
                        ) : filtered.map((u, i) => (
                          <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-brand-border/20 transition-colors">
                            <span className="text-[10px] text-brand-faint w-5 text-right flex-shrink-0 tabular-nums">{i + 1}</span>
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{ backgroundColor: u.hasPublishedPage ? 'rgba(201,150,58,0.15)' : '#1E1A12', color: u.hasPublishedPage ? '#C9963A' : '#4A4540' }}
                            >
                              {(u.username || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-brand-text truncate">@{u.username || '—'}</span>
                                {u.hasPublishedPage && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-800/30 flex-shrink-0">Live</span>
                                )}
                              </div>
                              <p className="text-[10px] text-brand-faint truncate">{u.email}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] text-brand-faint">{timeAgo(u.created_at)}</p>
                            </div>
                            {u.username && (
                              <a
                                href={`/${u.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-faint hover:text-brand-gold transition-colors flex-shrink-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* ── Pages panel ── */}
                {activePanel === 'pages' && (() => {
                  const q = panelSearch.toLowerCase()
                  const filtered = data.allPages.filter(p =>
                    !q || p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
                  )
                  const THEME_COLORS: Record<string, string> = {
                    editorial: '#F59E0B', minimal: '#6366F1', expressive: '#EC4899',
                  }
                  return (
                    <div className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-brand-border flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-brand-text">
                          All pages — {data.publishedPages} live · {data.totalPages - data.publishedPages} draft
                        </p>
                        <button onClick={() => setActivePanel(null)} className="text-brand-faint hover:text-brand-text transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="px-5 py-3 border-b border-brand-border">
                        <div className="flex items-center gap-2 bg-brand-dark rounded-xl px-3 py-2">
                          <Search className="w-3.5 h-3.5 text-brand-faint flex-shrink-0" />
                          <input
                            value={panelSearch}
                            onChange={e => setPanelSearch(e.target.value)}
                            placeholder="Search by name or username…"
                            className="flex-1 bg-transparent text-xs text-brand-text placeholder:text-brand-faint focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-[420px] overflow-y-auto divide-y divide-brand-border scrollbar-thin">
                        {filtered.length === 0 ? (
                          <p className="text-xs text-brand-faint px-5 py-6 text-center">No pages match "{panelSearch}"</p>
                        ) : filtered.map((p, i) => (
                          <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-brand-border/20 transition-colors">
                            <span className="text-[10px] text-brand-faint w-5 text-right flex-shrink-0 tabular-nums">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-xs font-semibold text-brand-text truncate">{p.name || '—'}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 border ${
                                  p.published
                                    ? 'bg-green-900/30 text-green-400 border-green-800/30'
                                    : 'bg-brand-border/50 text-brand-faint border-brand-border'
                                }`}>
                                  {p.published ? 'Live' : 'Draft'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-brand-faint">@{p.username}</span>
                                {p.theme && (
                                  <span
                                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: (THEME_COLORS[p.theme] ?? '#8A7F74') + '22',
                                      color: THEME_COLORS[p.theme] ?? '#8A7F74',
                                    }}
                                  >
                                    {p.theme}
                                  </span>
                                )}
                              </div>
                            </div>
                            {p.views30 > 0 && (
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-semibold text-brand-muted tabular-nums">{fmt(p.views30)}</p>
                                <p className="text-[9px] text-brand-faint">views/30d</p>
                              </div>
                            )}
                            {p.username && (
                              <a
                                href={`/${p.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-faint hover:text-brand-gold transition-colors flex-shrink-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Activity chart + traffic sources */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold text-brand-text">Activity — last 7 days</p>
                      {activeMetric !== 'all' && (
                        <button
                          onClick={() => setActiveMetric('all')}
                          className="text-[10px] text-brand-faint hover:text-brand-muted transition-colors"
                        >
                          Show all
                        </button>
                      )}
                    </div>
                    <ActivityChart data={data.dailyActivity} activeMetric={activeMetric} />
                  </div>
                  <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
                    <p className="text-xs font-semibold text-brand-text mb-4">Traffic sources — last 30 days</p>
                    {data.trafficSources.length === 0 ? (
                      <p className="text-xs text-brand-faint">No traffic data yet.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {data.trafficSources.map(s => <SourceBar key={s.source} {...s} />)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top profiles */}
                {data.topProfiles.length > 0 && (
                  <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
                    <p className="text-xs font-semibold text-brand-text mb-4">Top profiles — last 30 days</p>
                    <div className="flex flex-col gap-3">
                      {data.topProfiles.map((p, i) => (
                        <div key={p.username} className="flex items-center gap-3">
                          <span className="text-[10px] text-brand-faint w-4 text-right flex-shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-brand-text">@{p.username}</span>
                                {p.name && <span className="text-[10px] text-brand-faint ml-1.5 truncate">{p.name}</span>}
                              </div>
                              <span className="text-[11px] font-semibold text-brand-muted flex-shrink-0 tabular-nums">{fmt(p.views)}</span>
                            </div>
                            <div className="h-1 bg-brand-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-gold/60 rounded-full transition-all duration-500"
                                style={{ width: `${(p.views / maxProfileViews) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-brand-faint flex-shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-brand-text tabular-nums">{data.pendingNfc}</p>
                      <p className="text-[10px] text-brand-faint">NFC orders pending</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-brand-faint flex-shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-brand-text tabular-nums">{data.pendingCards}</p>
                      <p className="text-[10px] text-brand-faint">Card orders pending</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-brand-faint flex-shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-brand-text tabular-nums">{data.unreadUserMessages}</p>
                      <p className="text-[10px] text-brand-faint">Unread messages</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ORDERS ───────────────────────────────────────────────────── */}
            {tab === 'orders' && (
              <div>
                {/* Sub-tabs */}
                <div className="flex gap-2 mb-5">
                  {([
                    { id: 'nfc' as const,   label: 'NFC Cards',     count: data.pendingNfc   },
                    { id: 'cards' as const, label: 'Visiting Cards', count: data.pendingCards },
                  ]).map(({ id, label, count }) => (
                    <button key={id} onClick={() => setOrdersTab(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                        ordersTab === id
                          ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold'
                          : 'border-brand-border text-brand-faint hover:text-brand-muted'
                      }`}>
                      {label}
                      {count > 0 && <span className="text-[10px]">{count} pending</span>}
                    </button>
                  ))}
                </div>

                {ordersTab === 'nfc' ? (
                  data.nfcOrders.length === 0 ? <Empty icon={<Wifi className="w-8 h-8" />} text="No NFC card orders yet" /> : (
                    <div className="flex flex-col gap-4">
                      {data.nfcOrders.map(o => (
                        <div key={o.id} className="rounded-2xl border border-brand-border overflow-hidden">
                          <NfcCard order={o} copiedId={copiedId} onCopy={copy} onAdvance={() => advanceNfc(o)} />
                          <UpdatePanel
                            phone={o.address.phone}
                            draft={updateDrafts[o.id] ?? ''} sending={sendingUpdate === o.id} sent={sentUpdate === o.id}
                            onDraftChange={v => setUpdateDrafts(d => ({ ...d, [o.id]: v }))}
                            onSend={() => sendOrderUpdate(o.id, o.user_id, 'nfc')}
                            onWhatsApp={() => openWhatsApp(o.address.phone, o.address.name, o.id, 'nfc', updateDrafts[o.id] ?? '')}
                          />
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  data.cardOrders.length === 0 ? <Empty icon={<CreditCard className="w-8 h-8" />} text="No visiting card orders yet" /> : (
                    <div className="flex flex-col gap-4">
                      {data.cardOrders.map(o => (
                        <div key={o.id} className="rounded-2xl border border-brand-border overflow-hidden">
                          <CardCard order={o} copiedId={copiedId} onCopy={copy} onAdvance={() => advanceCard(o)} />
                          <UpdatePanel
                            phone={o.address.phone}
                            draft={updateDrafts[o.id] ?? ''} sending={sendingUpdate === o.id} sent={sentUpdate === o.id}
                            onDraftChange={v => setUpdateDrafts(d => ({ ...d, [o.id]: v }))}
                            onSend={() => sendOrderUpdate(o.id, o.user_id, 'visiting_card')}
                            onWhatsApp={() => openWhatsApp(o.address.phone, o.address.name, o.id, 'visiting_card', updateDrafts[o.id] ?? '')}
                          />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {/* ── INBOX ────────────────────────────────────────────────────── */}
            {tab === 'inbox' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold text-brand-text">
                    Support requests
                    {data.unreadUserMessages > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                        {data.unreadUserMessages}
                      </span>
                    )}
                  </p>
                </div>

                {data.userMessages.length === 0 ? (
                  <Empty icon={<MessageSquare className="w-8 h-8" />} text="No support requests yet" />
                ) : (
                  <div className="flex flex-col gap-2">
                      {data.userMessages.map((msg: any) => (
                        <div key={msg.id}
                          className="rounded-xl border p-4"
                          style={{ borderColor: !msg.read ? 'rgba(99,102,241,0.4)' : '#252018', backgroundColor: !msg.read ? 'rgba(99,102,241,0.05)' : '#141210' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 bg-indigo-900/40 text-indigo-400">
                              {msg.users?.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${!msg.read ? 'text-brand-text' : 'text-brand-muted'}`}>
                                    @{msg.users?.username ?? '—'}
                                  </span>
                                  <span className="text-[10px] text-brand-faint capitalize">{msg.order_type}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                  <span className="text-[10px] text-brand-faint">{timeAgo(msg.created_at)}</span>
                                </div>
                              </div>
                              <p className="text-xs text-brand-faint leading-relaxed">{msg.message}</p>
                              {msg.order_id && <p className="text-[10px] text-brand-faint/50 mt-1">Order #{msg.order_id.slice(0, 8)}</p>}

                              {/* Reply panel */}
                              <div className="mt-3 pt-3 border-t border-brand-border/50">
                                {expandedReply[msg.id] ? (
                                  <div>
                                    <textarea
                                      value={replyDrafts[msg.id] ?? ''}
                                      onChange={e => setReplyDrafts(d => ({ ...d, [msg.id]: e.target.value }))}
                                      placeholder="Type your reply…"
                                      rows={2}
                                      maxLength={500}
                                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text placeholder:text-brand-faint focus:border-brand-muted focus:outline-none resize-none mb-2"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => sendInboxReply(msg)}
                                        disabled={sendingReply === msg.id || !replyDrafts[msg.id]?.trim() || sentReply === msg.id}
                                        className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
                                      >
                                        {sentReply === msg.id
                                          ? <Check className="w-3.5 h-3.5" />
                                          : sendingReply === msg.id
                                          ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          : <ArrowRight className="w-3.5 h-3.5" />}
                                        {sentReply === msg.id ? 'Sent!' : 'Send Reply'}
                                      </button>
                                      <button
                                        onClick={() => setExpandedReply(d => ({ ...d, [msg.id]: false }))}
                                        className="text-xs text-brand-faint hover:text-brand-muted transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setExpandedReply(d => ({ ...d, [msg.id]: true }))}
                                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Reply
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
