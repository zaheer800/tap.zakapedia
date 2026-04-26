import { useState } from 'react'
import { Package, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Page, TapUser, ShippingAddress } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface Props {
  page: Page
  tapUser: TapUser
}

const QUANTITIES = [
  { qty: 1, label: '1 card', price: 299 },
  { qty: 3, label: '3 cards', price: 799 },
  { qty: 5, label: '5 cards', price: 1199 },
]

const EMPTY_ADDRESS: ShippingAddress = {
  name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '',
}

export function NFCOrderForm({ page, tapUser }: Props) {
  const [qty, setQty] = useState(1)
  const [nameOnCard, setNameOnCard] = useState(page.name)
  const [address, setAddress] = useState<ShippingAddress>({ ...EMPTY_ADDRESS, name: page.name })
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selected = QUANTITIES.find((q) => q.qty === qty) ?? QUANTITIES[0]

  function updateAddress(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    if (!nameOnCard.trim()) return 'Name on card is required.'
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
      await openRazorpay(selected.price * 100, async (paymentId: string) => {
        await supabase.from('nfc_orders').insert({
          user_id: tapUser.id,
          page_id: page.id,
          name_on_card: nameOnCard,
          quantity: qty,
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
          Your NFC card{qty > 1 ? 's are' : ' is'} being prepared. You'll receive an update
          when {qty > 1 ? 'they are' : 'it is'} shipped.
        </p>
        <p className="text-xs text-gray-400">
          Card URL: <span className="font-mono">tap.zakapedia.in/{tapUser.username}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">NFC Card</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            NTAG213 PVC card pre-programmed with your Tap page. Tap to share instantly.
          </p>
        </div>
      </div>

      {/* Card URL notice */}
      <div className="text-sm text-gray-500 bg-blue-50 rounded-xl p-4">
        Card will open: <span className="font-mono font-medium text-blue-700">tap.zakapedia.in/{tapUser.username}</span>
        <br />
        <span className="text-xs">NFC taps appear as "NFC Tap" in your analytics.</span>
      </div>

      {/* Name on card */}
      <Input
        label="Name printed on card (optional)"
        value={nameOnCard}
        onChange={(e) => setNameOnCard(e.target.value)}
        placeholder={page.name || 'Your name'}
        maxLength={40}
      />

      {/* Quantity */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Quantity</p>
        <div className="grid grid-cols-3 gap-2">
          {QUANTITIES.map(({ qty: q, label, price }) => (
            <button
              key={q}
              onClick={() => setQty(q)}
              className={`
                rounded-xl border-2 py-3 px-2 text-center transition-all
                ${qty === q ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className={`text-xs mt-0.5 ${qty === q ? 'text-gray-300' : 'text-gray-500'}`}>
                ₹{price}
              </p>
            </button>
          ))}
        </div>
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
        Pay ₹{selected.price} · {selected.label}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Secure payment via Razorpay · Ships within 3–5 business days
      </p>
    </div>
  )
}

// Opens Razorpay checkout and calls onSuccess with the payment ID.
// Requires VITE_RAZORPAY_KEY_ID in env.
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
        description: 'NFC Card Order',
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
