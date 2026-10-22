export interface Quote {
  id: string
  contact_name: string
  company_name: string
  contact_email: string
  status: 'draft' | 'ready'
  total_price: number
  total_items: number
  logo_url: string | null
  logo_processed_url: string | null
  ai_photo_url: string | null
  created_at: string
  updated_at: string
  last_step?: number
  source?: 'wizard' | 'ai-chat'
  deleted_at?: string | null
}

export interface QuoteItem {
  id: string
  quote_id: string
  product_id: string
  product_name: string
  variant_id: string
  variant_color_name: string
  size_id: string
  size_name: string
  quantity: number
  unit_price: number
  subtotal: number
  personalized_image_url: string | null
  logo_position: { left: number; top: number; scaleX: number; scaleY: number; angle: number } | null
  logo_color_mode: string | null
  created_at: string
}

export type StoredQuote = Quote & { quote_items: QuoteItem[] }
