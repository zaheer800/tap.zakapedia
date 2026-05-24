import { useEffect, useState } from 'react'
import { TrendingUp, MousePointerClick, Eye, Wifi, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Page, Link } from '../../types'

interface Props {
  page: Page
  links: Link[]
}

interface Stats {
  totalViews: number
  periodViews: number
  prevPeriodViews: number
  periodClicks: number
  prevPeriodClicks: number
  viewsByDay: number[]
  clicksByDay: number[]
  linkStats: { link_id: string; title: string; url: string; clicks: number }[]
  sources: { source: string; count: number }[]
  countries: { country: string; count: number }[]
}

const PALETTE = ['#C9963A', '#6366F1', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6']

const SOURCE_LABELS: Record<string, string> = {
  nfc: 'NFC Tap',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  web: 'Web',
  direct: 'Direct',
}

const SOURCE_COLORS: Record<string, string> = {
  nfc: '#C9963A',
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  whatsapp: '#25D366',
  web: '#6366F1',
  direct: '#8A7F74',
}

// ── Smooth bezier path ────────────────────────────────────────────────────────

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  if (pts.length === 2)
    return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 5
    const cp1y = p1.y + (p2.y - p0.y) / 5
    const cp2x = p2.x - (p3.x - p1.x) / 5
    const cp2y = p2.y - (p3.y - p1.y) / 5
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

// ── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, range, color = '#C9963A' }: { data: number[]; range: number; color?: string }) {
  const W = 400
  const H = 90
  const PAD_B = 24
  const PAD_T = 10
  const chartH = H - PAD_B - PAD_T
  const max = Math.max(...data, 1)

  const pts = data.map((v, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: PAD_T + chartH - (v / max) * chartH,
  }))

  const line = smoothPath(pts)
  const area = line ? `${line} L ${W},${PAD_T + chartH} L 0,${PAD_T + chartH} Z` : ''

  const labels: { x: number; text: string }[] = []
  if (range === 7) {
    pts.forEach((p, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (range - 1 - i))
      labels.push({ x: p.x, text: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2) })
    })
  } else {
    pts.forEach((p, i) => {
      if (i === 0 || i % 7 === 0 || i === pts.length - 1) {
        const d = new Date()
        d.setDate(d.getDate() - (range - 1 - i))
        labels.push({ x: p.x, text: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) })
      }
    })
  }

  const gridYs = [0.25, 0.5, 0.75].map(f => PAD_T + chartH * (1 - f))
  const peakIdx = data.indexOf(max)
  const peak = pts[peakIdx]
  const gradId = `grad-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {gridYs.map((y, i) => (
        <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#252018" strokeWidth={1} />
      ))}
      {area && <path d={area} fill={`url(#${gradId})`} />}
      {line && (
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {range === 7 && pts.map((p, i) =>
        data[i] > 0 ? <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} /> : null
      )}
      {max > 1 && peak && (
        <>
          <circle cx={peak.x} cy={peak.y} r="5" fill={color} />
          <text x={Math.min(Math.max(peak.x, 18), W - 18)} y={peak.y - 10}
            textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="DM Sans, sans-serif">
            {max}
          </text>
        </>
      )}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#4A4540" fontFamily="DM Sans, sans-serif">
          {l.text}
        </text>
      ))}
    </svg>
  )
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function DonutChart({ data, colors }: { data: number[]; colors: string[] }) {
  const total = data.reduce((s, v) => s + v, 0)
  if (total === 0) return null

  const R = 35, CX = 50, CY = 50, GAP = 0.05
  let angle = -Math.PI / 2

  const segments = data.map((v, i) => {
    const sweep = Math.max((v / total) * (2 * Math.PI) - GAP, 0.01)
    const start = polarToCartesian(CX, CY, R, angle)
    const end = polarToCartesian(CX, CY, R, angle + sweep)
    const large = sweep > Math.PI ? 1 : 0
    const d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
    angle += sweep + GAP
    return { d, color: colors[i % colors.length] }
  })

  return (
    <svg viewBox="0 0 100 100" className="w-[72px] h-[72px] flex-shrink-0">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1E1A12" strokeWidth="14" />
      {segments.map((s, i) => (
        <path key={i} d={s.d} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="butt" />
      ))}
    </svg>
  )
}

