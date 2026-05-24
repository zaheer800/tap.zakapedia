import type { LucideIcon } from 'lucide-react'
import {
  User, Sparkles, Link, Briefcase, Zap, GraduationCap,
  ShoppingBag, MapPin, MessageCircle, CalendarDays, IndianRupee, Mic, Phone,
} from 'lucide-react'
import type { ProfileType } from '../types'

export const SECTION_META: Record<string, { label: string; desc: string; icon: LucideIcon }> = {
  about:            { label: 'About the Shop',      desc: 'What you sell or your business story',  icon: User },
  latest_post:      { label: 'Latest Post',         desc: 'Your most recent content or article', icon: Sparkles },
  links:            { label: 'Links',               desc: 'Social platforms, websites, and more', icon: Link },
  services:         { label: 'Services',            desc: 'What you offer with pricing',          icon: Briefcase },
  skills:           { label: 'Skills',              desc: 'Tag-style skill chips',                icon: Zap },
  credentials:      { label: 'Credentials',         desc: 'Qualifications and certifications',    icon: GraduationCap },
  products:         { label: 'Products / Menu',     desc: 'Product catalog with WhatsApp ordering', icon: ShoppingBag },
  hours_location:   { label: 'Hours & Location',    desc: 'Opening hours and Maps link',          icon: MapPin },
  whatsapp_order:   { label: 'WhatsApp Order',      desc: 'One-tap order CTA button',             icon: MessageCircle },
  book_appointment: { label: 'Book Appointment',    desc: 'WhatsApp-based booking request',       icon: CalendarDays },
  upi_payment:      { label: 'UPI Payment',         desc: 'GPay / PhonePe / Paytm QR',           icon: IndianRupee },
  talks:            { label: 'Talks',               desc: 'Talks, events, and speaking history',  icon: Mic },
  contact:          { label: 'Contact / CTA',       desc: 'Email and phone contact details',      icon: Phone },
}

export const SECTIONS_BY_TYPE: Record<ProfileType, string[]> = {
  creator:      ['latest_post', 'links', 'contact'],
  professional: ['services', 'skills', 'links', 'contact'],
  business:     ['about', 'products', 'whatsapp_order', 'hours_location', 'upi_payment', 'links', 'contact'],
  service_pro:  ['credentials', 'book_appointment', 'services', 'upi_payment', 'links', 'contact'],
  speaker:      ['talks', 'links', 'contact'],
}

export const DEFAULT_PORTFOLIO_SLUG: Record<ProfileType, string> = {
  creator:      'showcase',
  professional: 'portfolio',
  business:     'menu',
  service_pro:  'portfolio',
  speaker:      'cv',
}
