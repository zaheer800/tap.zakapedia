import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function Terms() {
  return (
    <div className="bg-brand-dark text-brand-text min-h-screen">
      <nav className="border-b border-brand-border px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Logo linkTo="/" />
        <Link to="/" className="text-sm text-brand-muted hover:text-brand-text transition-colors">← Back</Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold tracking-widest text-brand-muted uppercase mb-4">Legal</p>
        <h1 className="font-display italic text-5xl text-brand-text mb-3">Terms of Use</h1>
        <p className="text-brand-muted text-sm mb-12">Last updated: April 2026 · Governing law: India</p>

        <div className="space-y-10">

          <Section title="The service">
            <p>Tap (<span className="font-mono text-sm">tap.zakapedia.in</span>) is a bio link page builder operated by Zakapedia (Abdul Aleem Zaheer, Hyderabad, India). The software — page builder, themes, analytics, and published pages — is free to use forever. Revenue comes solely from optional physical products: NFC cards and printed visiting cards.</p>
            <p>By creating an account, you agree to these terms. If you don't agree, please don't use the service.</p>
          </Section>

          <Section title="Your account">
            <ul>
              <li>You must be at least 13 years old to use Tap.</li>
              <li>Your username is permanent and cannot be transferred or sold.</li>
              <li>You are responsible for keeping your account credentials secure. We are not liable for unauthorised access resulting from your failure to protect your credentials.</li>
              <li>We reserve the right to reclaim usernames that are inactive, impersonating others, or violating these terms.</li>
            </ul>
          </Section>

          <Section title="Acceptable use">
            <p>You may use Tap to share links to your work, business, or online presence. You may not use Tap to:</p>
            <ul>
              <li>Publish or link to illegal content under Indian law or applicable international law.</li>
              <li>Impersonate another person or organisation.</li>
              <li>Distribute spam, malware, or phishing content.</li>
              <li>Engage in hate speech, harassment, or incitement to violence.</li>
              <li>Conduct fraudulent transactions through your page.</li>
            </ul>
            <p>We reserve the right to remove pages or suspend accounts that violate these rules, without prior notice.</p>
          </Section>

          <Section title="Your content">
            <p>You own the content you post on Tap — your name, bio, links, and profile photo. By uploading content, you grant Zakapedia a non-exclusive, worldwide licence to display your content as part of delivering the service (i.e. showing your page to visitors).</p>
            <p>You are responsible for ensuring you have the rights to any content you upload, including profile photos and visiting card designs.</p>
          </Section>

          <Section title="Physical product orders">
            <ul>
              <li><strong>Payment</strong> — orders are paid via UPI before fulfilment begins. All prices are in Indian Rupees (₹) and include GST where applicable.</li>
              <li><strong>Fulfilment timeline</strong> — NFC cards ship within 3–5 business days. Visiting cards ship within 7–10 business days. Delays may occur during peak periods or courier disruptions.</li>
              <li><strong>Cancellations</strong> — orders can be cancelled within 12 hours of placement by emailing us. After 12 hours, orders may have entered production and cannot be cancelled.</li>
              <li><strong>Refunds</strong> — we accept returns for defective or incorrect items within 7 days of delivery. We do not offer refunds for change of mind on physical products. Refunds are processed to the original UPI account within 5–7 business days.</li>
              <li><strong>Address accuracy</strong> — you are responsible for providing a correct shipping address. We are not liable for non-delivery due to an incorrect or incomplete address.</li>
            </ul>
          </Section>

          <Section title="Availability and changes">
            <p>We aim to keep Tap available 24/7 but cannot guarantee uninterrupted service. We may update, modify, or discontinue features at any time. If we make a material change to these terms, we will notify active users via email.</p>
          </Section>

          <Section title="Limitation of liability">
            <p>Tap is provided "as is" without warranties of any kind. To the fullest extent permitted by Indian law, Zakapedia is not liable for any indirect, incidental, or consequential damages arising from your use of the service, including loss of business, revenue, or data.</p>
            <p>Our total liability to you for any claim arising from these terms or the service shall not exceed the amount you paid for physical products in the 3 months prior to the claim.</p>
          </Section>

          <Section title="Governing law">
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.</p>
          </Section>

          <Section title="Contact">
            <p>Questions about these terms? Email <a href="mailto:info@zakapedia.in" className="text-brand-gold hover:text-brand-gold-light transition-colors">info@zakapedia.in</a>.</p>
          </Section>

        </div>
      </article>

      <footer className="border-t border-brand-border py-8 mt-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link to="/privacy" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Privacy Policy</Link>
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
