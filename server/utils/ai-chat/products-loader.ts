import { readFileSync } from 'fs'
import { join } from 'path'
import type { NormalizedProduct } from '~/types/product'

let cachedProducts: NormalizedProduct[] | null = null

export async function loadProductsServer(): Promise<NormalizedProduct[]> {
  if (cachedProducts) return cachedProducts

  // Strategy 1: Read from filesystem (works in dev)
  const possiblePaths = [
    join(process.cwd(), 'public', 'data', 'products.json'),
    join(process.cwd(), '.output', 'public', 'data', 'products.json'),
  ]

  for (const filePath of possiblePaths) {
    try {
      const raw = readFileSync(filePath, 'utf-8')
      cachedProducts = JSON.parse(raw) as NormalizedProduct[]
      console.log(`[products-loader] Loaded ${cachedProducts.length} products from ${filePath}`)
      return cachedProducts
    } catch {
      // Try next
    }
  }

  // Strategy 2: Read from Nitro server assets (server/assets/data/) — works on Vercel
  try {
    const storage = useStorage('assets:server')
    const raw = await storage.getItem('data:products.json')
    if (raw) {
      cachedProducts = (typeof raw === 'string' ? JSON.parse(raw) : raw) as NormalizedProduct[]
      console.log(`[products-loader] Loaded ${cachedProducts.length} products from server assets`)
      return cachedProducts
    }
  } catch (e) {
    console.error('[products-loader] Server assets failed:', e)
  }

  console.error('[products-loader] Could not load products.json from any source')
  return []
}

export async function searchProducts(query?: string, category?: string): Promise<NormalizedProduct[]> {
  const products = await loadProductsServer()

  let filtered = products

  if (category) {
    filtered = filtered.filter((p) => p.category === category)
  }

  if (query) {
    const lower = query.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        (p.description && p.description.toLowerCase().includes(lower)),
    )
  }

  return filtered
}

export async function getProductById(productId: string): Promise<NormalizedProduct | null> {
  const products = await loadProductsServer()
  return products.find((p) => p.id === productId) ?? null
}

export async function getAvailableCategories(): Promise<string[]> {
  const products = await loadProductsServer()
  const categories = new Set(products.map((p) => p.category))
  return [...categories]
}
