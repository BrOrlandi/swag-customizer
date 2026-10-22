import { createError, getHeader, type H3Event } from 'h3'
import type { z } from 'zod'
export async function readJson<T>(event: H3Event, schema: z.ZodType<T>, maxBytes = 24 * 1024 * 1024): Promise<T> {
  const chunks: Buffer[] = []; let size = 0
  for await (const chunk of event.node.req) {
    const bytes = Buffer.from(chunk); size += bytes.length
    if (size > maxBytes) throw createError({ statusCode: 413, message: 'Pedido muito grande.' })
    chunks.push(bytes)
  }
  let body: unknown
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) }
  catch { throw createError({ statusCode: 400, message: 'JSON inválido.' }) }
  const result = schema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: 'Dados inválidos no pedido.' })
  return result.data
}
export function requestKeys(event: H3Event) {
  const c = useRuntimeConfig(event)
  // Environment keys are opt-in for LOCAL development and never enabled in production.
  const local = process.env.NODE_ENV !== 'production' && String(c.allowEnvKeys) === 'true'
  return {
    openai: getHeader(event, 'x-openai-key')?.trim() || (local ? String(c.openaiApiKey) : ''),
    gemini: getHeader(event, 'x-gemini-key')?.trim() || (local ? String(c.geminiApiKey) : ''),
  }
}
export function requireKey(key: string) {
  if (!key || key.length > 512 || /[\r\n]/.test(key)) throw createError({ statusCode: 400, message: 'Configure sua chave de API no topo da página.' })
  return key
}
export function providerError(error: unknown): never {
  const status = Number((error as any)?.status || (error as any)?.statusCode)
  const message = status === 401 || status === 403 ? 'Chave inválida ou sem acesso ao modelo.' : status === 429 ? 'Limite de uso ou saldo do provedor atingido.' : 'Não foi possível concluir o processamento de IA. Verifique sua chave, o acesso ao modelo e tente novamente.'
  throw createError({ statusCode: [400,401,403,429].includes(status) ? status : 502, message })
}
let active = 0
export async function processAI<T>(work: () => Promise<T>) {
  if (active >= 4) throw createError({ statusCode: 429, message: 'Servidor ocupado. Tente novamente em instantes.' })
  active++
  try { return await work() } finally { active-- }
}
