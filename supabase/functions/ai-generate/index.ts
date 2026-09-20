/**
 * Tap — ai-generate Edge Function
 *
 * Proxies Gemini calls for portfolio generation, bio rewrites and resume extraction.
 *
 * Hardened 2026-09-20 (it used to be callable by anyone holding the public anon key, with no
 * limit, at the owner's Gemini expense):
 *  - Caller must be a signed-in Tap user (the anon key alone is rejected).
 *  - Per-user limit: at most AI_DAILY_LIMIT calls (default 30) in any rolling 24 hours, counted
 *    in tap.ai_usage. The attempt is logged BEFORE Gemini is called, so failures count too.
 *  - Request validation: known mode only, prompt and PDF size caps.
 *  - CORS limited to the app's origins; Google's raw error text is logged, not returned.
 *
 * Environment variables (Supabase → Edge Functions → Secrets):
 *   GOOGLE_AI_API_KEY  — Gemini API key
 *   AI_DAILY_LIMIT     — optional, calls per user per 24h (default 30)
 *   ALLOWED_ORIGINS    — optional, comma-separated browser origins allowed to call this
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MODEL = 'gemini-2.5-flash'
const DAILY_LIMIT = Number(Deno.env.get('AI_DAILY_LIMIT') ?? '30')
const MAX_PROMPT_CHARS = 120_000
const MAX_PDF_BASE64_CHARS = 10 * 1024 * 1024 // roughly a 7.5 MB PDF

const ALLOWED_ORIGINS = (
  Deno.env.get('ALLOWED_ORIGINS') ?? 'https://tap.zakapedia.in,http://localhost:5173'
).split(',').map((s) => s.trim()).filter(Boolean)

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) })
  if (req.method !== 'POST') return json(req, 405, { error: 'Method not allowed' })

  try {
    // Service-role client, default schema tap (for the usage log). It also verifies the caller's token.
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'tap' },
    })

    // Who is calling? The anon key is a valid JWT but not a user, so getUser() rejects it.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: userData, error: userError } = token
      ? await admin.auth.getUser(token)
      : { data: { user: null }, error: new Error('no token') }
    const user = userData?.user
    if (userError || !user || user.is_anonymous) {
      return json(req, 401, { error: 'Please sign in to use AI features' })
    }

    // Validate the request before spending anything.
    const body = await req.json().catch(() => null)
    const systemPrompt = body?.systemPrompt
    const userPrompt = body?.userPrompt
    const mode = body?.mode
    const resumePdf = body?.resumePdf
    if (typeof systemPrompt !== 'string' || typeof userPrompt !== 'string' || !userPrompt.trim()) {
      return json(req, 400, { error: 'systemPrompt and userPrompt are required' })
    }
    if (mode !== undefined && mode !== 'extract_resume') {
      return json(req, 400, { error: 'Unknown mode' })
    }
    if (systemPrompt.length + userPrompt.length > MAX_PROMPT_CHARS) {
      return json(req, 413, { error: 'Request too large' })
    }
    if (resumePdf !== undefined && (typeof resumePdf !== 'string' || resumePdf.length > MAX_PDF_BASE64_CHARS)) {
      return json(req, 413, { error: 'Resume file too large' })
    }

    // Per-user limit over a rolling 24 hours; the attempt is logged before Gemini is called.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await admin
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since)
    if (countError) {
      console.error('ai_usage count failed:', countError)
      return json(req, 500, { error: 'Could not check your usage. Please try again.' })
    }
    if ((count ?? 0) >= DAILY_LIMIT) {
      return json(req, 429, { error: `Daily AI limit reached (${DAILY_LIMIT} per 24 hours). Please try again later.` })
    }
    const { error: logError } = await admin
      .from('ai_usage')
      .insert({ user_id: user.id, mode: mode ?? 'generate' })
    if (logError) {
      console.error('ai_usage insert failed:', logError)
      return json(req, 500, { error: 'Could not record your usage. Please try again.' })
    }

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY secret not set')
      return json(req, 500, { error: 'AI is not configured' })
    }

    // Build content parts — PDF inline when extracting a resume
    const parts: unknown[] = []
    if (mode === 'extract_resume' && resumePdf) {
      parts.push({ inline_data: { mime_type: 'application/pdf', data: resumePdf } })
    }
    parts.push({ text: `${systemPrompt}\n\n---\n\n${userPrompt}` })

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { maxOutputTokens: mode === 'extract_resume' ? 2048 : 32768 },
        }),
      }
    )

    if (!res.ok) {
      console.error(`Google AI error (${res.status}):`, await res.text())
      return json(req, 502, { error: 'The AI service is unavailable right now. Please try again.' })
    }

    const data = await res.json()
    const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    // Strip markdown code fences if the model wrapped the output despite instructions
    const raw = rawText.replace(/^```(?:html)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    let content: string

    if (mode === 'extract_resume') {
      // Pull the outermost JSON object out of the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      content = jsonMatch ? jsonMatch[0].trim() : ''
      if (!content) throw new Error('Could not extract resume data. Please try again or fill in manually.')
    } else {
      // Try <OUTPUT> tags first, then bare HTML
      const outputMatch = raw.match(/<OUTPUT>([\s\S]*?)<\/OUTPUT>/i)
      const htmlMatch = raw.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i) ?? raw.match(/(<html[\s\S]*<\/html>)/i)
      content = (outputMatch ? outputMatch[1] : htmlMatch ? htmlMatch[1] : '').trim()
      if (!content) throw new Error('Model did not return valid HTML. Please try regenerating.')
    }

    return json(req, 200, { content })
  } catch (err) {
    // Only the app's own, user-facing messages are thrown above; anything unexpected is generic.
    const message = (err as Error).message
    const known = message.startsWith('Could not extract resume data') || message.startsWith('Model did not return valid HTML')
    if (!known) console.error('ai-generate error:', err)
    return json(req, 500, { error: known ? message : 'Something went wrong. Please try again.' })
  }
})
