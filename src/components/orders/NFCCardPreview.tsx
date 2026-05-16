interface Props {
  username: string
  nameOnCard: string
}

export function NFCCardPreview({ nameOnCard }: Props) {
  return (
    <div>
      <p className="text-xs font-medium text-brand-faint mb-3">Card preview</p>
      <div className="flex gap-4 flex-wrap">
        <CardSide label="Front">
          <CardFront nameOnCard={nameOnCard} />
        </CardSide>
        <CardSide label="Back">
          <CardBack />
        </CardSide>
      </div>
      <p className="text-xs text-brand-faint mt-3">
        85×54mm PVC · NTAG213 chip · works on iPhone XS+ and all Android
      </p>
    </div>
  )
}

function CardSide({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-brand-faint uppercase tracking-wider mb-1.5 text-center">{label}</p>
      {children}
    </div>
  )
}

function CardFront({ nameOnCard }: { nameOnCard: string }) {
  return (
    <div
      className="w-[255px] h-[162px] rounded-2xl relative overflow-hidden shadow-xl"
      style={{ background: 'linear-gradient(135deg, #1a1510 0%, #0C0A08 50%, #1e1a14 100%)' }}
    >
      {/* Foil sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02]" />
      {/* Edge highlight */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      {/* Subtle horizontal lines texture */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)' }} />

      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          {/* Chip */}
          <div className="w-9 h-7 rounded-md overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C9963A 0%, #E8B84B 40%, #9A7028 100%)' }}>
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px p-px opacity-60">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-brand-gold/40 rounded-[1px]" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display italic text-xl font-bold text-brand-gold leading-none">Tap.</span>
            <NFCWaveIcon />
          </div>
        </div>

        {/* Bottom row */}
        <div>
          {nameOnCard && (
            <p className="text-sm font-semibold text-white/90 tracking-wide">{nameOnCard}</p>
          )}
          <p className="text-[9px] text-white/25 tracking-[0.18em] uppercase mt-0.5">NFC Card</p>
        </div>
      </div>
    </div>
  )
}

function CardBack() {
  return (
    <div
      className="w-[255px] h-[162px] rounded-2xl relative overflow-hidden shadow-xl flex flex-col items-center justify-center gap-3"
      style={{ background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      }} />
      <QRPlaceholder size={72} color="rgba(255,255,255,0.8)" bgColor="transparent" />
      <p className="text-[9px] text-white/25 tracking-[0.18em] uppercase">Scan to connect</p>
    </div>
  )
}

function NFCWaveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-50">
      <circle cx="6" cy="12" r="1.5" fill="rgba(255,255,255,0.9)" />
      <path d="M9.5 8.5a5 5 0 0 1 0 7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M13 6a9 9 0 0 1 0 12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M16.5 3.5a13 13 0 0 1 0 17" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function QRPlaceholder({
  size = 48,
  color = '#000',
  bgColor = '#fff',
}: {
  size?: number
  color?: string
  bgColor?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" style={{ display: 'block', background: bgColor, borderRadius: 2 }}>
      <rect x="0" y="0" width="3" height="3" fill={color} />
      <rect x="0.5" y="0.5" width="2" height="2" fill={bgColor} />
      <rect x="1" y="1" width="1" height="1" fill={color} />
      <rect x="4" y="0" width="3" height="3" fill={color} />
      <rect x="4.5" y="0.5" width="2" height="2" fill={bgColor} />
      <rect x="5" y="1" width="1" height="1" fill={color} />
      <rect x="0" y="4" width="3" height="3" fill={color} />
      <rect x="0.5" y="4.5" width="2" height="2" fill={bgColor} />
      <rect x="1" y="5" width="1" height="1" fill={color} />
      <rect x="3.5" y="0" width="0.5" height="0.5" fill={color} />
      <rect x="3" y="1" width="0.5" height="0.5" fill={color} />
      <rect x="3.5" y="2" width="0.5" height="0.5" fill={color} />
      <rect x="4" y="3" width="0.5" height="0.5" fill={color} />
      <rect x="3" y="3.5" width="0.5" height="0.5" fill={color} />
      <rect x="4.5" y="3.5" width="0.5" height="0.5" fill={color} />
      <rect x="6" y="3" width="0.5" height="0.5" fill={color} />
      <rect x="5" y="4" width="0.5" height="0.5" fill={color} />
      <rect x="6" y="4.5" width="0.5" height="0.5" fill={color} />
      <rect x="3.5" y="5" width="0.5" height="0.5" fill={color} />
      <rect x="5.5" y="5.5" width="0.5" height="0.5" fill={color} />
      <rect x="4" y="6" width="0.5" height="0.5" fill={color} />
      <rect x="6" y="6" width="0.5" height="0.5" fill={color} />
    </svg>
  )
}
