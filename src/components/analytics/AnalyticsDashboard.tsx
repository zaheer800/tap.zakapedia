import { useEffect, useState } from 'react'
import { TrendingUp, MousePointerClick, Eye, Wifi } from 'lucide-react'
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

// Smooth bezier path through points (cardinal spline)
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

function Sparkline({ data, range }: { data: number[]; range: number }) {
  const W = 400
  const H = 80
  const PAD_B = 22
  const PAD_T = 8
  const chartH = H - PAD_B - PAD_T
  const max = Math.max(...data, 1)

  const pts = data.map((v, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: PAD_T + chartH - (v / max) * chartH,
  }))

  const line = smoothPath(pts)
  const area = line
    ? `${line} L ${W},${PAD_T + chartH} L 0,${PAD_T + chartH} Z`
    : ''

  // X-axis labels
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

  // Grid lines at 25%, 50%, 75%
  const gridYs = [0.25, 0.5, 0.75].map(f => PAD_T + chartH * (1 - f))

  const peakIdx = data.indexOf(max)
  const peak = pts[peakIdx]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9963A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#C9963A" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridYs.map((y, i) => (
        <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#252018" strokeWidth={1} />
      ))}

      {/* Area fill */}
      {area && <path d={area} fill="url(#goldGrad)" />}

      {/* Line */}
      {line && (
        <path
          d={line}
          fill="none"
          stroke="#C9963A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Data dots (7d only) */}
      {range === 7 && pts.map((p, i) => (
        data[i] > 0 ? (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C9963A" />
        ) : null
      ))}

      {/* Peak label */}
      {max > 1 && peak && (
        <>
          <circle cx={peak.x} cy={peak.y} r="4" fill="#C9963A" />
          <text
            x={Math.min(Math.max(peak.x, 18), W - 18)}
            y={peak.y - 8}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#C9963A"
            fontFamily="DM Sans, sans-serif"
          >
            {max}
          </text>
        </>
      )}

      {/* X-axis labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={H - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#4A4540"
          fontFamily="DM Sans, sans-serif"
        >
          {l.text}
        </text>
      ))}
    </svg>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div
      className="rounded-xl border p-3.5 flex flex-col gap-2"
      style={{ backgroundColor: '#141210', borderColor: '#252018' }}
    >
      <div className="flex items-center gap-1.5" style={{ color: accent ? '#C9963A' : '#4A4540' }}>
        {icon}
        <span
          className="text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{ color: accent ? '#C9963A' : '#4A4540' }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-xl font-bold leading-none"
        style={{ color: accent ? '#C9963A' : '#F2EDE4' }}
      >
        {value}
      </p>
    </div>
  )
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

    const buckets = Array(range).fill(0) as number[]
    recentViews.forEach(({ timestamp }) => {
      const daysAgo = Math.floor(
        (Date.now() - new Date(timestamp).getTime()) / 86400000,
      )
      const idx = range - 1 - Math.min(daysAgo, range - 1)
      buckets[idx]++
    })

    const clickMap: Record<string, number> = {}
    allClicks.forEach(({ link_id }) => {
      clickMap[link_id] = (clickMap[link_id] ?? 0) + 1
    })
    const linkStats = links
      .map((l) => ({ link_id: l.id, title: l.title, clicks: clickMap[l.id] ?? 0 }))
      .sort((a, b) => b.clicks - a.clicks)

    const sourceMap: Record<string, number> = {}
    recentViews.forEach(({ source }) => {
      sourceMap[source] = (sourceMap[source] ?? 0) + 1
    })
    const sources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    setStats({ totalViews, totalClicks: allClicks.length, weekViews: buckets, linkStats, sources })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div
          className="w-5 h-5 rounded-full animate-spin"
          style={{ border: '2px solid #252018', borderTopColor: '#C9963A' }}
        />
      </div>
    )
  }

  if (!stats) return null

  const ctr =
    stats.totalViews > 0
      ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1)
      : '0.0'

  const maxLinkClicks = Math.max(...stats.linkStats.map((l) => l.clicks), 1)
  const periodTotal = stats.weekViews.reduce((s, v) => s + v, 0)
  const sourceTotal = stats.sources.reduce((s, x) => s + x.count, 0)

  return (
    <div className="flex flex-col gap-3 pb-4">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<Eye className="w-3 h-3" />} label="Views" value={stats.totalViews} />
        <StatCard icon={<MousePointerClick className="w-3 h-3" />} label="Clicks" value={stats.totalClicks} />
        <StatCard icon={<TrendingUp className="w-3 h-3" />} label="CTR" value={`${ctr}%`} accent />
      </div>

      {/* Sparkline card */}
      <div className="rounded-xl border" style={{ backgroundColor: '#141210', borderColor: '#252018' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <div>
            <p className="text-xs font-semibold" style={{ color: '#F2EDE4' }}>Page views</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#4A4540' }}>
              {periodTotal} visit{periodTotal !== 1 ? 's' : ''} in the last {range} days
            </p>
          </div>
          {/* Range toggle */}
          <div
            className="flex items-center rounded-lg p-0.5"
            style={{ backgroundColor: '#0C0A08', border: '1px solid #252018' }}
          >
            {([7, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                style={
                  range === r
                    ? { backgroundColor: '#C9963A', color: '#0C0A08' }
                    : { color: '#4A4540' }
                }
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
        <div className="px-3 pb-2">
          <Sparkline data={stats.weekViews} range={range} />
        </div>
      </div>

      {/* Link performance */}
      <div className="rounded-xl border" style={{ backgroundColor: '#141210', borderColor: '#252018' }}>
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs font-semibold mb-3.5" style={{ color: '#F2EDE4' }}>Link performance</p>
          {stats.linkStats.length === 0 ? (
            <p className="text-xs" style={{ color: '#4A4540' }}>No links yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.linkStats.map((l, i) => {
                const pct = (l.clicks / maxLinkClicks) * 100
                return (
                  <div key={l.link_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[9px] font-black w-3.5 flex-shrink-0"
                          style={{ color: i === 0 ? '#C9963A' : '#4A4540' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-xs truncate" style={{ color: '#8A7F74' }}>
                          {l.title}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold ml-2 flex-shrink-0"
                        style={{ color: l.clicks > 0 ? '#F2EDE4' : '#4A4540' }}
                      >
                        {l.clicks}
                      </span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#252018' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: i === 0 ? '#C9963A' : '#3A3028',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Traffic sources */}
      {stats.sources.length > 0 && (
        <div className="rounded-xl border" style={{ backgroundColor: '#141210', borderColor: '#252018' }}>
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs font-semibold mb-3.5" style={{ color: '#F2EDE4' }}>Traffic sources</p>
            <div className="flex flex-col gap-3">
              {stats.sources.map(({ source, count }) => {
                const pct = sourceTotal > 0 ? Math.round((count / sourceTotal) * 100) : 0
                const isNfc = source === 'nfc'
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isNfc
                          ? <Wifi className="w-3 h-3 flex-shrink-0" style={{ color: '#C9963A' }} />
                          : <span className="w-3 h-3 flex-shrink-0" />
                        }
                        <span className="text-xs" style={{ color: isNfc ? '#C9963A' : '#8A7F74' }}>
                          {SOURCE_LABELS[source] ?? source}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px]" style={{ color: '#4A4540' }}>{pct}%</span>
                        <span className="text-xs font-bold w-5 text-right" style={{ color: '#F2EDE4' }}>
                          {count}
                        </span>
                      </div>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#252018' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isNfc ? '#C9963A' : '#3A3028',
                        }}
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
