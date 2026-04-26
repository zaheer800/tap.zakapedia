import { useEffect, useState } from 'react'
import { TrendingUp, MousePointerClick, Eye, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Page, Link } from '../../types'

interface Props {
  page: Page
  links: Link[]
}

interface Stats {
  totalViews: number
  totalClicks: number
  weekViews: number[]
  linkStats: { link_id: string; title: string; clicks: number }[]
  sources: { source: string; count: number }[]
}

const SOURCE_LABELS: Record<string, string> = {
  nfc: 'NFC Tap',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  web: 'Web',
  direct: 'Direct',
}

export function AnalyticsDashboard({ page, links }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<7 | 30>(7)

  useEffect(() => {
    loadStats()
  }, [page.id, range])

  async function loadStats() {
    setLoading(true)
    const since = new Date()
    since.setDate(since.getDate() - range)

    const [viewsRes, clicksRes, recentViewsRes] = await Promise.all([
      supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', page.id),
      supabase
        .from('link_clicks')
        .select('link_id, source')
        .eq('page_id', page.id),
      supabase
        .from('page_views')
        .select('timestamp, source')
        .eq('page_id', page.id)
        .gte('timestamp', since.toISOString()),
    ])

    const totalViews = viewsRes.count ?? 0
    const allClicks = clicksRes.data ?? []
    const recentViews = recentViewsRes.data ?? []

    // Daily sparkline
    const buckets = Array(range).fill(0) as number[]
    recentViews.forEach(({ timestamp }) => {
      const daysAgo = Math.floor(
        (Date.now() - new Date(timestamp).getTime()) / 86400000,
      )
      const idx = range - 1 - Math.min(daysAgo, range - 1)
      buckets[idx]++
    })

    // Per-link click counts
    const clickMap: Record<string, number> = {}
    allClicks.forEach(({ link_id }) => {
      clickMap[link_id] = (clickMap[link_id] ?? 0) + 1
    })
    const linkStats = links.map((l) => ({
      link_id: l.id,
      title: l.title,
      clicks: clickMap[l.id] ?? 0,
    })).sort((a, b) => b.clicks - a.clicks)

    // Traffic sources (from recent views)
    const sourceMap: Record<string, number> = {}
    recentViews.forEach(({ source }) => {
      sourceMap[source] = (sourceMap[source] ?? 0) + 1
    })
    const sources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    setStats({
      totalViews,
      totalClicks: allClicks.length,
      weekViews: buckets,
      linkStats,
      sources,
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  const ctr = stats.totalViews > 0
    ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1)
    : '0.0'

  const maxLinkClicks = Math.max(...stats.linkStats.map((l) => l.clicks), 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Top-line stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Eye className="w-4 h-4" />} label="Page views" value={stats.totalViews} />
        <StatCard icon={<MousePointerClick className="w-4 h-4" />} label="Link clicks" value={stats.totalClicks} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="CTR" value={`${ctr}%`} />
      </div>

      {/* Sparkline */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Page views</h3>
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
            {([7, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
        <Sparkline data={stats.weekViews} />
      </div>

      {/* Per-link breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Links performance</h3>
        {stats.linkStats.length === 0 ? (
          <p className="text-sm text-gray-400">No links yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.linkStats.map((l) => (
              <div key={l.link_id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 truncate max-w-[70%]">{l.title}</span>
                  <span className="text-sm font-semibold text-gray-900">{l.clicks}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-700"
                    style={{ width: `${(l.clicks / maxLinkClicks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Traffic sources */}
      {stats.sources.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Traffic sources</h3>
          <div className="flex flex-col gap-2">
            {stats.sources.map(({ source, count }) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {source === 'nfc' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                  <span className="text-sm text-gray-700">
                    {SOURCE_LABELS[source] ?? source}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Sparkline({ data }: { data: number[] }) {
  const w = 400
  const h = 60
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 8) - 4,
  }))

  const path = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
  const area = `${path} L ${w},${h} L 0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111827" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#111827" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
