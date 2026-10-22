import { createError, defineEventHandler, getHeader, getRequestIP, setHeader } from 'h3'
const buckets = new Map<string, { count: number; until: number }>()
export default defineEventHandler(event => {
  if (!event.path.startsWith('/api/')) return
  const config = useRuntimeConfig(event)
  const origin = getHeader(event, 'origin')
  const allowed = String(config.allowedOrigins).split(',').map(s => s.trim()).filter(Boolean)
  if (origin) {
    if (!allowed.includes(origin)) throw createError({ statusCode: 403, message: 'Origem não permitida.' })
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Vary', 'Origin')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, X-OpenAI-Key, X-Gemini-Key, X-Chat-Provider, X-Chat-Model, X-Image-Model')
    setHeader(event, 'Access-Control-Max-Age', 600)
  }
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  if (event.method === 'OPTIONS') { event.node.res.statusCode = 204; return '' }
  if (!event.path.startsWith('/api/files/') && !event.path.startsWith('/api/health')) setHeader(event, 'Cache-Control', 'no-store')
  if (Number(getHeader(event, 'content-length') || 0) > 24 * 1024 * 1024) throw createError({ statusCode: 413, message: 'Pedido muito grande.' })
  if (event.method !== 'POST') return
  const now = Date.now()
  for (const [key, bucket] of buckets) if (bucket.until < now) buckets.delete(key)
  // Direct socket address is used unless a trusted reverse proxy supplies X-Real-IP.
  const address = getRequestIP(event) || 'unknown'
  const bucket = buckets.get(address)
  if (bucket && bucket.count >= 30) throw createError({ statusCode: 429, message: 'Muitos pedidos. Aguarde um minuto.' })
  if (bucket) bucket.count++
  else if (buckets.size < 10000) buckets.set(address, { count: 1, until: now + 60000 })
})
