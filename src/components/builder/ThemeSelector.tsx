import type { Theme } from '../../types'

interface Props {
  theme: Theme
  accentColor: string
  onThemeChange: (t: Theme) => void
  onAccentChange: (c: string) => void
}

const THEMES: { id: Theme; label: string; desc: string; preview: string }[] = [
  {
    id: 'editorial',
    label: 'Editorial',
    desc: 'Bold & magazine-feel',
    preview: 'bg-zinc-950 text-white',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    desc: 'Clean & confident',
    preview: 'bg-gray-50 text-gray-900',
  },
  {
    id: 'expressive',
    label: 'Expressive',
    desc: 'Playful & warm',
    preview: 'bg-gradient-to-br from-violet-500 to-pink-500 text-white',
  },
]

const ACCENTS: Record<Theme, string[]> = {
  editorial: ['#F59E0B', '#EF4444', '#10B981', '#06B6D4', '#8B5CF6'],
  minimal:   ['#3B82F6', '#64748B', '#10B981', '#F97316', '#F43F5E'],
  expressive:['#8B5CF6', '#EC4899', '#FBBF24', '#06B6D4', '#84CC16'],
}

export function ThemeSelector({ theme, accentColor, onThemeChange, onAccentChange }: Props) {
  const accents = ACCENTS[theme]

  return (
    <div className="flex flex-col gap-4">
      {/* Theme cards */}
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onThemeChange(t.id)
              onAccentChange(ACCENTS[t.id][0])
            }}
            className={`
              rounded-lg overflow-hidden border-2 transition-all text-left
              ${theme === t.id ? 'border-gray-900 shadow-sm' : 'border-transparent hover:border-gray-200'}
            `}
          >
            {/* Mini preview swatch */}
            <div className={`h-10 ${t.preview} flex items-center justify-center`}>
              <span className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">
                Aa
              </span>
            </div>
            <div className="px-2 py-1.5 bg-white">
              <p className="text-[11px] font-semibold text-gray-900">{t.label}</p>
              <p className="text-[10px] text-gray-400">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Accent colour */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Accent colour</p>
        <div className="flex gap-2">
          {accents.map((c) => (
            <button
              key={c}
              onClick={() => onAccentChange(c)}
              className={`
                w-7 h-7 rounded-full transition-transform
                ${accentColor === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}
              `}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          {/* Custom color input */}
          <label className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden relative">
            <span className="text-gray-400 text-xs">+</span>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onAccentChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
