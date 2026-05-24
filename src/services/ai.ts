// AI calls are proxied through the Supabase edge function `ai-generate`.
// The Google AI API key lives as a Supabase secret — never in the browser bundle.

export type ProfileType = 'creator' | 'professional' | 'business' | 'service_pro' | 'speaker'
export type Theme = 'editorial' | 'minimal' | 'expressive'

export interface Section {
  type: string
  content: Record<string, unknown>
}

export interface PortfolioInput {
  profileType: ProfileType
  theme: Theme
  name: string
  bio: string
  role?: string
  userRoles: string[]
  accentColor: string
  avatarUrl?: string
  profileUrl: string
  links: Array<{ title: string; url: string }>
  sections: Section[]
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  const res = await fetch(`${supabaseUrl}/functions/v1/ai-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    throw new Error(data.error ?? `AI request failed (${res.status})`)
  }

  return data.content ?? ''
}

// ── Portfolio generation ────────────────────────────────────────────────────

const PROFILE_TYPE_INSTRUCTIONS: Record<ProfileType, string> = {
  creator: `Tone: expressive, personal, warm. Layout priority: links and latest content above the fold. Feel: a fan landing page — this person has an audience and wants them to feel something. Emphasise personality over credentials.`,
  professional: `Tone: confident, credible, concise. Layout priority: services and skills above the fold. Feel: a one-page CV that closes deals — this person pitches clients via WhatsApp and needs instant trust. Every word earns its place.`,
  business: `Tone: friendly, direct, action-oriented. Layout priority: products/menu and WhatsApp order CTA above the fold. Feel: a mini storefront — visitors should be able to order in 2 taps. Warmth and clarity over polish.`,
  service_pro: `Tone: trustworthy, calm, credible. Layout priority: credentials and book-appointment CTA above the fold. Feel: a professional clinic profile — patients and clients need to trust before they contact. Qualifications matter here.`,
  speaker: `Tone: authoritative, inspiring, clear. Layout priority: talks and bio above the fold. Feel: a speaker bureau profile — event organisers need a quick read on topics, experience, and contact. Make them feel the room.`,
}

const THEME_TOKENS: Record<Theme, string> = {
  editorial: `Theme: Editorial. Dark background (#060608). Serif display font (Georgia or similar). Bold typographic hierarchy. Staggered section reveal. Accent line across the top. Magazine layout feel.`,
  minimal: `Theme: Minimal. Light background (#FAFAFA). Clean sans-serif (system-ui or similar). Generous whitespace. Centered layout. Subtle fade-in animations. Nothing distracting.`,
  expressive: `Theme: Expressive. Colorful gradient background driven by accent color. Rounded fonts (bold sans-serif). Bouncy hover states. Warm, playful personality. Full of energy.`,
}

export async function generatePortfolio(input: PortfolioInput): Promise<string> {
  const systemPrompt = `You are a world-class frontend designer building unique portfolio pages for Indian creators, professionals, and businesses. You output only valid, self-contained HTML with all CSS inline — no external stylesheets, no JavaScript dependencies, no external fonts loaded (use system fonts). The page must be mobile-first and load instantly.

${THEME_TOKENS[input.theme]}

${PROFILE_TYPE_INSTRUCTIONS[input.profileType]}

Accent color: ${input.accentColor}

STRICT OUTPUT RULES — violating any of these makes the output unusable:
- Your ENTIRE response must be a single HTML document. Nothing before <!DOCTYPE html>. Nothing after </html>.
- No markdown. No code fences. No explanation. No planning. No bullet points. CODE ONLY.
- All CSS in a single <style> block in <head>. No external CSS. No JavaScript.
- Mobile-first: looks great at 375px, degrades gracefully to desktop.
- Keep CSS concise — combine selectors, skip keyframe animations.
- Render every section provided. Do not invent content. Personalise copy from the bio.
- Always include a footer at the bottom with: <a href="https://tap.zakapedia.in" style="...">Made with Tap.Zakapedia.in</a> — style it to be visible (font-size: 14px, font-weight: 600) and match the page theme.`

  // Inject QR code URLs for UPI payment sections so the AI can render them as images
  const sectionsWithQR = input.sections.map(s => {
    if (s.type === 'upi_payment' && s.content.upi_id) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${s.content.upi_id}`)}`
      return { ...s, content: { ...s.content, qr_url: qrUrl } }
    }
    return s
  })

  const userPrompt = `Generate a complete HTML portfolio page for:

IMPORTANT — use EXACTLY this name, do not change it: ${input.name}
${input.role ? `Role/Title: ${input.role}` : ''}
${input.userRoles.length > 0 ? `Roles/Hats: ${input.userRoles.join(', ')}` : ''}
Bio: ${input.bio}
Profile URL: ${input.profileUrl}
${input.avatarUrl ? `Avatar image URL (use in an <img> tag): ${input.avatarUrl}` : ''}

Links to include (render all of these as clickable links):
${input.links.length > 0 ? input.links.map(l => `- ${l.title}: ${l.url}`).join('\n') : '(no links)'}

Sections:
${JSON.stringify(sectionsWithQR, null, 2)}

For UPI payment sections: render the qr_url field as an <img> tag (200×200) above the UPI ID text. Do not describe it — show the actual image.

Output the complete HTML now. Start with <!DOCTYPE html>.`

  return callAI(systemPrompt, userPrompt)
}

// ── Bio rewrite ─────────────────────────────────────────────────────────────

export async function rewriteBio(bio: string, profileType: ProfileType): Promise<string> {
  const systemPrompt = `You are a sharp copywriter who specialises in punchy, authentic bios for ${profileType}s. You rewrite bios to be more compelling without adding false claims or changing the facts. Wrap your rewritten bio in <OUTPUT></OUTPUT> tags — nothing else, no explanation, no quotes, no preamble.`

  const userPrompt = `Rewrite this bio to be punchier and more compelling (keep it under 200 words):

${bio}`

  return callAI(systemPrompt, userPrompt)
}
