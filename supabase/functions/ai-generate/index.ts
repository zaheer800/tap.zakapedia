import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MODEL = 'gemini-2.5-flash-lite'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { systemPrompt, userPrompt } = await req.json()

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY secret not set')

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }] }],
          generationConfig: { maxOutputTokens: 4096 },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Google AI error (${res.status}): ${err}`)
    }

    const data = await res.json()
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Try <OUTPUT> tags first, then fall back to bare HTML extraction
    const outputMatch = raw.match(/<OUTPUT>([\s\S]*?)<\/OUTPUT>/i)
    const htmlMatch = raw.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i) ?? raw.match(/(<html[\s\S]*<\/html>)/i)
    const content = (outputMatch ? outputMatch[1] : htmlMatch ? htmlMatch[1] : '').trim()

    if (!content) {
      throw new Error('Model did not return valid HTML. Please try regenerating.')
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
