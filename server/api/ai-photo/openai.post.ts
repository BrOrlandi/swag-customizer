import { z } from 'zod'
import { readJson, requestKeys, requireKey, processAI, providerError } from '../../utils/http'
import { inputImageSchema, openaiImage } from '../../utils/ai-images'
export default defineEventHandler(async event => {
  const key = requireKey(requestKeys(event).openai)
  const body = await readJson(event, z.object({ prompt: z.string().min(1).max(12000), images: z.array(inputImageSchema).max(10) }))
  return processAI(async () => { try { return await openaiImage(key, body.prompt, body.images) } catch(e) { providerError(e) } })
})
