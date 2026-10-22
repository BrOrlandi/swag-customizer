import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError } from 'h3'
import { fileStore, filePublicUrl } from './file-store'
import { loadProductsServer } from './ai-chat/products-loader'
import type { InputImage } from './ai-images'
export async function readImageInput(url: string): Promise<InputImage> {
  const match = url.match(/\/api\/files\/([a-f0-9-]+)$/)
  if (match && url === filePublicUrl(match[1]!)) {
    const file = await fileStore().get(match[1]!)
    return { data: file.data.toString('base64'), mimeType: 'image/png' }
  }
  const products = await loadProductsServer()
  const catalog = JSON.stringify(products)
  if (!catalog.includes(JSON.stringify(url))) throw createError({ statusCode: 400, message: 'Imagem fora do catálogo.' })
  if (/^\/images\/products\/[a-f0-9]+\.(png|jpg|webp)$/.test(url)) {
    const raw = await useStorage('assets:server').getItemRaw<Buffer>(`catalog:${url.split('/').pop()}`)
    const data = raw ? Buffer.from(raw) : await readFile(join(process.cwd(),'public',url))
    return { data: data.toString('base64'), mimeType: url.endsWith('.webp') ? 'image/webp' : url.endsWith('.jpg') ? 'image/jpeg' : 'image/png' }
  }
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || !['ik.imagekit.io','cdn.shopify.com'].includes(parsed.hostname)) throw createError({ statusCode: 400, message: 'Imagem não permitida.' })
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw createError({ statusCode: 404, message: 'Imagem indisponível.' })
  const data = Buffer.from(await response.arrayBuffer())
  if (data.length > 10*1024*1024) throw createError({ statusCode: 413, message: 'Imagem muito grande.' })
  return { data: data.toString('base64'), mimeType: (response.headers.get('content-type')?.split(';')[0] || 'image/png') as InputImage['mimeType'] }
}
