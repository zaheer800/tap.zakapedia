export type Theme = 'editorial' | 'minimal' | 'expressive'
export type OrderStatus = 'placed' | 'shipped' | 'delivered'
export type PrintingStatus = 'placed' | 'printing' | 'shipped' | 'delivered'
export type VisitingCardTemplate = 'editorial' | 'minimal' | 'expressive' | 'upload'
export type Finish = 'matte' | 'glossy'

export interface TapUser {
  id: string
  username: string
  email: string
  created_at: string
}

export interface Page {
  id: string
  user_id: string
  theme: Theme
  accent_color: string
  name: string
  bio: string
  avatar_url: string | null
  published: boolean
}

export interface Link {
  id: string
  page_id: string
  title: string
  url: string
  icon: string
  position: number
  created_at: string
}

export interface ShippingAddress {
  name: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  phone: string
}

export interface NFCOrder {
  id: string
  user_id: string
  page_id: string
  name_on_card: string
  address: ShippingAddress
  quantity: number
  status: OrderStatus
  razorpay_payment_id: string | null
  created_at: string
}

export interface VisitingCardOrder {
  id: string
  user_id: string
  page_id: string
  template: VisitingCardTemplate
  finish: Finish
  quantity: number
  design_file_url: string | null
  address: ShippingAddress
  status: PrintingStatus
  razorpay_payment_id: string | null
  created_at: string
}
