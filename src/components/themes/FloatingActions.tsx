import { useState } from 'react'
import type { Page, Link } from '../../types'
import { supabase } from '../../lib/supabase'

interface Props {
  page: Page
  links: Link[]
  isPreview?: boolean
}

function detectWhatsApp(links: Link[]): Link | null {
  return (
    links.find((l) => {
      const url = l.url.toLowerCase()
      const title = l.title.toLowerCase()
      return url.includes('wa.me') || url.includes('whatsapp.com') || title === 'whatsapp'
    }) ?? null
  )
}

/** Removes links that are shown as floating action buttons so they don't repeat in the list. */
export function filterFloatingLinks(links: Link[]): Link[] {
  return links.filter((l) => {
    const url = l.url.toLowerCase()
    const title = l.title.toLowerCase()
    return !url.includes('wa.me') && !url.includes('whatsapp.com') && title !== 'whatsapp'
  })
}

/** Returns '#111111' if the accent is too light for white text, else '#ffffff'. */
function contrastColor(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.55 ? '#111111' : '#ffffff'
  } catch {
    return '#ffffff'
  }
}

export function FloatingActions({ page, links, isPreview = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const waLink = detectWhatsApp(links)
  const accent = page.accent_color || '#3B82F6'
  const btnTextColor = contrastColor(accent)
  const isLightAccent = btnTextColor === '#111111'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isPreview || !senderName.trim() || !message.trim()) return
    setStatus('sending')
    const { error } = await supabase
      .from('contact_messages')
      .insert({ page_id: page.id, sender_name: senderName.trim(), message: message.trim() })
    setStatus(error ? 'error' : 'sent')
  }

  function handleClose() {
    setModalOpen(false)
    setTimeout(() => { setSenderName(''); setMessage(''); setStatus('idle') }, 300)
  }

  return (
    <>
      {/* ── Floating stack (bottom-right) ──────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          zIndex: 40,
          pointerEvents: isPreview ? 'none' : 'auto',
        }}
      >
        {/* ── "Say hi" pill ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title={`Message ${page.name || 'me'}`}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '11px 16px 11px 13px',
            borderRadius: 100,
            backgroundColor: accent,
            border: isLightAccent ? '1.5px solid rgba(0,0,0,0.14)' : 'none',
            boxShadow: `0 4px 18px ${accent}55, 0 2px 6px rgba(0,0,0,0.18)`,
            cursor: 'pointer',
            color: btnTextColor,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            transition: 'transform 0.15s, box-shadow 0.15s',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1.06)'
            el.style.boxShadow = `0 6px 24px ${accent}70, 0 2px 8px rgba(0,0,0,0.22)`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1)'
            el.style.boxShadow = `0 4px 18px ${accent}55, 0 2px 6px rgba(0,0,0,0.18)`
          }}
        >
          {/* Envelope icon — inherits currentColor from parent */}
          <svg
            width="15" height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <polyline points="2,4 12,13 22,4" />
          </svg>
          Say hi
        </button>

        {/* ── WhatsApp circle ────────────────────────────────────────────── */}
        {waLink && (
          <div style={{ position: 'relative' }}>
            {/* Pulse ring */}
            <div
              className="animate-ping"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: '#25D366',
                opacity: 0.3,
                pointerEvents: 'none',
              }}
            />
            <a
              href={waLink.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => isPreview && e.preventDefault()}
              title="Chat on WhatsApp"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 52,
                borderRadius: '50%',
                overflow: 'hidden',
                textDecoration: 'none',
                flexShrink: 0,
                boxShadow: '0 4px 18px rgba(37,211,102,0.55), 0 2px 6px rgba(0,0,0,0.18)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'scale(1.1)'
                el.style.boxShadow = '0 6px 26px rgba(37,211,102,0.72), 0 2px 8px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'scale(1)'
                el.style.boxShadow = '0 4px 18px rgba(37,211,102,0.55), 0 2px 6px rgba(0,0,0,0.18)'
              }}
            >
              {/*
                Self-contained WhatsApp SVG — includes its own green rounded-rect
                background + the official phone icon path used throughout the app.
                viewBox matches the existing Dashboard quick-link icon exactly.
              */}
              <svg width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#25D366" />
                <path
                  fill="white"
                  d="M12 5a7 7 0 0 0-5.9 10.7L5 19l3.4-1.1A7 7 0 1 0 12 5zm0 12.5a5.5 5.5 0 0 1-2.8-.8l-.2-.1-2 .6.6-1.9-.1-.2A5.5 5.5 0 1 1 12 17.5zm3-4.1c-.2-.1-.9-.4-1-.5-.2 0-.3-.1-.4.1l-.6.7c-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-1-.6-.5-1-1.1-1-1.3s0-.2.1-.3l.3-.4c.1-.1.1-.2.2-.3v-.3c0-.1-.4-1-.5-1.3-.1-.3-.3-.2-.4-.2h-.4c-.1 0-.3.1-.5.3-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.1 1.2 1.9 3 2.6.4.2.8.3 1 .3.4 0 .8-.2 1-.5.3-.3.3-.7.2-.8z"
                />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* ── Contact modal (bottom sheet) ──────────────────────────────── */}
      {modalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />

          {/* Sheet */}
          <div
            style={{
              position: 'relative', zIndex: 1,
              backgroundColor: '#0F0E0C',
              borderRadius: '24px 24px 0 0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              padding: '20px 24px 40px',
              maxWidth: 480, width: '100%', margin: '0 auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />

            {status === 'sent' ? (
              /* Success */
              <div style={{ textAlign: 'center', paddingTop: 16, paddingBottom: 8 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: `${accent}18`, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#F0EFE8', marginBottom: 6 }}>Message sent!</p>
                <p style={{ fontSize: 13.5, color: '#6B6B78', lineHeight: 1.6 }}>{page.name || 'They'} will get back to you soon.</p>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{ WebkitAppearance: 'none', appearance: 'none', marginTop: 24, padding: '11px 28px', borderRadius: 100, backgroundColor: accent, color: btnTextColor, fontWeight: 700, fontSize: 14, border: isLightAccent ? '1.5px solid rgba(0,0,0,0.14)' : 'none', cursor: 'pointer', outline: 'none' }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#F0EFE8', marginBottom: 4 }}>
                    Message {page.name || 'me'}
                  </p>
                  <p style={{ fontSize: 12.5, color: '#5A5A66' }}>They'll receive it privately.</p>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5A66', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Your name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Riya Sharma"
                    maxLength={100}
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EFE8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}90` }}
                    onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5A66', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What's on your mind?"
                    maxLength={1000}
                    rows={4}
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EFE8', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.55 }}
                    onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}90` }}
                    onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  <p style={{ textAlign: 'right', fontSize: 10, color: '#3A3A44', marginTop: 4 }}>{message.length}/1000</p>
                </div>

                {status === 'error' && (
                  <p style={{ fontSize: 12.5, color: '#F87171', marginBottom: 12 }}>Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending' || !senderName.trim() || !message.trim()}
                  style={{
                    WebkitAppearance: 'none', appearance: 'none',
                    width: '100%', padding: '14px', borderRadius: 14,
                    backgroundColor: accent, color: btnTextColor,
                    fontWeight: 700, fontSize: 15,
                    border: isLightAccent ? '1.5px solid rgba(0,0,0,0.14)' : 'none',
                    cursor: status === 'sending' ? 'wait' : 'pointer',
                    opacity: (!senderName.trim() || !message.trim()) ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    outline: 'none',
                  }}
                >
                  {status === 'sending' ? (
                    <>
                      <span style={{ width: 16, height: 16, border: `2px solid ${btnTextColor}40`, borderTopColor: btnTextColor, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
