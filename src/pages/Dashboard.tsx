import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Share2, LogOut, Globe, GlobeLock, BarChart2,
  CreditCard, Smartphone, ChevronDown, Camera,
} from 'lucide-react'
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
import { Textarea } from '../components/ui/Input'
import type { Page, Link, Theme } from '../types'

type Tab = 'build' | 'analytics' | 'nfc' | 'cards'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'build', label: 'Build', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'nfc', label: 'NFC Card', icon: <Globe className="w-4 h-4" /> },
  { id: 'cards', label: 'Visiting Cards', icon: <CreditCard className="w-4 h-4" /> },
]

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect to onboarding if username not set
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
      const lr = await supabase
        .from('links')
        .select('*')
        .eq('page_id', pageRes.data.id)
        .order('position')
      setLinks((lr.data ?? []) as Link[])
    }
    setLoading(false)
  }

  // Debounced autosave for page fields
  const debouncedPage = useDebounce(page, 1500)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    if (!debouncedPage) return
    savePage(debouncedPage)
  }, [debouncedPage])

  async function savePage(p: Page) {
    setSaving(true)
    await supabase
      .from('pages')
      .update({ name: p.name, bio: p.bio, theme: p.theme, accent_color: p.accent_color })
      .eq('id', p.id)
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
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    await supabase.storage.from('tap-avatars').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('tap-avatars').getPublicUrl(path)
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`
    await supabase.from('pages').update({ avatar_url: avatarUrl }).eq('id', page.id)
    setPage((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev)
    setAvatarUploading(false)
  }

  async function addLink() {
    if (!page) return
    const position = links.length
    const { data } = await supabase
      .from('links')
      .insert({ page_id: page.id, title: 'New link', url: 'https://', icon: '🔗', position })
      .select()
      .single()
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
    await Promise.all(
      reordered.map((l) => supabase.from('links').update({ position: l.position }).eq('id', l.id)),
    )
  }

  function shareWhatsApp() {
    if (!tapUser) return
    const url = `https://tap.zakapedia.in/${tapUser.username}`
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my page: ${url}`)}`, '_blank')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  if (loading || !page || !tapUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  const ThemeComponent = page.theme === 'editorial' ? Editorial : page.theme === 'expressive' ? Expressive : Minimal

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-gray-900">Tap</span>
          <span className="text-xs text-gray-400 hidden sm:block">tap.zakapedia.in/{tapUser.username}</span>
        </div>

        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-gray-400 hidden sm:block">Saving…</span>}

          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Share</span>
          </button>

          <button
            onClick={togglePublish}
            className={`
              flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors
              ${page.published
                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                : 'bg-gray-900 text-white hover:bg-gray-700'}
            `}
          >
            {page.published ? (
              <><Globe className="w-3.5 h-3.5" /><span className="hidden sm:block">Published</span></>
            ) : (
              <><GlobeLock className="w-3.5 h-3.5" /><span className="hidden sm:block">Publish</span></>
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                {tapUser.username[0].toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                <p className="px-3 py-2 text-xs text-gray-400">@{tapUser.username}</p>
                <hr className="border-gray-100 my-1" />
                <a
                  href={`/${tapUser.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Globe className="w-4 h-4" />
                  View my page
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden" onClick={() => menuOpen && setMenuOpen(false)}>
        {activeTab === 'build' && (
          <div className="flex h-full">
            {/* Editor panel */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-xl">
              <div className="flex flex-col gap-6">
                {/* Profile */}
                <section>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Profile</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      {page.avatar_url ? (
                        <img
                          src={page.avatar_url}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-400 border-2 border-gray-100">
                          {(page.name || tapUser.username)[0].toUpperCase()}
                        </div>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {avatarUploading ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-3 h-3" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Profile photo</p>
                      <p className="text-xs text-gray-400 mt-0.5">JPG or PNG · Max 5 MB</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">Name</label>
                      <input
                        value={page.name}
                        onChange={(e) => updatePage({ name: e.target.value })}
                        placeholder="Your name or brand"
                        maxLength={60}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <Textarea
                      label="Bio"
                      value={page.bio}
                      onChange={(e) => updatePage({ bio: e.target.value })}
                      placeholder="One line about you or your brand"
                      rows={2}
                      maxLength={160}
                    />
                  </div>
                </section>

                {/* Theme */}
                <section>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Theme</h2>
                  <ThemeSelector
                    theme={page.theme}
                    accentColor={page.accent_color}
                    onThemeChange={(t: Theme) => updatePage({ theme: t })}
                    onAccentChange={(c: string) => updatePage({ accent_color: c })}
                  />
                </section>

                {/* Links */}
                <section>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Links</h2>
                  <LinkList
                    links={links}
                    onAdd={addLink}
                    onUpdate={updateLink}
                    onDelete={deleteLink}
                    onReorder={reorderLinks}
                  />
                </section>
              </div>
            </div>

            {/* Preview panel */}
            <div className="hidden lg:flex flex-shrink-0 w-80 xl:w-96 items-start justify-center p-8 bg-gray-100 border-l border-gray-200 overflow-y-auto">
              <div className="sticky top-8">
                <p className="text-xs font-medium text-gray-400 text-center mb-4 uppercase tracking-wider">Preview</p>
                {/* Phone mockup */}
                <div className="relative">
                  <div className="w-[240px] h-[500px] rounded-[32px] border-[6px] border-gray-900 overflow-hidden shadow-2xl bg-white">
                    <div
                      style={{
                        width: '375px',
                        height: '780px',
                        transform: 'scale(0.64)',
                        transformOrigin: 'top left',
                        overflowY: 'hidden',
                      }}
                    >
                      <ThemeComponent page={page} links={links} isPreview />
                    </div>
                  </div>
                  {/* Notch */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-gray-900 rounded-full" />
                </div>

                {page.published && (
                  <a
                    href={`/${tapUser.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    tap.zakapedia.in/{tapUser.username} ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-4 sm:p-6 max-w-2xl">
            {page.published ? (
              <AnalyticsDashboard page={page} links={links} />
            ) : (
              <div className="text-center py-16">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Publish your page to see analytics</h3>
                <p className="text-sm text-gray-500 mb-5">Analytics track page views and link clicks once your page is live.</p>
                <button
                  onClick={togglePublish}
                  className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Publish now
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nfc' && (
          <div className="p-4 sm:p-6 max-w-xl">
            <NFCOrderForm page={page} tapUser={tapUser} />
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="p-4 sm:p-6 max-w-xl">
            <VisitingCardOrderForm page={page} tapUser={tapUser} />
          </div>
        )}
      </div>
    </div>
  )
}
