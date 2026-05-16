import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function Privacy() {
  return (
    <div className="bg-brand-dark text-brand-text min-h-screen">
      <nav className="border-b border-brand-border px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Logo linkTo="/" />
        <Link to="/" className="text-sm text-brand-muted hover:text-brand-text transition-colors">← Back</Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold tracking-widest text-brand-muted uppercase mb-4">Legal</p>
        <h1 className="font-display italic text-5xl text-brand-text mb-3">Privacy Policy</h1>
        <p className="text-brand-muted text-sm mb-12">Last updated: April 2026</p>

        <div className="prose-custom space-y-10">

          <Section title="Who we are">
            <p>Tap is a product by Zakapedia, operated by Abdul Aleem Zaheer. When you use Tap at <strong>tap.zakapedia.in</strong>, you are trusting us with some of your information. This policy explains what we collect, why, and how we use it.</p>
          </Section>

          <Section title="What we collect">
            <p>We collect only what's necessary to run the service:</p>
            <ul>
              <li><strong>Account data</strong> — your email address and username, provided during signup.</li>
              <li><strong>Profile data</strong> — your name, bio, profile photo, and links that you add to your Tap page.</li>
              <li><strong>Analytics events</strong> — when someone visits your public page or clicks a link, we record the timestamp and traffic source (e.g. Instagram, NFC tap, direct). We do not record the visitor's IP address or any personally identifiable information.</li>
              <li><strong>Order data</strong> — for NFC card and visiting card orders: shipping name, address, phone number, and UPI transaction reference (UTR) for payment verification. We do not store payment card details.</li>
            </ul>
          </Section>

          <Section title="What we do not collect">
            <ul>
              <li>We do not use third-party analytics (no Google Analytics, no Mixpanel).</li>
              <li>We do not use advertising trackers or tracking pixels.</li>
              <li>We do not store payment card numbers, CVVs, or bank account details.</li>
              <li>Visitor analytics contain no personally identifiable information — no IP addresses, no device fingerprints.</li>
            </ul>
          </Section>

          <Section title="How we use your data">
            <ul>
              <li>To provide and improve the Tap service.</li>
              <li>To display your public page at <span className="font-mono text-sm">tap.zakapedia.in/username</span>.</li>
              <li>To show you analytics about your page's performance.</li>
              <li>To fulfil physical product orders (NFC cards and visiting cards).</li>
              <li>To contact you about your account or orders when necessary.</li>
            </ul>
          </Section>

          <Section title="Data sharing">
            <p>We do not sell your data. We share data only in these cases:</p>
            <ul>
              <li><strong>Print and shipping vendors</strong> — for physical product orders, we share your name, address, and order details with our print and courier partners. These partners process your data solely to fulfil the order.</li>
              <li><strong>Supabase</strong> — our database provider (Supabase Inc.). Data is stored on servers in Singapore. Supabase's privacy policy applies to the infrastructure layer.</li>
              <li><strong>Legal requirement</strong> — if required by Indian law or a valid court order.</li>
            </ul>
          </Section>

          <Section title="Data retention">
            <ul>
              <li>Your account and profile data is retained as long as your account is active.</li>
              <li>Analytics events (page views and link clicks) are retained for 90 days.</li>
              <li>Order records are retained for 3 years for accounting purposes.</li>
              <li>Deleting your account removes your profile, page, and links. Analytics events are deleted within 30 days. Order records may be retained as required by law.</li>
            </ul>
          </Section>

          <Section title="Your rights">
            <p>You can:</p>
            <ul>
              <li>Access, edit, or delete your profile data at any time from the dashboard.</li>
              <li>Request a copy of your data by emailing us.</li>
              <li>Request account deletion by emailing us.</li>
            </ul>
          </Section>

          <Section title="Security">
            <p>All data is transmitted over HTTPS. We use Supabase Row Level Security (RLS) to ensure users can only access their own data. Profile photos are stored in a public Supabase storage bucket — do not upload images you want kept private.</p>
          </Section>

          <Section title="Contact">
            <p>For any privacy questions or data requests, email us at <a href="mailto:info@zakapedia.in" className="text-brand-gold hover:text-brand-gold-light transition-colors">info@zakapedia.in</a>.</p>
          </Section>

        </div>
      </article>

      <footer className="border-t border-brand-border py-8 mt-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link to="/terms" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Terms of Use</Link>
          <p className="text-xs text-brand-faint">© 2026 Zakapedia</p>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display italic text-2xl text-brand-text mb-4">{title}</h2>
      <div className="space-y-3 text-[15px] text-brand-muted leading-relaxed [&_strong]:text-brand-text [&_ul]:space-y-2 [&_ul]:list-none [&_ul>li]:before:content-['—'] [&_ul>li]:before:mr-2 [&_ul>li]:before:text-brand-faint [&_a]:underline">
        {children}
      </div>
    </div>
  )
}
