import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MODEL = 'gemini-2.5-flash'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { systemPrompt, userPrompt, mode, resumePdf } = await req.json()

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY secret not set')

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
      const err = await res.text()
      throw new Error(`Google AI error (${res.status}): ${err}`)
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
