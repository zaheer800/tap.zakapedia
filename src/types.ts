export type Theme = 'editorial' | 'minimal' | 'expressive'
export type OrderStatus = 'placed' | 'printing' | 'shipped' | 'delivered' | 'cancelled'
export type PrintingStatus = 'placed' | 'printing' | 'shipped' | 'delivered' | 'cancelled'
export type VisitingCardTemplate = 'editorial' | 'minimal' | 'expressive' | 'upload'
export type Finish = 'matte' | 'glossy'

export interface TapUser {
  id: string
  username: string
  email: string
  created_at: string
  user_type?: string
}

export interface Page {
  id: string
  user_id: string
  theme: Theme
  accent_color: string
  name: string
  bio: string
  avatar_url: string | null
  banner_url?: string | null
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
  payment_reference: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  page_id: string
  sender_name: string
  message: string
  read: boolean
  created_at: string
}

export interface OrderMessage {
  id: string
  user_id: string
  order_id: string | null
  order_type: 'nfc' | 'visiting_card' | 'support'
  message: string
  from_admin: boolean
  read: boolean
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
  payment_reference: string | null
  created_at: string
}
