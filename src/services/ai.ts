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
  creator: `You are building a CREATOR HUB page — the internet home of someone with an audience. Think: Instagram creator, YouTuber, podcaster, blogger. The page must make visitors feel something, drive follows and subscriptions, and reflect the creator's unique personality. This is a fan landing page, not a CV.

LAYOUT ORDER:
1. HERO — Large, full-width. Avatar prominent (circular, 96px+, with an accent-colored ring). Creator name in a bold display font. Content niche/role as a coloured pill badge below the name. Bio as 2–3 punchy lines — this is their brand statement. Make the hero visually striking using the accent color as a gradient or bold background wash.

2. PLATFORMS — If a platforms section is present, render each platform (content may be a text list or structured data) as a sleek card row: platform icon placeholder (use emoji or initials), platform name, handle, and a prominent "Follow" or "Subscribe" CTA button in accent color. Cards should have a hover lift and feel clickable.

3. LATEST POSTS / CONTENT — If a latest_post section exists, content has fields: title (and optionally title_2, title_3), url (and url_2, url_3) for up to 3 posts. Render each as a featured content card: large title, accent-colored "Watch / Read →" link. If only one post, make it a hero-sized feature card. Multiple posts: a clean grid or stacked list with visual hierarchy.

4. LINKS — Render all links as large, full-width pill buttons (border-radius: 999px) with the accent color as background or border. Each link gets an icon-like prefix (derive from the URL: YouTube → ▶, Instagram → 📸, Spotify → 🎵, etc.) and the link title. Generous padding (16px). These are the money links — make them unmissable.

5. CONTACT / CTA — A soft "Get in touch" section at the bottom. Email and WhatsApp as clean icon+text links. Not a form — just direct contact.

VISUAL STYLE — personality over polish:
- The page should feel like the creator's brand, not a generic website. Use the accent color boldly.
- Load a personality font from Google Fonts: Poppins or DM Sans for a clean creator look, or Playfair Display if editorial. Match to theme.
- Hero: full-bleed background using a gradient derived from accent color (e.g., linear-gradient(135deg, [accent]20 0%, [accent]05 100%) on white, or bold solid for expressive theme).
- Platform cards: glass-effect or softly tinted, consistent card height, hover scale(1.02).
- Link buttons: full-width, pill-shaped, prominent. Each one feels like its own CTA.
- Animations: hero elements fade in sequentially (name → role → bio → CTA). Cards animate in with staggered delay.
- The overall feeling: aspirational, warm, unmistakably human. Not corporate. Not minimal for minimalism's sake.

NOTE: The LAYOUT ORDER above defines priority and style for key creator sections. Any additional sections provided in the data (e.g. about, contact, services) must ALSO be rendered in a logical position after the priority sections.`,

  professional: `You are building a CLIENT-CONVERSION page for a freelancer or consultant — UI/UX designer, developer, marketing consultant, IT professional. The page must close deals. A potential client arrives (via WhatsApp link or QR), reads for 30 seconds, and decides to reach out. Every element earns its place.

LAYOUT ORDER:
1. HERO — Name large and confident. Title/role prominently below (e.g., "UI/UX Designer & Brand Strategist"). Bio as a 2-sentence value proposition — what they do, who they help, what makes them different. A primary CTA immediately below: "Let's Work Together" button linking to WhatsApp (if a WhatsApp link is in the links list) or email. This button is the conversion point.

2. SERVICES — If a services section exists (content.text is a newline-separated list like "Service Name – ₹Price"), render each service as a clean card: service name bold, price in accent color. If no price, just the service name. Cards in a 2-column grid on mobile (or full-width stacked). Each card has a subtle hover effect.

3. SKILLS — If a skills section exists (content.text is comma or newline separated), render as styled chip tags. Group by category if the content has blank lines between groups. Chips: accent-tinted background, small border-radius, tight padding. Make it scannable.

4. ABOUT — If an about section exists, render as a clean 2-column layout on desktop (avatar left, text right) or stacked on mobile. Warm, first-person copy from the content.

5. LINKS — Portfolio links, Behance, GitHub, LinkedIn etc. Render as clean outlined buttons or text links with arrow →. Not pill-shaped (that's for creators) — more refined, rectangular with subtle border.

6. CONTACT — "Ready to start a project?" heading. WhatsApp CTA as the primary action (if available), then email. Include a brief "I typically respond within 24 hours" type note to reduce friction.

VISUAL STYLE — credible, premium, conversion-focused:
- Load "Inter" or "Plus Jakarta Sans" from Google Fonts — clean, modern, trustworthy.
- Background: white or very light grey (#F8F9FA). Clean, nothing distracting.
- Hero: a subtle accent-colored gradient bar or left border as the only decorative element. Everything else is typographic.
- Service cards: white, 1px border, 12px radius, clean shadow on hover. Price in accent color — a visual anchor.
- Skill chips: well-spaced, readable. Not too many colors — use one accent tint for all.
- CTA button: solid accent fill, white text, 48px height, border-radius 10px. No gradients — just confident, solid color.
- Animations: subtle fade-in on scroll (translateY 20px → 0, 0.4s ease). Nothing bouncy or distracting for this professional context.
- Overall feel: confident without being aggressive. Premium without being cold. The kind of page that makes a client say "yes, this person knows what they're doing."

NOTE: The LAYOUT ORDER above defines priority and style for key professional sections. Any additional sections provided in the data must ALSO be rendered in a logical position after the priority sections.`,
  business: `You are building a STOREFRONT page for a local Indian business — home baker, meat shop, salon, restaurant, local service. The single job of this page: customer scans QR or gets WhatsApp link → sees what's available → orders in 2 taps.

LAYOUT ORDER (strictly follow this sequence):
1. HERO — Business name in large bold text. Category/type (from role field) smaller below it. Bio as 1–2 short lines. If a whatsapp_order section is present, place a full-width green "Order on WhatsApp" button IMMEDIATELY below the bio — this is the most important element on the page. Button style: background #25D366, white text, font-weight 700, border-radius 14px, height 52px, font-size 16px.

2. PRODUCTS / MENU — If a products section exists, its content.items is an array of objects. Render each item as a card (white background, box-shadow: 0 2px 8px rgba(0,0,0,0.08), border-radius 14px, overflow hidden). For each item:
   - If item.image_url exists: render <img src="{image_url}" style="width:100%;height:180px;object-fit:cover"> at the top of the card
   - If item.category exists: show it as a small pill badge above the name
   - item.name: bold, 15px
   - item.price: accent color, font-weight 700, 14px
   - item.description: grey, 12px, if present
   - If item.in_stock is true AND a whatsapp_order number is present: render a "Order on WhatsApp" button at the bottom of the card — link to https://wa.me/[number without + or spaces]?text=Hi%2C+I%27d+like+to+order+[item name URL-encoded]+from+[business name URL-encoded]. Button: background #25D366, white, border-radius 8px, width 100%, padding 10px.
   - If item.in_stock is false: show an "Out of stock" orange badge instead of the order button. Grey out the card slightly (opacity 0.7).
   - Group items under their category headings if categories are present.

3. SERVICES — If services section: clean list, each line is one service. Name on the left, price on the right (if on same line separated by – or :). Subtle horizontal dividers.

4. UPI PAYMENT — If a upi_payment section exists (it MUST be rendered): show a dedicated payment card. Center the QR code image (<img src="{qr_url}" width="180" height="180">) — the qr_url is pre-computed in the section data. Below the QR, show the UPI ID in a monospace badge (font-family: monospace, accent-tinted background, border-radius 8px, padding 8px 20px). Add a "Scan to Pay" heading above and small muted text below: "Accepted: GPay · PhonePe · Paytm". The whole card should be centered, with a gentle border and the section heading "Pay Us Directly".

5. HOURS & LOCATION — If hours_location section: hours in a two-column table (day range | time). Address below with a 📍 pin emoji. If the address value starts with "http" (Google Maps link), wrap it in an <a href="{address}" target="_blank"> tag showing "Open in Maps →" as the link text. Otherwise show the address as plain text.

6. WHATSAPP ORDER SECTION — The whatsapp_order section itself (separate from the hero button) should render as a prominent full-width banner at the bottom: a big phone emoji or WhatsApp icon, the heading "Order on WhatsApp", the formatted phone number below, and a large green button. This is the final call-to-action of the page.

7. CONTACT / CTA — Any contact section: phone and email as clean icon+text rows.

WhatsApp URL format: https://wa.me/[digits only, no + or spaces]?text=[URL-encoded message]
Global order message: "Hi, I'd like to order from [business name]"

VISUAL STYLE — make it beautiful, not just functional:
- Warm, inviting, and professional — like a premium local brand, not a generic flyer
- Hero: bold full-width banner using accent color gradient or a rich warm background. Business name large and confident. Avatar/logo in a prominent circle with accent ring.
- Product cards: visually rich — image full-width at top (when present), then a clean content area with category badge, name, price in accent, description, and WhatsApp button. Cards get generous padding, rounded corners (16px+), and a warm shadow. On hover: lift effect.
- Section transitions: use background color alternation and gentle top-border rules to separate sections cleanly.
- Typography: load a warm, friendly sans-serif from Google Fonts (Nunito, Poppins, or Plus Jakarta Sans). Headings bold and sized for impact.
- Accent color: used for prices, CTA buttons, section accents, and category badges — make it feel cohesive.
- Animations: smooth entrance animations for cards (fade + translateY). Button hover transitions. Nothing jarring.
- The page should feel like a premium food delivery listing or a curated brand shop — beautiful enough to make customers trust the business immediately.

NOTE: The LAYOUT ORDER above defines priority and style for key business sections. Any additional sections provided in the data must ALSO be rendered in a logical position after the priority sections.`,
  service_pro: `You are building a TRUST-FIRST profile page for a service professional — doctor, dentist, lawyer, CA, tutor, photographer, trainer, or similar. The visitor is a potential patient or client deciding whether to book. The page must establish credibility instantly and make booking effortless.

LAYOUT ORDER:
1. HERO — Name with professional title prefix prominent (e.g., "Dr. Aisha Khan" or "Adv. Rajan Mehta"). Specialisation directly below in accent color (e.g., "Cardiologist · Apollo Hospital, Hyderabad"). Avatar in a large, professional circle. Bio as 2–3 sentences of calm, authoritative copy. If a book_appointment section exists (content.number), place a "Book Appointment" CTA button immediately below the bio — this is the conversion point. Button style: solid accent fill, white text, 52px height, border-radius 12px, full-width.

2. CREDENTIALS — If a credentials section exists (content.text is a newline-separated list), render each credential as a structured row: degree/certification on the left, institution on the right (if separated by – or comma). Use a clean timeline-like layout or a card list with a subtle left accent border. Make qualifications feel weighty and credible.

3. SERVICES / SPECIALISATIONS — If a services section exists, render as cards: service name, description if present, price/fee range if present. Clean 2-column grid. Each card has a book/enquire link if an appointment number is available.

4. HOURS & LOCATION — If hours_location section: hours in a structured two-column layout (days | timing). Address with a maps link if it's a URL. A clean "📍 Visit Us" heading.

5. ABOUT — If an about section, this is where personality comes through — kept warm but professional. The human behind the credentials.

6. CONTACT — Book Appointment button repeated. WhatsApp for quick queries, phone, email. Languages spoken if mentioned in content.

WhatsApp appointment link: https://wa.me/[number]?text=Hi%2C+I%27d+like+to+book+an+appointment+with+[name URL-encoded]

VISUAL STYLE — calm authority, clinical precision:
- Load "Inter" or "Nunito" from Google Fonts. Clean, readable, never decorative to the point of distraction.
- Background: white (#FFFFFF) or very soft blue-grey (#F8FAFC) — clinical, clean, calming.
- Hero: a soft gradient panel (very subtle, not bold) with the professional's avatar centered. Understated but polished.
- Credential cards: white, left border 3px in accent color, clean shadow, monospaced or tabular layout for degree/institution pairs.
- Service cards: clean white, 1px border, hover border in accent. Price/fee in accent color.
- Book Appointment button: solid accent, full-width, impossible to miss. Possibly a floating sticky button at the bottom on mobile.
- Animations: calm fade-ins only (no bounce, no scale, no playful motion). This is a medical/legal/professional context — motion should be subtle and purposeful.
- Overall feel: the equivalent of a well-designed clinic or law firm website — trustworthy, precise, unhurried. The kind of page that makes someone say "okay, I feel comfortable booking."

NOTE: The LAYOUT ORDER above defines priority and style for key service professional sections. Any additional sections provided in the data must ALSO be rendered in a logical position after the priority sections.`,

  speaker: `You are building a SPEAKER PROFILE page — for a conference speaker, keynote presenter, panelist, or high-profile networker. The audience is event organizers and conference committees who need to quickly assess: who is this person, what do they speak about, and why should we book them. The page must impress in 20 seconds.

LAYOUT ORDER:
1. HERO — Commanding full-width opening. Large avatar with an authoritative framing (not casual). Name in the largest type on the page. Current role/title below (e.g., "AI Researcher & Tech Conference Speaker"). A 1–2 sentence bio that establishes authority immediately — topics, companies, impact. A "Book Me to Speak" CTA button if contact info is available. The hero should feel like a stage — confident, big, memorable.

2. TALKS — This is the centrepiece. If a talks section exists (content.text is newline-separated, each line like "Talk Title – Event Name – Year"), render each talk as a premium card:
   - Talk title: large, bold — the headline
   - Event name: accent-colored badge or subtitle (e.g., "PyCon India 2024")
   - Year/date: small, muted
   - If a slides/video URL is included (after a second –), render a "View Slides →" or "Watch →" link in accent color
   - Cards in a clean grid or stacked list with generous spacing. These are achievements — treat them like awards.

3. ABOUT / BIO — A fuller biography section. What drives them, their expertise areas, their journey. Can be slightly longer than other profile types — event organizers read bios carefully.

4. LINKS — LinkedIn, published articles, podcast appearances, personal site. Render as clean text links with arrow →, or subtle outlined buttons. Not garish — professional.

5. CONTACT — "Invite Me to Speak" as the section heading. Email prominently. WhatsApp if available. A note like "Available for keynotes, panels, workshops, and podcast appearances" to set the scope.

VISUAL STYLE — stage presence on screen:
- Load "Playfair Display" (headings) + "DM Sans" (body) from Google Fonts — authoritative, editorial.
- Background: dark is fine here (deep charcoal or very dark navy #0D0F14) with white text — speakers often use dark, dramatic presentations. Alternatively, a bold minimal light theme. Match to the selected theme.
- Hero: full-viewport dark/rich panel. Name as a massive typographic statement. A thin accent bar or rule as a signature design element.
- Talk cards: glass-effect on dark backgrounds (rgba(255,255,255,0.06), border rgba(255,255,255,0.1), backdrop-filter blur). On light: white with strong shadow and accent border. Hover: subtle lift and glow.
- Typography scale: generous — 60px name, 36px section headings, 18px body. Speakers command space.
- Animations: dramatic entrance — hero elements fade in with slight scale (1.02→1). Talk cards stagger in with delay. Confident, not rushed.
- Overall feel: the opening slide of a great keynote — immediately impressive, sets the tone, makes you want to hear more. This person owns the room.

NOTE: The LAYOUT ORDER above defines priority and style for key speaker sections. Any additional sections provided in the data must ALSO be rendered in a logical position after the priority sections.`,
}

