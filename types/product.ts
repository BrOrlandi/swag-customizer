export type ProductCategory =
  | 'mochilas'
  | 'bolsas'
  | 'garrafas'
  | 'copos'
  | 'acessorios'
  | 'malas'
  | 'suplementos'

export interface ProductSize {
  id: string
  name: string
  inStock: boolean
  additionalPrice: number
  mockupUrl: string | null
}

export interface ProductVariant {
  id: string
  colorName: string
  colorHex: string | null
  sizes: ProductSize[]
}

export interface ProductDimensions {
  height_cm: number
  width_cm: number
  depth_cm: number
  description: string
}

export interface ProductReferenceImage {
  colorName: string
  colorCode: string
  imageUrl: string
}

export interface NormalizedProduct {
  id: string
  name: string
  category: ProductCategory
  basePrice: number
  oldPrice: number | null
  customizable: boolean
  source: 'gocase' | 'shopify'
  imageUrl: string | null
  productUrl: string | null
  dimensions: ProductDimensions | null
  description: string | null
  referenceImages: ProductReferenceImage[]
  variants: ProductVariant[]
}
