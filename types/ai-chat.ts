export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  blocks?: MessageBlock[]
  loading?: boolean
  timestamp: string
}

export type MessageBlock =
  | TextBlock
  | ProductCardsBlock
  | CartSummaryBlock
  | LogoUploadBlock
  | ProposalPreviewBlock
  | ImageBlock

export interface TextBlock {
  type: 'text'
  content: string
}

export interface ProductCardData {
  id: string
  name: string
  category: string
  basePrice: number
  oldPrice: number | null
  imageUrl: string | null
  customizable: boolean
  variants: Array<{
    id: string
    colorName: string
    colorHex: string | null
    sizes: Array<{
      id: string
      name: string
      inStock: boolean
      additionalPrice: number
      mockupUrl: string | null
    }>
  }>
}

export interface ProductCardsBlock {
  type: 'product_cards'
  products: ProductCardData[]
}

export interface CartSummaryItem {
  id: string
  productName: string
  colorName: string
  sizeName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CartSummaryData {
  quoteId: string
  items: CartSummaryItem[]
  totalItems: number
  totalPrice: number
}

export interface CartSummaryBlock {
  type: 'cart_summary'
  data: CartSummaryData
}

export interface LogoUploadBlock {
  type: 'logo_upload'
  quoteId: string
}

export interface ProposalPreviewBlock {
  type: 'proposal_preview'
  quoteId: string
  totalItems: number
  totalPrice: number
}

export interface ImageBlock {
  type: 'image'
  url: string
  alt?: string
  transparent?: boolean
}

export interface ChatSession {
  id: string
  quote_id: string | null
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export interface AiChatStreamEvent {
  type: 'token' | 'block' | 'session' | 'done' | 'error'
  data: string | MessageBlock | { sessionId: string; quoteId?: string } | null
}
