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

export async function trackPageView(pageId: string) {
  await supabase.from('page_views').insert({ page_id: pageId, source: detectSource() })
}

export async function trackLinkClick(linkId: string, pageId: string) {
  await supabase.from('link_clicks').insert({
    link_id: linkId,
    page_id: pageId,
    source: detectSource(),
  })
}
