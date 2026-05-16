import { Palette } from 'lucide-react'
import type { Page, VisitingCardTemplate } from '../../types'
import { QRPlaceholder } from './NFCCardPreview'

interface Props {
  template: VisitingCardTemplate
  page: Page
  username: string
}

export function VisitingCardPreview({ template, page }: Props) {
  return (
    <div>
      <p className="text-xs font-medium text-brand-faint mb-3">Card preview</p>
      <div className="flex gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-medium text-brand-faint uppercase tracking-wider mb-1.5 text-center">Front</p>
          {template === 'editorial'  && <EditorialCard  page={page} />}
          {template === 'minimal'    && <MinimalCard    page={page} />}
          {template === 'expressive' && <ExpressiveCard page={page} />}
          {template === 'upload'     && <UploadCard />}
        </div>
        {template !== 'upload' && (
          <div>
            <p className="text-[10px] font-medium text-brand-faint uppercase tracking-wider mb-1.5 text-center">Back</p>
            <BackOfCard accentColor={page.accent_color} />
          </div>
        )}
      </div>
      <p className="text-xs text-brand-faint mt-3">
        85×54mm · double-sided · QR links to your Tap page
      </p>
    </div>
  )
}

function EditorialCard({ page }: { page: Page }) {
  const accent = page.accent_color || '#C9963A'
  return (
    <div
      className="w-[255px] h-[162px] rounded-2xl overflow-hidden shadow-xl relative flex flex-col justify-between p-5"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1210 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />
      <div>
        <div className="w-6 h-0.5 mb-2.5" style={{ backgroundColor: accent }} />
        <p className="font-display italic text-white text-base font-bold leading-tight">
          {page.name || 'Your Name'}
        </p>
        {page.bio && (
          <p className="text-[10px] mt-1.5 leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {page.bio.length > 60 ? page.bio.slice(0, 60) + '…' : page.bio}
          </p>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="font-display italic font-bold text-sm leading-none" style={{ color: accent }}>Tap.</span>
        <div className="w-px h-8 opacity-10" style={{ backgroundColor: 'white' }} />
        <QRPlaceholder size={36} color="rgba(255,255,255,0.7)" bgColor="transparent" />
      </div>
    </div>
  )
}

function MinimalCard({ page }: { page: Page }) {
  const accent = page.accent_color || '#3B82F6'
  return (
    <div className="w-[255px] h-[162px] rounded-2xl overflow-hidden shadow-xl bg-white relative flex flex-col justify-between p-5 border border-gray-100">
      <div>
        <div className="w-5 h-5 rounded-full mb-3 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: accent }}>
          {(page.name || 'Y')[0].toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{page.name || 'Your Name'}</p>
        {page.bio && (
          <p className="text-[10px] text-gray-400 mt-1 leading-snug">
            {page.bio.length > 55 ? page.bio.slice(0, 55) + '…' : page.bio}
          </p>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: accent }} />
        <QRPlaceholder size={36} color="#1a1a1a" bgColor="transparent" />
      </div>
    </div>
  )
}

function ExpressiveCard({ page }: { page: Page }) {
  const accent = page.accent_color || '#8B5CF6'
  return (
    <div
      className="w-[255px] h-[162px] rounded-2xl overflow-hidden shadow-xl relative p-5 flex flex-col justify-between"
      style={{ background: `linear-gradient(135deg, ${accent}f0 0%, ${accent}b0 100%)` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex-shrink-0 flex items-center justify-center text-white font-extrabold text-sm"
          style={{ fontFamily: 'Nunito, sans-serif' }}>
          {(page.name || 'Y')[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-extrabold text-white leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {page.name || 'Your Name'}
          </p>
          {page.bio && (
            <p className="text-[10px] text-white/70 mt-0.5 leading-snug" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {page.bio.length > 50 ? page.bio.slice(0, 50) + '…' : page.bio}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-[9px] text-white/50 tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Tap.
        </span>
        <QRPlaceholder size={40} color="rgba(255,255,255,0.9)" bgColor="rgba(255,255,255,0.15)" />
      </div>
    </div>
  )
}

function BackOfCard({ accentColor }: { accentColor: string }) {
  return (
    <div
      className="w-[255px] h-[162px] rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3"
      style={{ background: 'linear-gradient(135deg, #f8f6f2 0%, #ede9e2 100%)' }}
    >
      <QRPlaceholder size={72} color="#1a1612" bgColor="transparent" />
      <p className="text-[9px] tracking-[0.18em] uppercase font-medium" style={{ color: accentColor || '#8A7F74' }}>
        Scan to connect
      </p>
    </div>
  )
}

function UploadCard() {
  return (
    <div className="w-[255px] h-[162px] rounded-2xl border border-brand-border flex flex-col items-center justify-center gap-2 text-center p-5"
      style={{ background: 'linear-gradient(135deg, #141210 0%, #1a1510 100%)' }}>
      <Palette className="w-7 h-7 text-brand-faint" />
      <p className="text-xs font-medium text-brand-muted">Your custom design</p>
      <p className="text-[10px] text-brand-faint leading-relaxed">
        Upload your design file.<br />
        Include the QR code in your artwork.
      </p>
    </div>
  )
}
