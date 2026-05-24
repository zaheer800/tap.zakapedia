import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { trackPageView } from '../utils/trackEvent'
import { ProductCatalog } from '../components/portfolio/ProductCatalog'
import type { Page, Section, Link } from '../types'

function hasStructuredProducts(sections: Section[]): boolean {
  const s = sections.find(sec => sec.type === 'products')
  if (!s) return false
  try {
    const raw = s.content.items
    const items = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(items) && items.length > 0
  } catch {
    return false
  }
}

export function PortfolioPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (username && slug) loadPortfolio(username, slug)
  }, [username, slug])

  async function loadPortfolio(uname: string, pageSlug: string) {
    const { data: tapUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', uname.toLowerCase())
      .maybeSingle()

    if (!tapUser) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const { data: pageData } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', tapUser.id)
      .eq('portfolio_slug', pageSlug)
      .maybeSingle()

    if (!pageData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const [{ data: sectionData }, { data: linkData }] = await Promise.all([
      supabase.from('sections').select('*').eq('page_id', pageData.id).order('position'),
      supabase.from('links').select('*').eq('page_id', pageData.id).order('position'),
    ])

    setPage(pageData as Page)
    setSections((sectionData ?? []) as Section[])
    setLinks((linkData ?? []) as Link[])
    setLoading(false)
    trackPageView(pageData.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <FileX className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          This page hasn't been published yet, or the link is incorrect.
        </p>
        {username && (
          <a
            href={`/${username}`}
            className="text-sm font-medium text-gray-900 underline hover:no-underline"
          >
            ← View {username}'s profile
          </a>
        )}
      </div>
    )
  }

  // Live product catalog takes priority over AI-generated HTML
  if (hasStructuredProducts(sections)) {
    return <ProductCatalog page={page} sections={sections} links={links} />
  }

  if (!page.portfolio_html) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <FileX className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Portfolio not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          This portfolio hasn't been published yet, or the link is incorrect.
        </p>
        {username && (
          <a
            href={`/${username}`}
            className="text-sm font-medium text-gray-900 underline hover:no-underline"
          >
            ← View {username}'s profile
          </a>
        )}
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      srcDoc={page.portfolio_html}
      title={`${username}'s portfolio`}
      className="w-full border-none"
      style={{ height: '100vh', display: 'block' }}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    />
  )
}