// ── Delta indicator ───────────────────────────────────────────────────────────

function Delta({ curr, prev }: { curr: number; prev: number }) {
  if (prev === 0 && curr === 0) return <span className="text-[10px] text-brand-faint">—</span>
  if (prev === 0) return <span className="text-[10px] font-semibold text-green-400">New</span>
  const pct = ((curr - prev) / prev) * 100
  const up = pct >= 0
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, prev, curr, accent, active, onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  prev?: number
  curr?: number
  accent?: boolean
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3.5 flex flex-col gap-2 text-left w-full transition-all ${
        active
          ? 'border-brand-gold/50 shadow-[0_0_0_1px_rgba(201,150,58,0.2)]'
          : 'border-brand-border hover:border-brand-faint/30'
      }`}
      style={{ backgroundColor: active ? 'rgba(201,150,58,0.06)' : '#141210' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" style={{ color: accent || active ? '#C9963A' : '#4A4540' }}>
          {icon}
          <span className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: accent || active ? '#C9963A' : '#4A4540' }}>
            {label}
          </span>
        </div>
        {prev !== undefined && curr !== undefined && <Delta curr={curr} prev={prev} />}
      </div>
      <p className="text-xl font-bold leading-none" style={{ color: accent || active ? '#C9963A' : '#F2EDE4' }}>
        {value}
      </p>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard({ page, links }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<7 | 30>(7)
  const [activeMetric, setActiveMetric] = useState<'views' | 'clicks'>('views')

  useEffect(() => {
    loadStats()
  }, [page.id, range])

  async function loadStats() {
    setLoading(true)

    const since = new Date()
    since.setDate(since.getDate() - range)
    const prevSince = new Date()
    prevSince.setDate(prevSince.getDate() - range * 2)

    const [totalViewsRes, allClicksRes, recentViewsRes, prevViewsRes] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('page_id', page.id),
      supabase.from('link_clicks').select('link_id, timestamp').eq('page_id', page.id),
      supabase.from('page_views').select('timestamp, source').eq('page_id', page.id).gte('timestamp', since.toISOString()),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('page_id', page.id).gte('timestamp', prevSince.toISOString()).lt('timestamp', since.toISOString()),
    ])

    // Country query is separate — the column may not exist yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countryRes = await (supabase.from('page_views') as any)
      .select('country')
      .eq('page_id', page.id)
      .gte('timestamp', since.toISOString())

    const totalViews = totalViewsRes.count ?? 0
    const allClicks = (allClicksRes.data ?? []) as { link_id: string; timestamp: string }[]
    const recentViews = (recentViewsRes.data ?? []) as { timestamp: string; source: string }[]
    const prevPeriodViews = prevViewsRes.count ?? 0

    // Bucket views by day
    const viewsByDay = Array(range).fill(0) as number[]
    recentViews.forEach(({ timestamp }) => {
      const daysAgo = Math.floor((Date.now() - new Date(timestamp).getTime()) / 86400000)
      const idx = range - 1 - Math.min(daysAgo, range - 1)
      viewsByDay[idx]++
    })

    const sinceMs = since.getTime()
    const prevSinceMs = prevSince.getTime()

    // Period clicks (filter by date client-side)
    const periodClicksList = allClicks.filter(({ timestamp }) => new Date(timestamp).getTime() >= sinceMs)
    const prevClicksList = allClicks.filter(({ timestamp }) => {
      const t = new Date(timestamp).getTime()
      return t >= prevSinceMs && t < sinceMs
    })

    // Bucket clicks by day
    const clicksByDay = Array(range).fill(0) as number[]
    periodClicksList.forEach(({ timestamp }) => {
      const daysAgo = Math.floor((Date.now() - new Date(timestamp).getTime()) / 86400000)
      const idx = range - 1 - Math.min(daysAgo, range - 1)
      clicksByDay[idx]++
    })

    // Link stats (all-time clicks per link)
    const clickMap: Record<string, number> = {}
    allClicks.forEach(({ link_id }) => { clickMap[link_id] = (clickMap[link_id] ?? 0) + 1 })
    const linkStats = links
      .map(l => ({ link_id: l.id, title: l.title, url: l.url, clicks: clickMap[l.id] ?? 0 }))
      .sort((a, b) => b.clicks - a.clicks)

    // Traffic sources
    const sourceMap: Record<string, number> = {}
    recentViews.forEach(({ source }) => { sourceMap[source] = (sourceMap[source] ?? 0) + 1 })
    const sources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    // Countries (graceful — column may not exist yet)
    const countryMap: Record<string, number> = {}
    const countryRows = (!countryRes.error && Array.isArray(countryRes.data)) ? countryRes.data as { country?: string | null }[] : []
    countryRows.forEach(row => {
      if (row.country) countryMap[row.country] = (countryMap[row.country] ?? 0) + 1
    })
    const countries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    setStats({
      totalViews,
      periodViews: recentViews.length,
      prevPeriodViews,
      periodClicks: periodClicksList.length,
      prevPeriodClicks: prevClicksList.length,
      viewsByDay,
      clicksByDay,
      linkStats,
      sources,
      countries,
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid #252018', borderTopColor: '#C9963A' }} />
      </div>
    )
  }

  if (!stats) return null

  const ctr = stats.periodViews > 0 ? ((stats.periodClicks / stats.periodViews) * 100).toFixed(1) : '0.0'
  const prevCtr = stats.prevPeriodViews > 0 ? (stats.prevPeriodClicks / stats.prevPeriodViews) * 100 : 0
  const currCtrNum = stats.periodViews > 0 ? (stats.periodClicks / stats.periodViews) * 100 : 0

  const maxLinkClicks = Math.max(...stats.linkStats.map(l => l.clicks), 1)
  const sourceTotal = stats.sources.reduce((s, x) => s + x.count, 0)
  const countryTotal = stats.countries.reduce((s, x) => s + x.count, 0)

  const chartData = activeMetric === 'views' ? stats.viewsByDay : stats.clicksByDay
  const chartColor = activeMetric === 'clicks' ? '#6366F1' : '#C9963A'

  return (
    <div className="flex flex-col gap-3 pb-4">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<Eye className="w-3 h-3" />}
          label="Views"
          value={stats.totalViews.toLocaleString()}
          curr={stats.periodViews}
          prev={stats.prevPeriodViews}
          active={activeMetric === 'views'}
          onClick={() => setActiveMetric('views')}
        />
        <StatCard
          icon={<MousePointerClick className="w-3 h-3" />}
          label="Clicks"
          value={stats.periodClicks.toLocaleString()}
          curr={stats.periodClicks}
          prev={stats.prevPeriodClicks}
          active={activeMetric === 'clicks'}
          onClick={() => setActiveMetric('clicks')}
        />
        <StatCard
          icon={<TrendingUp className="w-3 h-3" />}
          label="Engagement"
          value={`${ctr}%`}
          curr={Math.round(currCtrNum * 10)}
          prev={Math.round(prevCtr * 10)}
          accent
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border" style={{ backgroundColor: '#141210', borderColor: '#252018' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <div>
            <p className="text-xs font-semibold" style={{ color: '#F2EDE4' }}>
              {activeMetric === 'views' ? 'Page views' : 'Link clicks'}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#4A4540' }}>
              {activeMetric === 'views'
                ? `${stats.periodViews} visit${stats.periodViews !== 1 ? 's' : ''} in the last ${range} days`
                : `${stats.periodClicks} click${stats.periodClicks !== 1 ? 's' : ''} in the last ${range} days`
              }
            </p>
          </div>
          <div className="flex items-center rounded-lg p-0.5" style={{ backgroundColor: '#0C0A08', border: '1px solid #252018' }}>
            {([7, 30] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                style={range === r ? { backgroundColor: '#C9963A', color: '#0C0A08' } : { color: '#4A4540' }}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
        <div className="px-3 pb-2">
          <Sparkline data={chartData} range={range} color={chartColor} />
        </div>
      </div>

      {/* Top Links + Top Countries side by side on wider screens */}
      <div className={`grid gap-3 ${stats.countries.length > 0 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>

        {/* Top Links */}
        <div className="rounded-xl border" style={{ backgroundColor: '#141210', borderColor: '#252018' }}>
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold mb-3.5" style={{ color: '#F2EDE4' }}>Top Links</p>
            {stats.linkStats.length === 0 ? (
              <p className="text-xs" style={{ color: '#4A4540' }}>No links yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.linkStats.map((l, i) => {
                  const pct = (l.clicks / maxLinkClicks) * 100
                  return (
                    <a
                      key={l.link_id}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[9px] font-black w-3.5 flex-shrink-0" style={{ color: i === 0 ? '#C9963A' : '#4A4540' }}>
                            {i + 1}
                          </span>
                          <span className="text-xs truncate group-hover:text-brand-gold transition-colors" style={{ color: '#8A7F74' }}>
                            {l.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#C9963A' }} />
                          <span className="text-xs font-bold" style={{ color: l.clicks > 0 ? '#F2EDE4' : '#4A4540' }}>
                            {l.clicks}
                          </span>
                        </div>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#252018' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: i === 0 ? '#C9963A' : '#3A3028' }}
                        />
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Countries */}
        {stats.countries.length > 0 && (
          <div className="rounded-xl border" style={{ backgroundColor: '#141210', borderColor: '#252018' }}>
            <div className="px-4 pt-4 pb-3">
              <p className="text-xs font-semibold mb-3" style={{ color: '#F2EDE4' }}>Top Countries</p>
              <div className="flex items-center gap-4">
                <DonutChart data={stats.countries.map(c => c.count)} colors={PALETTE} />
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {stats.countries.slice(0, 5).map((c, i) => {
                    const pct = countryTotal > 0 ? Math.round((c.count / countryTotal) * 100) : 0
                    return (
                      <div key={c.country} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                          <span className="text-[10px] truncate" style={{ color: '#8A7F74' }}>{c.country}</span>
                        </div>
                        <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: '#F2EDE4' }}>{pct}%</span>
                      </div>
                    )
                  })}
                  {stats.countries.length > 5 && (
                    <p className="text-[9px] mt-0.5" style={{ color: '#4A4540' }}>
                      +{stats.countries.length - 5} more countr{stats.countries.length - 5 === 1 ? 'y' : 'ies'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Traffic sources */}
      {stats.sources.length > 0 && (
        <div className="rounded-xl border" style={{ backgroundColor: '#141210', borderColor: '#252018' }}>
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold mb-3.5" style={{ color: '#F2EDE4' }}>Traffic Sources</p>
            <div className="flex flex-col gap-3">
              {stats.sources.map(({ source, count }) => {
                const pct = sourceTotal > 0 ? Math.round((count / sourceTotal) * 100) : 0
                const isNfc = source === 'nfc'
                const color = SOURCE_COLORS[source] ?? '#8A7F74'
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isNfc
                          ? <Wifi className="w-3 h-3 flex-shrink-0" style={{ color }} />
                          : <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        }
                        <span className="text-xs" style={{ color: isNfc ? '#C9963A' : '#8A7F74' }}>
                          {SOURCE_LABELS[source] ?? source}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px]" style={{ color: '#4A4540' }}>{pct}%</span>
                        <span className="text-xs font-bold w-5 text-right" style={{ color: '#F2EDE4' }}>{count}</span>
                      </div>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#252018' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
