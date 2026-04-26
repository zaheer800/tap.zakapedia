import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { trackPageView } from '../utils/trackEvent'
import { Editorial } from '../components/themes/Editorial'
import { Minimal } from '../components/themes/Minimal'
import { Expressive } from '../components/themes/Expressive'
import type { Page, Link } from '../types'

export function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (username) loadProfile(username)
  }, [username])

  async function loadProfile(uname: string) {
    // Look up the user by username
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

    // Fetch the published page
    const { data: pageData } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', tapUser.id)
      .eq('published', true)
      .maybeSingle()

    if (!pageData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', pageData.id)
      .order('position')

    setPage(pageData as Page)
    setLinks((linksData ?? []) as Link[])
    setLoading(false)

    // Track page view (fire-and-forget)
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
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          {username
            ? `@${username} hasn't published a page yet, or the username doesn't exist.`
            : "This page doesn't exist."}
        </p>
        <a
          href="/"
          className="text-sm font-medium text-gray-900 underline hover:no-underline"
        >
          Create your own page free →
        </a>
      </div>
    )
  }

  const ThemeComponent =
    page.theme === 'editorial' ? Editorial : page.theme === 'expressive' ? Expressive : Minimal

  return <ThemeComponent page={page} links={links} />
}