const THEME_TOKENS: Record<Theme, string> = {
  editorial: `THEME — Editorial (dark luxury magazine):
- Background: deep near-black (#060608). Body text: off-white (#F2EDE4). Muted text: #6B6B7A.
- Load "Playfair Display" (headings) + "DM Sans" (body) from Google Fonts via <link>.
- Hero: full-width dark panel. Name as a dominant typographic statement — 56px+ Playfair Display, italic. A thin accent-colored horizontal rule under the name. Role/bio in DM Sans 16px below.
- Section labels: 10px uppercase, letter-spacing 0.2em, accent color, above each section heading.
- Section headings: 28px Playfair Display italic.
- Alternate section backgrounds: #060608 and #0D0D14. 72px vertical padding between sections.
- Cards: dark glass panels — background rgba(255,255,255,0.04), border 1px solid rgba(255,255,255,0.07), border-radius 16px, backdrop-filter: blur(8px). On hover: transform translateY(-4px), border-color transitions to accent color.
- Buttons/CTAs: accent-colored background, dark text, border-radius 8px, font-weight 700.
- Animations: CSS keyframe fade-up (opacity 0→1, translateY 20px→0) with staggered animation-delay per section (0.1s increments). Transition: all 0.3s ease on interactive elements.
- Accent used as: section label color, rule lines, CTA button fill, link hover color.`,

  minimal: `THEME — Minimal (premium studio / consultancy):
- Background: pure #FFFFFF. Structural panels: #F5F5F7. Text: #1A1A1A. Muted: #6E6E73.
- Load "Inter" (all weights) from Google Fonts via <link>.
- Hero: centered, max-width 600px, 80px top padding. Name: 52px Inter 800. Role: 18px Inter 400 #6E6E73. A single 1px #E5E5EA divider line separates hero from content.
- Sections: max-width 700px centered. 72px vertical padding. Each section separated by a 1px top border #E8E8ED.
- Section headings: 13px uppercase letter-spacing 0.15em #6E6E73 — not bold headings, refined labels.
- Cards: white background, 1px solid #E8E8ED border, border-radius 12px, 24px padding. On hover: border-color transitions to accent, box-shadow 0 4px 24px rgba(0,0,0,0.08) appears in 0.2s.
- Buttons: outline style (border: 2px solid accent, accent text) OR filled (accent bg, white text). Border-radius 8px. Never pill-shaped.
- Animations: gentle fade-in translateY(16px→0) over 0.5s ease. No bounce. Nothing that distracts.
- Accent used sparingly: one CTA button, link hover, active states. Everything else is black/grey.`,

  expressive: `THEME — Expressive (bold, colourful, full personality):
- Background: white content area on top of a vivid hero — hero uses a gradient: linear-gradient(135deg, [accent] 0%, [accent-darker] 100%) or a bold solid accent background.
- Load "Nunito" (800 for headings, 600 for body) from Google Fonts via <link>.
- Hero: bold colored background (accent gradient). Avatar in a white ring (border: 4px solid white, border-radius 50%). Name: 48px Nunito 800 white. Role badge: white pill with accent text.
- Content area below hero: white (#FFFFFF) background, border-radius 28px 28px 0 0 at the top (overlapping the hero slightly for a layered feel).
- Cards: white, border-radius 20px, box-shadow 0 4px 20px rgba(0,0,0,0.08). Accent-colored left border (4px) or top gradient bar. Generous padding 20px.
- Buttons: pill-shaped (border-radius: 999px). Primary: accent gradient fill, white text, box-shadow 0 4px 16px [accent]40. On hover: transform scale(1.04), shadow deepens.
- Section headings: 24px Nunito 800. Category/label chips in accent-tinted pills.
- Animations: bouncy entrance — cubic-bezier(0.34, 1.56, 0.64, 1) for cards and buttons. Hover scale(1.04) on cards. Color transitions 0.2s on all interactive elements.
- Accent used boldly: hero background, button fills, chips, highlights. This theme celebrates color.`,
}

