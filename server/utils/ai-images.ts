import OpenAI from 'openai'
import { z } from 'zod'
import { createError } from 'h3'
export const inputImageSchema = z.object({ data: z.string().min(1).max(14*1024*1024).regex(/^[A-Za-z0-9+/]+={0,2}$/), mimeType: z.enum(['image/png','image/jpeg','image/webp']), filename: z.string().max(100).optional() })
export type InputImage = z.infer<typeof inputImageSchema>
export async function openaiImage(key: string, prompt: string, images: InputImage[]) {
  const client = new OpenAI({ apiKey: key, maxRetries: 0, timeout: 240000 })
  const model = String(useRuntimeConfig().openaiImageModel)
  const result = images.length
    ? await client.images.edit({ model, prompt, image: images.map((i,n) => new File([Buffer.from(i.data,'base64')], `${n}.${i.mimeType === 'image/png' ? 'png' : i.mimeType === 'image/webp' ? 'webp' : 'jpg'}`, { type: i.mimeType })), size: '1024x1024', quality: 'high' })
    : await client.images.generate({ model, prompt, size: '1024x1024', quality: 'high' })
  const data = result.data?.[0]?.b64_json
  if (!data) throw createError({ statusCode: 502, message: 'O provedor não devolveu uma imagem.' })
  return { data, mimeType: 'image/png' }
}
export async function geminiImage(key: string, prompt: string, images: InputImage[]) {
  const model = String(useRuntimeConfig().geminiImageModel)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, signal: AbortSignal.timeout(240000),
    body: JSON.stringify({ contents: [{ parts: [...images.map(i => ({ inlineData: { data: i.data, mimeType: i.mimeType } })), { text: prompt }] }], generationConfig: { responseModalities: ['TEXT','IMAGE'] } }),
  })
  if (!response.ok) throw { status: response.status }
  const result = await response.json()
  for (const candidate of result.candidates || []) for (const part of candidate.content?.parts || []) if (part.inlineData) return { data: part.inlineData.data as string, mimeType: part.inlineData.mimeType as string }
  throw createError({ statusCode: 502, message: 'O provedor não devolveu uma imagem.' })
}
