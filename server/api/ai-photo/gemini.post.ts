import { z } from 'zod'
import { readJson, requestKeys, requireKey, processAI, providerError } from '../../utils/http'
import { inputImageSchema, geminiImage } from '../../utils/ai-images'
export default defineEventHandler(async event => {
  const key = requireKey(requestKeys(event).gemini)
  const body = await readJson(event, z.object({ prompt: z.string().min(1).max(12000), imageParts: z.array(z.object({ inlineData: inputImageSchema })).max(10) }))
  return processAI(async () => { try { return await geminiImage(key, body.prompt, body.imageParts.map(p => p.inlineData)) } catch(e) { providerError(e) } })
})