export async function generatePortfolio(input: PortfolioInput): Promise<string> {
  const systemPrompt = `You are a world-class UI designer creating stunning, unique portfolio pages. Your work should look like it came from a top-tier design agency — not a template generator. Every page must be visually distinctive, carefully crafted, and immediately impressive.

OUTPUT FORMAT — these rules are non-negotiable:
- Your ENTIRE response is a single HTML document. Nothing before <!DOCTYPE html>. Nothing after </html>.
- No markdown, no code fences, no explanation, no comments. CODE ONLY.
- CSS goes in one <style> block in <head>. You may load ONE Google Fonts family via a <link> tag in <head> — nothing else external.
- No JavaScript of any kind.
- Mobile-first: designed at 375px, scales beautifully to desktop with media queries.
- CRITICAL — RENDER EVERY SECTION: The user prompt lists sections that MUST ALL appear in the output. Skipping any section is a critical failure. The profile layout instructions define the ORDER and STYLE of priority sections — they do not excuse you from rendering additional sections. Every section type listed must produce visible HTML content.
- Never invent facts. Personalise copy from the bio and section content only.
- Footer: include <a href="https://tap.zakapedia.in">Made with Tap.Zakapedia.in</a> styled to match the theme.

MANDATORY CSS — include EXACTLY these rules at the top of your <style> block, before anything else:
*, *::before, *::after { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100%; }

BUTTON/CTA RULES — non-negotiable for mobile correctness:
- Buttons and links styled as buttons must NEVER have a fixed pixel width. Always use width: 100% with a max-width, or let flexbox/grid constrain them.
- Pill buttons: width: 100%; max-width: 400px; display: block; — never width: 300px or similar fixed values.
- All padding must use horizontal values that stay within the viewport (max 24px per side on mobile).
- Any element wider than its parent is a critical failure.

USE RICH CSS FREELY — this is expected and required:
Gradients, box-shadow, text-shadow, CSS custom properties (--vars), keyframe animations, transitions, backdrop-filter, clip-path, pseudo-elements (::before / ::after), CSS Grid, Flexbox, sticky positioning, border-radius, overflow effects. Do not hold back. The output should feel premium.

${THEME_TOKENS[input.theme]}

${PROFILE_TYPE_INSTRUCTIONS[input.profileType]}

Accent color: ${input.accentColor}`

  // Detect platform, type, and handle from a link URL/title
  function detectLink(url: string, title: string): { platform: string; type: 'social' | 'professional' | 'ecommerce' | 'contact' | 'other'; handle: string | null } {
    const u = url.toLowerCase()
    const handle = (patterns: RegExp): string | null => { const m = url.match(patterns); return m ? m[1] : null }
    if (u.includes('instagram.com'))                          return { platform: 'Instagram',   type: 'social',        handle: handle(/instagram\.com\/([^/?#]+)/) }
    if (u.includes('youtube.com') || u.includes('youtu.be')) return { platform: 'YouTube',      type: 'social',        handle: handle(/youtube\.com\/@?([^/?#]+)/) }
    if (u.includes('twitter.com') || u.includes('x.com'))    return { platform: 'X (Twitter)',  type: 'social',        handle: handle(/(?:twitter|x)\.com\/([^/?#]+)/) }
    if (u.includes('facebook.com'))                          return { platform: 'Facebook',     type: 'social',        handle: handle(/facebook\.com\/([^/?#]+)/) }
    if (u.includes('tiktok.com'))                            return { platform: 'TikTok',       type: 'social',        handle: handle(/tiktok\.com\/@?([^/?#]+)/) }
    if (u.includes('spotify.com'))                           return { platform: 'Spotify',      type: 'social',        handle: handle(/spotify\.com\/(?:user|artist)\/([^/?#]+)/) }
    if (u.includes('pinterest.com'))                         return { platform: 'Pinterest',    type: 'social',        handle: handle(/pinterest\.com\/([^/?#]+)/) }
    if (u.includes('linkedin.com'))                          return { platform: 'LinkedIn',     type: 'professional',  handle: handle(/linkedin\.com\/in\/([^/?#]+)/) }
    if (u.includes('github.com'))                            return { platform: 'GitHub',       type: 'professional',  handle: handle(/github\.com\/([^/?#]+)/) }
    if (u.includes('behance.net'))                           return { platform: 'Behance',      type: 'professional',  handle: handle(/behance\.net\/([^/?#]+)/) }
    if (u.includes('dribbble.com'))                          return { platform: 'Dribbble',     type: 'professional',  handle: handle(/dribbble\.com\/([^/?#]+)/) }
    if (u.includes('wa.me') || u.includes('whatsapp.com'))   return { platform: 'WhatsApp',     type: 'contact',       handle: handle(/wa\.me\/([^/?#]+)/) }
    if (u.includes('swiggy.com'))                            return { platform: 'Swiggy',       type: 'ecommerce',     handle: null }
    if (u.includes('zomato.com'))                            return { platform: 'Zomato',       type: 'ecommerce',     handle: handle(/zomato\.com\/[^/]+\/([^/?#]+)/) }
    if (u.includes('amazon.'))                               return { platform: 'Amazon',       type: 'ecommerce',     handle: null }
    if (u.includes('flipkart.com'))                          return { platform: 'Flipkart',     type: 'ecommerce',     handle: null }
    if (u.includes('meesho.com'))                            return { platform: 'Meesho',       type: 'ecommerce',     handle: null }
    if (u.includes('maps.') || u.includes('goo.gl/maps') || u.includes('maps.app.goo.gl')) return { platform: 'Google Maps', type: 'other', handle: null }
    return { platform: title, type: 'other', handle: null }
  }

  const enrichedLinks = input.links.map(l => ({ ...l, ...detectLink(l.url, l.title) }))

  // Inject QR code URLs for UPI payment sections so the AI can render them as images
  const sectionsWithQR = input.sections.map(s => {
    if (s.type === 'upi_payment' && s.content.upi_id) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${s.content.upi_id}`)}`
      return { ...s, content: { ...s.content, qr_url: qrUrl } }
    }
    return s
  })

  // Extract WhatsApp number from section or from links
  const waSection = input.sections.find(s => s.type === 'whatsapp_order')
  const waFromSection = waSection ? String(waSection.content.number ?? '').replace(/\D/g, '') : null
  const waFromLinks = enrichedLinks.find(l => l.platform === 'WhatsApp')?.url.replace(/.*wa\.me\//, '').split('?')[0].replace(/\D/g, '') ?? null
  const waNumber = waFromSection || waFromLinks

  const sectionChecklist = input.sections.map((s, i) => {
    const c = s.content as Record<string, unknown>
    let hint = ''
    if (s.type === 'whatsapp_order' || s.type === 'book_appointment') {
      hint = c.number ? ` → number: ${c.number}` : ' → (no number entered)'
    } else if (s.type === 'upi_payment') {
      hint = c.upi_id ? ` → upi_id: ${c.upi_id}` : ' → (no UPI ID entered)'
    } else if (s.type === 'hours_location') {
      const hours = c.hours ? ` hours: ${String(c.hours).split('\n')[0]}…` : ''
      const addr = c.address ? ` | address: ${String(c.address).substring(0, 60)}` : ''
      hint = ` →${hours}${addr}`
    } else if (s.type === 'products') {
      const items = Array.isArray(c.items) ? c.items : []
      hint = ` → ${items.length} item${items.length !== 1 ? 's' : ''} in content.items array`
    } else if (s.type === 'contact') {
      const parts = [c.email && `email: ${c.email}`, c.phone && `phone: ${c.phone}`].filter(Boolean)
      hint = parts.length ? ` → ${parts.join(', ')}` : ''
    } else if (c.text) {
      const preview = String(c.text).split('\n')[0].substring(0, 60)
      hint = ` → "${preview}${String(c.text).length > 60 ? '…' : ''}"`
    }
    return `  ${i + 1}. ${s.type}${hint}`
  }).join('\n')

  const linkChecklist = enrichedLinks.length > 0
    ? enrichedLinks.map((l, i) => {
        const handleStr = l.handle ? ` (handle: ${l.handle})` : ''
        return `  L${i + 1}. [${l.type.toUpperCase()}] ${l.platform}${handleStr} — label: "${l.title}" → ${l.url}`
      }).join('\n')
    : '  (no links added)'

  const userPrompt = `Generate a complete HTML portfolio page for:

MANDATORY CONTENT — every item below MUST appear visibly in the HTML output. Do not skip any:
${sectionChecklist}
LINKS (all must be rendered as styled, clickable elements):
${linkChecklist}

LINK RENDERING RULES — no emojis, use inline SVG icons for known platforms:
- social links (Instagram, YouTube, TikTok, Spotify, etc.): dedicate a social section with platform-branded cards — show the platform name, the handle if available, and a styled "Follow" / "Subscribe" CTA. Use inline SVG brand icons (draw simple recognisable paths for Instagram camera outline, YouTube play triangle, etc.) or platform initials in an accent-colored circle if SVG is complex.
- professional links (LinkedIn, GitHub, Behance, Dribbble): render near services/skills as clean outlined rectangular buttons with the platform name. Show the handle/username if available.
- ecommerce links (Swiggy, Zomato, Amazon, Flipkart, Meesho): render as prominent full-width "Order on [Platform]" CTA buttons in accent color — highest-priority conversion actions on the page.
- contact links (WhatsApp): primary CTA button, styled green (#25D366), show the number if extractable from the URL.
- other links: clean pill or outlined buttons with the link title as label.

IMPORTANT — use EXACTLY this name, do not change it: ${input.name}
${input.role ? `Role/Title: ${input.role}` : ''}
${input.userRoles.length > 0 ? `Roles/Hats: ${input.userRoles.join(', ')}` : ''}
Bio: ${input.bio}
Profile URL: ${input.profileUrl}
${input.avatarUrl ? `Avatar image URL (use in an <img> tag): ${input.avatarUrl}` : ''}
${waNumber ? `WhatsApp order number (digits only, use in wa.me links): ${waNumber}` : ''}

Sections:
${JSON.stringify(sectionsWithQR, null, 2)}

For UPI payment sections: render the qr_url field as an <img> tag (200×200) above the UPI ID text. Do not describe it — show the actual image.
${waNumber ? `For products section: each item with in_stock=true gets an "Order on WhatsApp" button linking to https://wa.me/${waNumber}?text=Hi%2C+I%27d+like+to+order+[URL-encode item.name]+from+[URL-encode business name]. Items with in_stock=false show an "Out of stock" badge instead.` : ''}

Output the complete HTML now. Start with <!DOCTYPE html>.`

  return callAI(systemPrompt, userPrompt)
}

// ── Resume extraction ───────────────────────────────────────────────────────

export interface ResumeData {
  name: string
  role: string
  bio: string
  skills?: string       // comma-separated list
  services?: string     // newline-separated, "Service Name – description"
  credentials?: string  // newline-separated, "Degree – Institution"
  talks?: string        // newline-separated, "Talk Title – Event – Year"
  phone?: string
}

export async function extractResume(pdfBase64: string): Promise<ResumeData> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  const systemPrompt = `You are a resume parser. Extract key professional information from the provided PDF resume. Return ONLY a valid JSON object — nothing else, no markdown, no explanation.`

  const userPrompt = `Extract the following from this resume and return as JSON:
- name: full name of the person
- role: their primary job title or professional specialisation (e.g. "UI/UX Designer", "Cardiologist", "Corporate Lawyer")
- bio: a 2–3 sentence professional summary written in first person, based on their experience and skills — maximum 450 characters, must end on a complete sentence
- skills: comma-separated list of their key technical and professional skills (omit if none found)
- services: newline-separated list of services they offer or areas of practice, each formatted as "Service Name – brief description" (omit if none found)
- credentials: newline-separated qualifications/certifications formatted as "Degree or Certification – Institution" (omit if none found)
- talks: newline-separated speaking engagements formatted as "Talk Title – Event Name – Year" (omit if none found)
- phone: their phone number as written in the resume (omit if not found)

Return ONLY this JSON structure (omit keys where no data was found):
{"name": "...", "role": "...", "bio": "...", "skills": "...", "services": "...", "credentials": "...", "talks": "...", "phone": "..."}`

  const res = await fetch(`${supabaseUrl}/functions/v1/ai-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ systemPrompt, userPrompt, mode: 'extract_resume', resumePdf: pdfBase64 }),
  })

  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error ?? 'Resume extraction failed')

  const parsed = JSON.parse(data.content) as ResumeData
  return {
    name:        parsed.name?.trim()        ?? '',
    role:        parsed.role?.trim()        ?? '',
    bio:         parsed.bio?.trim()         ?? '',
    skills:      parsed.skills?.trim()      || undefined,
    services:    parsed.services?.trim()    || undefined,
    credentials: parsed.credentials?.trim() || undefined,
    talks:       parsed.talks?.trim()       || undefined,
    phone:       parsed.phone?.trim()       || undefined,
  }
}

// ── Bio rewrite ─────────────────────────────────────────────────────────────

export async function rewriteBio(bio: string, profileType: ProfileType): Promise<string> {
  const systemPrompt = `You are a sharp copywriter who specialises in punchy, authentic bios for ${profileType}s. You rewrite bios to be more compelling without adding false claims or changing the facts. Wrap your rewritten bio in <OUTPUT></OUTPUT> tags — nothing else, no explanation, no quotes, no preamble.`

  const userPrompt = `Rewrite this bio to be punchier and more compelling. Hard limit: 450 characters maximum (not words — characters). End on a complete sentence. Do not truncate mid-sentence.

${bio}`

  return callAI(systemPrompt, userPrompt)
}
