import type { ComponentType } from 'react'
import {
  Mic, Camera, Music, Star, Heart, Video, Radio, Headphones,
  TrendingUp, Users, Share2,
  Code2, Terminal, Cpu, Server, Wifi, Globe, Database,
  Briefcase, BarChart2, Target, Building2,
  BookOpen, Lightbulb, FileText, Bookmark,
  PenTool, Palette, Layers,
} from 'lucide-react'

type IconComp = ComponentType<{ style?: React.CSSProperties }>

const ICONS: Record<string, IconComp[]> = {
  creator:    [Mic, Camera, Music, Star, Heart, Video, Radio, Headphones],
  influencer: [TrendingUp, Users, Star, Heart, Camera, Share2, Video, Music],
  tech:       [Code2, Terminal, Cpu, Server, Wifi, Globe, Database, Code2],
  business:   [Briefcase, TrendingUp, BarChart2, Globe, Target, Building2, Briefcase, BarChart2],
  education:  [BookOpen, Lightbulb, FileText, Bookmark, PenTool, BookOpen, Lightbulb, FileText],
  artist:     [PenTool, Palette, Layers, Star, PenTool, Palette, Layers, Star],
  local:      [Briefcase, TrendingUp, BarChart2, Globe, Target, Building2, Briefcase, BarChart2],
}

// 12 scattered positions — 6 pairs, one near each edge, down the page
const PLACEMENTS = [
  { top:  '4%', left:  '3%', size: 30, rotate: -15 },
  { top:  '6%', left: '83%', size: 22, rotate:  20 },
  { top: '20%', left:  '2%', size: 38, rotate:  -8 },
  { top: '18%', left: '87%', size: 26, rotate:  14 },
  { top: '37%', left:  '4%', size: 22, rotate: -22 },
  { top: '35%', left: '86%', size: 34, rotate:   6 },
  { top: '54%', left:  '2%', size: 28, rotate:  18 },
  { top: '52%', left: '88%', size: 22, rotate: -12 },
  { top: '69%', left:  '5%', size: 36, rotate:  -5 },
  { top: '67%', left: '85%', size: 40, rotate:  22 },
  { top: '83%', left: '11%', size: 22, rotate:  10 },
  { top: '81%', left: '76%', size: 28, rotate: -16 },
]

interface Props {
  userType: string
  /** Icon stroke color */
  color?: string
  /** Overall opacity of the collage layer */
  opacity?: number
}

export function BackgroundCollage({ userType, color = 'currentColor', opacity = 0.055 }: Props) {
  const icons = ICONS[userType]
  if (!icons?.length) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity,
      }}
    >
      {PLACEMENTS.map((p, i) => {
        const Icon = icons[i % icons.length]
        return (
          <Icon
            key={i}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rotate}deg)`,
              color,
              flexShrink: 0,
            }}
          />
        )
      })}
    </div>
  )
}
