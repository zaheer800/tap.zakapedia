import { useState } from 'react'
import { CreditCard, Upload, CheckCircle, Copy, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Page, TapUser, VisitingCardTemplate, Finish, ShippingAddress } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { VisitingCardPreview } from './VisitingCardPreview'

interface Props {
  page: Page
  tapUser: TapUser
  onGoToInbox?: () => void
}

const TEMPLATES: { id: VisitingCardTemplate; label: string; desc: string }[] = [
  { id: 'editorial',  label: 'Editorial',      desc: 'Bold typography, dark aesthetic' },
  { id: 'minimal',    label: 'Minimal',         desc: 'Clean layout, generous whitespace' },
  { id: 'expressive', label: 'Expressive',      desc: 'Colourful, playful, warm' },
  { id: 'upload',     label: 'Custom upload',   desc: 'Upload your own design for print' },
]

const EMPTY_ADDRESS: ShippingAddress = {
  name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '',
}

const PRICE = 599
const UPI_ID = import.meta.env.VITE_UPI_ID as string

export function VisitingCardOrderForm({ page, tapUser, onGoToInbox }: Props) {
  const [template, setTemplate] = useState<VisitingCardTemplate>('minimal')
  const [finish, setFinish] = useState<Finish>('matte')
  const [designFileUrl, setDesignFileUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [address, setAddress] = useState<ShippingAddress>({ ...EMPTY_ADDRESS, name: page.name })
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [utrNumber, setUtrNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function updateAddress(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${tapUser.id}/card-design-${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('tap-avatars').upload(path, file)
    if (uploadError) {
      setError('Upload failed. ' + uploadError.message)
    } else {
      const { data } = supabase.storage.from('tap-avatars').getPublicUrl(path)
      setDesignFileUrl(data.publicUrl)
    }
    setUploading(false)
  }

  function validateForm() {
    if (template === 'upload' && !designFileUrl) return 'Please upload your card design file.'
    if (!address.name.trim()) return 'Recipient name is required.'
    if (!address.line1.trim()) return 'Address line 1 is required.'
    if (!address.city.trim()) return 'City is required.'
    if (!address.state.trim()) return 'State is required.'
    if (!/^\d{6}$/.test(address.pincode)) return 'Enter a valid 6-digit pincode.'
    if (!/^[6-9]\d{9}$/.test(address.phone)) return 'Enter a valid 10-digit Indian mobile number.'
    return ''
  }

  function handleProceedToPayment() {
    const err = validateForm()
    if (err) { setError(err); return }
    setError('')
    setStep('payment')
  }

  async function handleConfirmPayment() {
    if (utrNumber.trim().length < 6) {
      setError('Enter a valid UPI transaction reference (UTR) number.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await supabase.from('visiting_card_orders').insert({
        user_id: tapUser.id,
        page_id: page.id,
        template,
        finish,
        quantity: 100,
        design_file_url: designFileUrl || null,
        address,
        payment_reference: utrNumber.trim(),
      })
      setStep('success')
    } catch (e) {
      setError((e as Error).message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-brand-text">Order placed!</h3>
        <p className="text-sm text-brand-faint max-w-xs">
          Your visiting cards are being sent to print. Track the status anytime in your Inbox.
        </p>
        {onGoToInbox && (
          <Button onClick={onGoToInbox} className="mt-2">
            Go to Inbox
          </Button>
        )}
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-base font-semibold text-brand-text mb-1">Pay via UPI</h3>
          <p className="text-sm text-brand-faint">
            Send <span className="font-semibold text-brand-text">₹{PRICE}</span> to the UPI ID below,
            then enter your transaction reference to confirm the order.
          </p>
        </div>

        <div className="bg-brand-surface rounded-2xl p-5 border border-brand-border">
          <p className="text-xs font-medium text-brand-faint mb-2">Pay to UPI ID</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-base font-mono font-semibold text-brand-text">{UPI_ID}</span>
            <button
              onClick={copyUpiId}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-faint hover:text-brand-text border border-brand-border rounded-lg px-3 py-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex justify-between text-sm">
            <span className="text-brand-faint">Amount</span>
            <span className="font-semibold text-brand-text">₹{PRICE}</span>
          </div>
          <div className="flex justify-between text-sm mt-1.5">
            <span className="text-brand-faint">For</span>
            <span className="text-brand-muted">100 visiting cards · {finish}</span>
          </div>
        </div>

        <p className="text-xs text-brand-faint -mt-2">
          Pay via Google Pay, PhonePe, Paytm, or any UPI app.
        </p>

        <Input
          label="UPI Transaction Reference (UTR / Transaction ID)"
          value={utrNumber}
          onChange={(e) => setUtrNumber(e.target.value)}
          placeholder="e.g. 412345678901"
          hint="Find this in your UPI app under transaction details."
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep('form')} className="flex-1">Back</Button>
          <Button onClick={handleConfirmPayment} loading={loading} className="flex-1">Confirm order</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Card preview */}
      <VisitingCardPreview template={template} page={page} username={tapUser.username} />

      {/* Header */}
      <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-text">Visiting Cards</h3>
          <p className="text-sm text-brand-faint mt-0.5">
            85×54mm, double-sided, QR code linking to your Tap page. MOQ: 100 cards.
          </p>
        </div>
      </div>

      {/* Template */}
      <div>
        <p className="text-xs font-medium text-brand-faint mb-3">Card template</p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`text-left rounded-xl border-2 p-3 transition-all ${
                template === t.id ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-border hover:border-brand-muted'
              }`}
            >
              <div className={`h-8 w-full rounded-lg mb-2 flex items-center justify-center text-xs font-medium ${
                t.id === 'editorial'  ? 'bg-zinc-900 text-white' :
                t.id === 'minimal'   ? 'bg-white text-gray-600' :
                t.id === 'expressive'? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' :
                'border border-brand-border text-brand-faint'
              }`}>
                {t.id === 'upload' ? <Upload className="w-3.5 h-3.5" /> : 'Aa'}
              </div>
              <p className={`text-xs font-semibold ${template === t.id ? 'text-brand-gold' : 'text-brand-text'}`}>{t.label}</p>
              <p className="text-[11px] text-brand-faint">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload design */}
      {template === 'upload' && (
        <div>
          <p className="text-xs font-medium text-brand-faint mb-2">Upload design (PDF, PNG, or AI)</p>
          {designFileUrl ? (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 truncate">Design uploaded</span>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 h-24 border border-dashed border-brand-border rounded-xl cursor-pointer hover:border-brand-muted transition-colors">
              <Upload className="w-5 h-5 text-brand-faint" />
              <span className="text-sm text-brand-faint">{uploading ? 'Uploading…' : 'Click to upload'}</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
          )}
          <p className="text-xs text-brand-faint mt-1.5">QR code not auto-added to uploads — include it in your design.</p>
        </div>
      )}

      {/* Finish */}
      <div>
        <p className="text-xs font-medium text-brand-faint mb-2">Finish</p>
        <div className="grid grid-cols-2 gap-2">
          {(['matte', 'glossy'] as Finish[]).map((f) => (
            <button
              key={f}
              onClick={() => setFinish(f)}
              className={`rounded-xl border-2 py-3 capitalize text-sm font-medium transition-all ${
                finish === f
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                  : 'border-brand-border text-brand-muted hover:border-brand-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity + price */}
      <div className="flex items-center justify-between p-4 bg-brand-surface rounded-xl border border-brand-border">
        <div>
          <p className="text-sm font-medium text-brand-text">100 cards</p>
          <p className="text-xs text-brand-faint">Minimum order quantity</p>
        </div>
        <p className="text-lg font-bold text-brand-gold">₹{PRICE}</p>
      </div>

      {/* Shipping address */}
      <div>
        <p className="text-xs font-medium text-brand-faint mb-3">Shipping address</p>
        <div className="flex flex-col gap-3">
          <Input label="Recipient name" value={address.name} onChange={(e) => updateAddress('name', e.target.value)} placeholder="Full name" />
          <Input label="Address line 1" value={address.line1} onChange={(e) => updateAddress('line1', e.target.value)} placeholder="House / flat / office no., street" />
          <Input label="Address line 2 (optional)" value={address.line2} onChange={(e) => updateAddress('line2', e.target.value)} placeholder="Area, landmark" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={address.city} onChange={(e) => updateAddress('city', e.target.value)} placeholder="Hyderabad" />
            <Input label="State" value={address.state} onChange={(e) => updateAddress('state', e.target.value)} placeholder="Telangana" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Pincode" value={address.pincode} onChange={(e) => updateAddress('pincode', e.target.value)} placeholder="500001" maxLength={6} />
            <Input label="Phone" value={address.phone} onChange={(e) => updateAddress('phone', e.target.value)} placeholder="9876543210" type="tel" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button onClick={handleProceedToPayment} size="lg" className="w-full">
        Proceed to payment · ₹{PRICE}
      </Button>

      <p className="text-xs text-center text-brand-faint">
        Payment via UPI · Ships within 7–10 business days
      </p>
    </div>
  )
}
