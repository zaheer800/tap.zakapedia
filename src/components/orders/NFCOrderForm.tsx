import { useState } from 'react'
import { Wifi, CheckCircle, Copy, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Page, TapUser, ShippingAddress } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { NFCCardPreview } from './NFCCardPreview'

interface Props {
  page: Page
  tapUser: TapUser
  onGoToInbox?: () => void
}

const QUANTITIES = [
  { qty: 1, label: '1 card',  price: 299  },
  { qty: 3, label: '3 cards', price: 799  },
  { qty: 5, label: '5 cards', price: 1199 },
]

const EMPTY_ADDRESS: ShippingAddress = {
  name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '',
}

const UPI_ID = import.meta.env.VITE_UPI_ID as string

export function NFCOrderForm({ page, tapUser, onGoToInbox }: Props) {
  const [qty, setQty] = useState(1)
  const [nameOnCard, setNameOnCard] = useState(page.name)
  const [address, setAddress] = useState<ShippingAddress>({ ...EMPTY_ADDRESS, name: page.name })
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [utrNumber, setUtrNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const selected = QUANTITIES.find((q) => q.qty === qty) ?? QUANTITIES[0]

  function updateAddress(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  function validateForm() {
    if (!nameOnCard.trim()) return 'Name on card is required.'
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
      await supabase.from('nfc_orders').insert({
        user_id: tapUser.id,
        page_id: page.id,
        name_on_card: nameOnCard,
        quantity: qty,
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
          Your NFC card{qty > 1 ? 's are' : ' is'} being prepared. Track the status anytime in your Inbox.
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
            Send <span className="font-semibold text-brand-text">₹{selected.price}</span> to the UPI ID below,
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
            <span className="font-semibold text-brand-text">₹{selected.price}</span>
          </div>
          <div className="flex justify-between text-sm mt-1.5">
            <span className="text-brand-faint">For</span>
            <span className="text-brand-muted">{selected.label} · NFC Card</span>
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
      <NFCCardPreview username={tapUser.username} nameOnCard={nameOnCard} />

      {/* Header */}
      <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
          <Wifi className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-text">NFC Card</h3>
          <p className="text-sm text-brand-faint mt-0.5">
            NTAG213 PVC card pre-programmed with your Tap page. Tap to share instantly.
          </p>
        </div>
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
        <p className="text-xs font-medium text-brand-faint mb-2.5">Quantity</p>
        <div className="grid grid-cols-3 gap-2">
          {QUANTITIES.map(({ qty: q, label, price }) => (
            <button
              key={q}
              onClick={() => setQty(q)}
              className={`rounded-xl border-2 py-3 px-2 text-center transition-all ${
                qty === q
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                  : 'border-brand-border text-brand-muted hover:border-brand-muted'
              }`}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className={`text-xs mt-0.5 ${qty === q ? 'text-brand-gold/70' : 'text-brand-faint'}`}>₹{price}</p>
            </button>
          ))}
        </div>
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
        Proceed to payment · ₹{selected.price}
      </Button>

      <p className="text-xs text-center text-brand-faint">
        Payment via UPI · Ships within 3–5 business days
      </p>
    </div>
  )
}
