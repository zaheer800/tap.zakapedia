import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Palette, BarChart2 } from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-lg font-bold text-gray-900 tracking-tight">Tap</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Create page free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 mb-8">
          <Zap className="w-3 h-3" />
          Free forever. No plans, no paywalls.
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
          One tap.
          <br />
          <span className="text-gray-400">Your entire presence.</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          A beautifully designed bio page for creators, professionals, and small businesses in India.
          Three distinct themes. Free forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
          >
            Create your page free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#themes"
            className="inline-flex items-center justify-center gap-2 bg-gray-50 text-gray-700 text-sm font-medium px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            See themes
          </a>
        </div>
      </section>

      {/* Themes showcase */}
      <section id="themes" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Three personalities. One platform.
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-md mx-auto">
            Not just colour swaps — complete design systems. Each theme is a personality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ThemeCard
              name="Editorial"
              desc="Bold, magazine-feel. For creators who want their page to say something."
              preview="bg-zinc-950"
              textColor="text-white"
              label="Aa"
            />
            <ThemeCard
              name="Minimal"
              desc="Clean, confident, credible. For professionals sharing a portfolio or pitch."
              preview="bg-white border border-gray-200"
              textColor="text-gray-900"
              label="Aa"
            />
            <ThemeCard
              name="Expressive"
              desc="Colourful, warm, full of personality. For local shops, artists, and foodies."
              preview="bg-gradient-to-br from-violet-500 to-pink-500"
              textColor="text-white"
              label="Aa"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Feature
            icon={<Palette className="w-5 h-5" />}
            title="You look distinct"
            desc="Not like everyone else's Linktree. Your page reflects your identity."
          />
          <Feature
            icon={<BarChart2 className="w-5 h-5" />}
            title="Built-in analytics"
            desc="See page views, link clicks, and traffic sources. No third-party tools."
          />
          <Feature
            icon={<Zap className="w-5 h-5" />}
            title="NFC & visiting cards"
            desc="Tap your NFC card or hand over a visiting card — your page opens instantly."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your page is free. Always.
          </h2>
          <p className="text-gray-400 mb-8">
            No plans. No paywalls. No locked themes. Just a page that looks like you.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Create your page
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        <p>© 2026 Zakapedia · tap.zakapedia.in</p>
      </footer>
    </div>
  )
}

function ThemeCard({
  name, desc, preview, textColor, label,
}: {
  name: string; desc: string; preview: string; textColor: string; label: string
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className={`${preview} h-36 flex items-center justify-center`}>
        <span className={`text-3xl font-bold ${textColor} opacity-60`}>{label}</span>
      </div>
      <div className="bg-white p-5">
        <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div>
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}
