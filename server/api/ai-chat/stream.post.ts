import { z } from 'zod'
import { readJson, requestKeys, requireKey, processAI, providerError } from '../../utils/http'
import { quoteSchema } from '~/utils/quote-schema'
import { runAgent } from '../../utils/ai-chat/agent'
import type { AgentContext } from '../../utils/ai-chat/tools'
import type { MessageBlock } from '~/types/ai-chat'
const messageSchema = z.object({ role: z.enum(['user','assistant']), content: z.string().max(20000), timestamp: z.string().max(100) })
export default defineEventHandler(async event => {
  const keys = requestKeys(event); requireKey(keys.openai)
  const body = await readJson(event, z.object({ message: z.string().min(1).max(8000), history: z.array(messageSchema).max(80).default([]), quote: quoteSchema.nullable().default(null), userMessageIncluded: z.boolean().optional() }), 2*1024*1024)
  const context: AgentContext = { quote: body.quote, keys }
  return processAI(async () => {
    const blocks: MessageBlock[] = []
    let response: string
    try { response = await runAgent(body.history, body.message, b => blocks.push(b), context) }
    catch(e) { providerError(e) }
    const message = { role: 'assistant' as const, content: response.replace(/__quoteId:[a-f0-9-]+__/g,''), blocks, timestamp: new Date().toISOString() }
    return { message, quoteId: context.quote?.id || null, quote: context.quote }
  })
})
