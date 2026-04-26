import { useState } from 'react'
import { CreditCard, Upload, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Page, TapUser, VisitingCardTemplate, Finish, ShippingAddress } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface Props {
  page: Page
  tapUser: TapUser
}

const TEMPLATES: { id: VisitingCardTemplate; label: string; desc: string }[] = [
  { id: 'editorial', label: 'Editorial', desc: 'Bold typography, dark aesthetic' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean layout, generous whitespace' },
  { id: 'expressive', label: 'Expressive', desc: 'Colourful, playful, warm' },
  { id: 'upload', label: 'Custom upload', desc: 'Upload your own design for print' },
]

const EMPTY_ADDRESS: ShippingAddress = {
  name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '',
}

const PRICE = 599 // per 100 cards, TBD after vendor quote

export function VisitingCardOrderForm({ page, tapUser }: Props) {
  const [template, setTemplate] = useState<VisitingCardTemplate>('minimal')
  const [finish, setFinish] = useState<Finish>('matte')
  const [designFileUrl, setDesignFileUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [address, setAddress] = useState<ShippingAddress>({ ...EMPTY_ADDRESS, name: page.name })
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateAddress(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${tapUser.id}/card-design-${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage
      .from('tap-avatars')
      .upload(path, file)
    if (uploadError) {
      setError('Upload failed. ' + uploadError.message)
    } else {
      const { data } = supabase.storage.from('tap-avatars').getPublicUrl(path)
      setDesignFileUrl(data.publicUrl)
    }
    setUploading(false)
  }

  function validate() {
    if (template === 'upload' && !designFileUrl) return 'Please upload your card design file.'
    if (!address.name.trim()) return 'Recipient name is required.'
    if (!address.line1.trim()) return 'Address line 1 is required.'
    if (!address.city.trim()) return 'City is required.'
    if (!address.state.trim()) return 'State is required.'
    if (!/^\d{6}$/.test(address.pincode)) return 'Enter a valid 6-digit pincode.'
    if (!/^[6-9]\d{9}$/.test(address.phone)) return 'Enter a valid 10-digit Indian mobile number.'
    return ''
  }

  async function handlePayment() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    try {
      await openRazorpay(PRICE * 100, async (paymentId: string) => {
        await supabase.from('visiting_card_orders').insert({
          user_id: tapUser.id,
          page_id: page.id,
          template,
          finish,
          quantity: 100,
          design_file_url: designFileUrl || null,
          address,
          razorpay_payment_id: paymentId,
        })
        setStep('success')
      })
    } catch (e) {
      setError((e as Error).message ?? 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Order placed!</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Your visiting cards are being sent to print. You'll receive an update when they ship.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Visiting Cards</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            85×54mm, double-sided, QR code linking to your Tap page. MOQ: 100 cards.
          </p>
        </div>
      </div>

      {/* Template */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-3">Card template</p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`
                text-left rounded-xl border-2 p-3 transition-all
                ${template === t.id ? 'border-gray-900' : 'border-gray-100 hover:border-gray-200'}
              `}
            >
              <div className={`
                h-8 w-full rounded-lg mb-2 flex items-center justify-center text-xs font-medium
                ${t.id === 'editorial' ? 'bg-zinc-900 text-white' :
                  t.id === 'minimal' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                  t.id === 'expressive' ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' :
                  'bg-white border-2 border-dashed border-gray-200 text-gray-400'}
              `}>
                {t.id === 'upload' ? <Upload className="w-3.5 h-3.5" /> : 'Aa'}
              </div>
              <p className="text-xs font-semibold text-gray-900">{t.label}</p>
              <p className="text-[11px] text-gray-400">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload design file */}
      {template === 'upload' && (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Upload design (PDF, PNG, or AI)</p>
          {designFileUrl ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700 truncate">Design uploaded</span>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {uploading ? 'Uploading…' : 'Click to upload'}
              </span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.ai"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            QR code not auto-added to uploads — include it in your design.
          </p>
        </div>
      )}

      {/* Finish */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Finish</p>
        <div className="grid grid-cols-2 gap-2">
          {(['matte', 'glossy'] as Finish[]).map((f) => (
            <button
              key={f}
              onClick={() => setFinish(f)}
              className={`
                rounded-xl border-2 py-3 capitalize text-sm font-medium transition-all
                ${finish === f ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-medium text-gray-900">100 cards</p>
          <p className="text-xs text-gray-500">Minimum order quantity</p>
        </div>
        <p className="text-lg font-bold text-gray-900">₹{PRICE}</p>
      </div>

      {/* Shipping address */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-3">Shipping address</p>
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button onClick={handlePayment} loading={loading} size="lg" className="w-full">
        Pay ₹{PRICE} · 100 cards
      </Button>

      <p className="text-xs text-center text-gray-400">
        Secure payment via Razorpay · Ships within 7–10 business days
      </p>
    </div>
  )
}

function openRazorpay(amountPaise: number, onSuccess: (paymentId: string) => Promise<void>) {
  return new Promise<void>((resolve, reject) => {
    const script = document.getElementById('razorpay-sdk') ?? (() => {
      const s = document.createElement('script')
      s.id = 'razorpay-sdk'
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(s)
      return s
    })()

    const proceed = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: 'INR',
        name: 'Tap by Zakapedia',
        description: 'Visiting Card Order (100 cards)',
        handler: async (response: { razorpay_payment_id: string }) => {
          await onSuccess(response.razorpay_payment_id)
          resolve()
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled.')),
        },
        theme: { color: '#111827' },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    }

    if ((window as unknown as Record<string, unknown>)['Razorpay']) {
      proceed()
    } else {
      script.addEventListener('load', proceed)
      script.addEventListener('error', () => reject(new Error('Failed to load Razorpay.')))
    }
  })
}
