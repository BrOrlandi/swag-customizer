import type { ProductCategory } from './product'

export type LogoPosition = { left: number; top: number; scaleX: number; scaleY: number; angle: number }

export interface CartItem {
  productId: string
  productName: string
  variantId: string
  colorName: string
  sizeId: string
  sizeName: string
  quantity: number
  unitPrice: number
  mockupUrl: string | null
  personalizedImageUrl: string | null
  logoPosition: LogoPosition | null
  logoColorMode: 'color' | 'black' | 'white'
}

export interface WizardState {
  currentStep: number
  quoteId: string | null
  contactName: string
  companyName: string
  contactEmail: string
  logoFile: File | null
  logoUrl: string | null
  logoProcessedUrl: string | null
}

export const WIZARD_STEPS: Array<{
  id: string
  label: string
  categories?: ProductCategory[]
}> = [
  { id: 'info', label: 'Informações' },
  { id: 'mochilas-bolsas', label: 'Mochilas e Bolsas', categories: ['mochilas', 'bolsas', 'malas'] },
  { id: 'garrafas-copos', label: 'Garrafas e Copos', categories: ['garrafas', 'copos'] },
  { id: 'acessorios', label: 'Acessórios', categories: ['acessorios'] },
  { id: 'suplementos', label: 'Suplementos', categories: ['suplementos'] },
  { id: 'personalize', label: 'Personalizar' },
  { id: 'ai-photo', label: 'Prévia do Kit' },
  { id: 'summary', label: 'Resumo' },
]
