import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface NormalizedProduct {
  id: string
  name: string
  category: string
  basePrice: number
  oldPrice: number | null
  customizable: boolean
  source: 'gocase' | 'shopify'
  imageUrl: string | null
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

const CATEGORY_MAP: Record<string, string> = {
  backpackcd: 'mochilas',
  mochilarodinhabts: 'mochilas',
  travelbagcd: 'bolsas',
  totebagcd: 'bolsas',
  garrafaebook: 'garrafas',
  garrafaflipproebook: 'garrafas',
  copoebook: 'copos',
  tacatermicaebook: 'copos',
  necessairecd: 'acessorios',
  estojobts: 'acessorios',
  lunchbagcd: 'acessorios',
  lancheirabts: 'acessorios',
  clutchcd: 'acessorios',
  capanotebookslimcd: 'acessorios',
  travelcasecd: 'malas',
}

// Known color hex values from the root products.json and common colors
const COLOR_HEX_MAP: Record<string, string> = {
  branco: '#ffffff',
  branca: '#ffffff',
  'off-white': '#f5f5dc',
  offwhite: '#f5f5dc',
  'off white': '#f5f5dc',
  preto: '#2f2f2f',
  preta: '#2f2f2f',
  chumbo: '#4a4a4a',
  cinza: '#808080',
  'rosa claro': '#fbd4cb',
  rosa: '#e06575',
  pink: '#ff69b4',
  rosé: '#d4917b',
  'verde menta': '#b0ebc5',
  verde: '#4caf50',
  'verde militar': '#4b5320',
  'azul lavanda': '#a0a9ca',
  'azul claro': '#87ceeb',
  'azul escuro': '#1a3a5c',
  'azul marinho': '#003e73',
  azul: '#4a90d9',
  lilás: '#cebbdf',
  lilas: '#cebbdf',
  roxo: '#7b2d8e',
  marrom: '#6b4226',
  vinho: '#722f37',
  'vinho glitter': '#722f37',
  'salmão glitter': '#fa8072',
  salmao: '#fa8072',
  'verde oliva': '#556b2f',
  nude: '#e8c4a0',
  caramelo: '#c68e5b',
  areia: '#c2b280',
  bege: '#d4c5a9',
  laranja: '#f57c20',
  turquesa: '#40bfa3',
  vermelha: '#d32f2f',
  vermelho: '#d32f2f',
  melancia: '#fc6c85',
  lemon: '#d4e157',
  açaí: '#4b2d5e',
  creme: '#f5e6c8',
  'degradê azul / rosa': '#7b8fd4',
  'degradê rosa / lilás': '#d4a0c5',
  'rosa / lilás': '#c88fbf',
}

function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim()
  if (COLOR_HEX_MAP[lower]) return COLOR_HEX_MAP[lower]
  // Try matching partial: "Branco + Alça Esporte" -> "branco", "Casual Pro - Rosa" -> "rosa"
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(key)) return hex
  }
  return null
}

function normalizeGocaseProduct(data: any): NormalizedProduct {
  const slug = data.sku || data.slug
  const category = CATEGORY_MAP[data.product_type_code] || 'acessorios'

  const variants = (data.variants || []).map((v: any) => ({
    id: v.color_code,
    colorName: v.color_name,
    colorHex: getColorHex(v.color_name),
    sizes: (v.sizes || []).map((s: any) => ({
      id: String(s.case_device_id),
      name: s.size_name,
      inStock: s.in_stock,
      additionalPrice: parseFloat(s.additional_price) || 0,
      mockupUrl: s.mockup_url || null,
    })),
  }))

  // Get an image URL from the first variant's first size mockup
  let imageUrl: string | null = null
  if (variants.length > 0 && variants[0].sizes.length > 0) {
    imageUrl = variants[0].sizes[0].mockupUrl
  }

  return {
    id: slug,
    name: data.name,
    category,
    basePrice: parseFloat(data.price) || 0,
    oldPrice: data.old_price ? parseFloat(data.old_price) : null,
    customizable: true,
    source: 'gocase',
    imageUrl,
    variants,
  }
}

function normalizeShopifyProduct(data: any): NormalizedProduct {
  const handle = data.handle
  const isRituaria = data.vendor === 'Rituária'

  // Shopify supplements have a single "Default Title" variant
  const variants = (data.variants || []).map((v: any) => ({
    id: String(v.id),
    colorName: v.title === 'Default Title' ? 'Padrão' : v.title,
    colorHex: null,
    sizes: [
      {
        id: String(v.id),
        name: v.title === 'Default Title' ? 'Único' : v.title,
        inStock: true,
        additionalPrice: 0,
        mockupUrl: v.image_url || (data.images?.[0]?.src ?? null),
      },
    ],
  }))

  const imageUrl = data.images?.[0]?.src || null

  return {
    id: handle,
    name: data.title,
    category: isRituaria ? 'suplementos' : 'garrafas',
    basePrice: parseFloat(data.variants?.[0]?.price) || 0,
    oldPrice: data.variants?.[0]?.compare_at_price
      ? parseFloat(data.variants[0].compare_at_price)
      : null,
    customizable: !isRituaria,
    source: 'shopify',
    imageUrl,
    variants,
  }
}

function isShopifyFormat(data: any): boolean {
  return 'handle' in data && 'vendor' in data
}

function main() {
  const productsDir = join(__dirname, '..', 'product_scrapping', 'products')
  const outputPath = join(__dirname, '..', 'public', 'data', 'products.json')

  const files = readdirSync(productsDir).filter((f) => f.endsWith('.json'))
  const products: NormalizedProduct[] = []

  for (const file of files) {
    const filePath = join(productsDir, file)
    const raw = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)

    if (isShopifyFormat(data)) {
      products.push(normalizeShopifyProduct(data))
    } else {
      products.push(normalizeGocaseProduct(data))
    }
  }

  // Sort by category then name
  products.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return a.name.localeCompare(b.name)
  })

  // Ensure output directory exists
  mkdirSync(join(__dirname, '..', 'public', 'data'), { recursive: true })

  writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8')
  console.log(`Normalized ${products.length} products -> ${outputPath}`)

  // Print summary
  const byCat: Record<string, number> = {}
  for (const p of products) {
    byCat[p.category] = (byCat[p.category] || 0) + 1
  }
  console.log('By category:', byCat)
}

main()
