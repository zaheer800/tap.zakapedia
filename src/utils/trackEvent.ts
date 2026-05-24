import { supabase } from '../lib/supabase'

function detectSource(): string {
  const ref = new URLSearchParams(window.location.search).get('ref')
  if (ref === 'nfc') return 'nfc'
  if (ref === 'whatsapp') return 'whatsapp'

  const r = document.referrer.toLowerCase()
  if (r.includes('instagram.com') || r.includes('l.instagram.com')) return 'instagram'
  if (r.includes('t.co') || r.includes('twitter.com') || r.includes('x.com')) return 'twitter'
  if (r.includes('linkedin.com')) return 'linkedin'
  if (r !== '') return 'web'
  return 'direct'
}

async function detectCountry(): Promise<string | null> {
  const cached = sessionStorage.getItem('tap_country')
  if (cached !== null) return cached || null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) throw new Error()
    const data = await res.json()
    const country = (data.country_name as string) ?? ''
    sessionStorage.setItem('tap_country', country)
    return country || null
  } catch {
    sessionStorage.setItem('tap_country', '')
    return null
  }
}

export async function trackPageView(pageId: string) {
  const [source, country] = await Promise.all([detectSource(), detectCountry()])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await supabase.from('page_views').insert({ page_id: pageId, source, country } as any)
}

export async function trackLinkClick(linkId: string, pageId: string) {
  await supabase.from('link_clicks').insert({
    link_id: linkId,
    page_id: pageId,
    source: detectSource(),
  })
}
