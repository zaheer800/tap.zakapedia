import type { Theme } from '../../types'

interface Props {
  theme: Theme
  accentColor: string
  onThemeChange: (t: Theme) => void
  onAccentChange: (c: string) => void
}

const ACCENTS: Record<Theme, string[]> = {
  editorial: ['#F59E0B', '#EF4444', '#10B981', '#06B6D4', '#8B5CF6'],
  minimal:   ['#3B82F6', '#64748B', '#10B981', '#F97316', '#F43F5E'],
  expressive:['#8B5CF6', '#EC4899', '#FBBF24', '#06B6D4', '#84CC16'],
}

function ThemePreview({ id, isActive, accent }: { id: Theme; isActive: boolean; accent: string }) {
  if (id === 'editorial') {
    return (
      <div
        style={{
          height: 52,
          backgroundColor: '#060608',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '6px 8px 7px',
        }}
      >
        {/* masthead line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: isActive ? accent : '#F59E0B' }} />
        {/* giant faded letter */}
        <span
          aria-hidden
          style={{
            position: 'absolute', right: -2, bottom: -6,
            fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontWeight: 700,
            fontSize: 52, lineHeight: 0.85, color: isActive ? accent : '#F59E0B', opacity: 0.1,
            letterSpacing: '-0.04em', userSelect: 'none',
          }}
        >
          A
        </span>
        <div style={{ height: 1, width: 10, backgroundColor: isActive ? accent : '#F59E0B', marginBottom: 3 }} />
        <span
          style={{
            fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontWeight: 700,
            fontSize: 17, lineHeight: 1, color: '#F3F1EA', letterSpacing: '-0.02em',
          }}
        >
          Aa
        </span>
      </div>
    )
  }

  if (id === 'minimal') {
    return (
      <div
        style={{
          height: 52,
          background: `radial-gradient(ellipse 120% 80% at 50% -10%, ${isActive ? accent : '#3B82F6'}18 0%, transparent 65%), #FAFAFA`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            fontSize: 15, color: '#0F172A', letterSpacing: '-0.01em',
          }}
        >
          Aa
        </span>
        <div style={{ height: 2, width: 20, borderRadius: 1, backgroundColor: isActive ? accent : '#3B82F6' }} />
      </div>
    )
  }

  // Expressive
  const a = isActive ? accent : '#8B5CF6'
  return (
    <div
      style={{
        height: 52,
        backgroundColor: '#080810',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* blob 1 */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          backgroundColor: a, opacity: 0.55, filter: 'blur(22px)',
          pointerEvents: 'none',
        }}
      />
      {/* blob 2 */}
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: -20, left: -10,
          width: 60, height: 60, borderRadius: '50%',
          backgroundColor: a, opacity: 0.35, filter: 'blur(18px)',
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          position: 'relative', zIndex: 1,
          fontFamily: '"Nunito", sans-serif',
          fontWeight: 900, fontSize: 18, color: '#FFFFFF',
          letterSpacing: '-0.01em',
          textShadow: `0 0 16px ${a}80`,
        }}
      >
        Aa
      </span>
    </div>
  )
}

const THEME_META: { id: Theme; label: string; desc: string }[] = [
  { id: 'editorial',  label: 'Editorial',  desc: 'Dark ink & serif' },
  { id: 'minimal',    label: 'Minimal',    desc: 'Clean & confident' },
  { id: 'expressive', label: 'Expressive', desc: 'Bold & vivid' },
]

export function ThemeSelector({ theme, accentColor, onThemeChange, onAccentChange }: Props) {
  const accents = ACCENTS[theme]

  return (
    <div className="flex flex-col gap-4">
      {/* Theme cards */}
      <div className="grid grid-cols-3 gap-2">
        {THEME_META.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onThemeChange(t.id)
              onAccentChange(ACCENTS[t.id][0])
            }}
            className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
              theme === t.id
                ? 'border-brand-gold shadow-[0_0_0_1px_rgba(201,150,58,0.3)]'
                : 'border-brand-border hover:border-brand-faint'
            }`}
          >
            <ThemePreview id={t.id} isActive={theme === t.id} accent={accentColor} />
            <div className="px-2 py-1.5 bg-brand-surface">
              <p className="text-[11px] font-semibold text-brand-text leading-none mb-0.5">{t.label}</p>
              <p className="text-[10px] text-brand-faint">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Accent colour */}
      <div>
        <p className="text-xs font-medium text-brand-muted mb-2.5">Accent colour</p>
        <div className="flex gap-2 flex-wrap">
          {accents.map((c) => (
            <button
              key={c}
              onClick={() => onAccentChange(c)}
              className="transition-transform"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: c,
                transform: accentColor === c ? 'scale(1.25)' : 'scale(1)',
                boxShadow: accentColor === c
                  ? `0 0 0 2px #0C0A08, 0 0 0 4px ${c}`
                  : 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              title={c}
            />
          ))}

          {/* Custom picker */}
          <label
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '2px dashed',
              borderColor: '#252018',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden', position: 'relative',
              transition: 'border-color 0.15s',
            }}
            className="hover:border-brand-muted"
          >
            <span className="text-brand-faint text-xs pointer-events-none">+</span>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onAccentChange(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
