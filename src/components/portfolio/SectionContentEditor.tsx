interface Props {
  type: string
  content: Record<string, string>
  onChange: (key: string, value: string) => void
}

const inputCls = 'w-full px-3 py-2 text-xs bg-brand-dark border border-brand-border rounded-lg text-brand-text placeholder:text-brand-faint/60 focus:outline-none focus:border-brand-muted transition-colors'
const textareaCls = inputCls + ' resize-none'

export function SectionContentEditor({ type, content, onChange }: Props) {
  const get = (k: string) => content[k] ?? ''

  switch (type) {
    case 'about':
      return (
        <textarea value={get('text')} onChange={e => onChange('text', e.target.value)}
          placeholder="Your bio or about text…" rows={3} className={textareaCls} />
      )

    case 'latest_post':
      return (
        <div className="flex flex-col gap-2">
          <input value={get('title')} onChange={e => onChange('title', e.target.value)} placeholder="Title of your latest post or video" className={inputCls} />
          <input value={get('url')} onChange={e => onChange('url', e.target.value)} placeholder="https://…" className={inputCls} />
        </div>
      )

    case 'services':
      return (
        <textarea value={get('text')} onChange={e => onChange('text', e.target.value)}
          placeholder={'Logo Design – ₹5,000\nBrand Kit – ₹12,000\nWebsite – from ₹25,000'}
          rows={3} className={textareaCls} />
      )

    case 'skills':
      return (
        <input value={get('text')} onChange={e => onChange('text', e.target.value)}
          placeholder="React, Node.js, UI/UX Design, Figma…" className={inputCls} />
      )

    case 'credentials':
      return (
        <textarea value={get('text')} onChange={e => onChange('text', e.target.value)}
          placeholder={'MBBS – AIIMS Delhi\nMD Cardiology – PGIMER\nFACC – American College of Cardiology'}
          rows={3} className={textareaCls} />
      )

    case 'products':
      return (
        <textarea value={get('text')} onChange={e => onChange('text', e.target.value)}
          placeholder={'Chocolate Cake – ₹350\nPinwheel Sandwich – ₹120\nFilter Coffee – ₹60'}
          rows={3} className={textareaCls} />
      )

    case 'hours_location':
      return (
        <div className="flex flex-col gap-2">
          <textarea value={get('hours')} onChange={e => onChange('hours', e.target.value)}
            placeholder={'Mon–Sat: 9 AM – 8 PM\nSun: 10 AM – 5 PM'}
            rows={2} className={textareaCls} />
          <input value={get('address')} onChange={e => onChange('address', e.target.value)}
            placeholder="Full address or Google Maps link" className={inputCls} />
        </div>
      )

    case 'whatsapp_order':
    case 'book_appointment':
      return (
        <input value={get('number')} onChange={e => onChange('number', e.target.value)}
          placeholder="+91 98765 43210" className={inputCls} type="tel" />
      )

    case 'upi_payment':
      return (
        <input value={get('upi_id')} onChange={e => onChange('upi_id', e.target.value)}
          placeholder="yourname@gpay  or  yourname@upi" className={inputCls} />
      )

    case 'talks':
      return (
        <textarea value={get('text')} onChange={e => onChange('text', e.target.value)}
          placeholder={'The Future of AI – Google DevFest 2024\nBuilding in Public – Startup Summit 2023'}
          rows={3} className={textareaCls} />
      )

    case 'contact':
      return (
        <div className="flex flex-col gap-2">
          <input value={get('email')} onChange={e => onChange('email', e.target.value)}
            placeholder="your@email.com" className={inputCls} type="email" />
          <input value={get('phone')} onChange={e => onChange('phone', e.target.value)}
            placeholder="+91 98765 43210" className={inputCls} type="tel" />
        </div>
      )

    case 'links':
      return <p className="text-[10px] text-brand-faint">Links are managed in the Build tab.</p>

    default:
      return null
  }
}
