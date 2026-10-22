import type OpenAI from 'openai'
import { openAIClient } from '../openai-connection'
import { SYSTEM_PROMPT } from './system-prompt'
import { createToolHandlers, TOOL_DEFINITIONS, type AgentContext } from './tools'
import type { ChatMessage, MessageBlock } from '~/types/ai-chat'

export async function runAgent(
  messages: ChatMessage[],
  userMessage: string,
  emitBlock: (block: MessageBlock) => void,
  context: AgentContext,
): Promise<string> {
  const config = useRuntimeConfig()

  const openai = openAIClient(context.keys.openai, context.connection)
  const toolHandlers = createToolHandlers(emitBlock, context)
  const quoteId = context.quote?.id

  // Build system prompt with quoteId context if available
  let systemContent = SYSTEM_PROMPT
  if (quoteId) {
    systemContent += `\n\n## Contexto da Sessão\n- ID do orçamento atual: ${quoteId}\n- O orçamento JÁ FOI CRIADO. NÃO chame create_draft_quote novamente.\n- Use este quoteId em todas as tools que precisam dele (add_item_to_quote, get_cart_summary, generate_mockup, etc.)\n- NUNCA mencione o ID para o usuário, é apenas para uso interno nas tools.`
  }

  // Build OpenAI messages
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
  ]

  // Add chat history
  for (const msg of messages) {
    openaiMessages.push({
      role: msg.role,
      content: msg.content,
    })
  }

  // Add current user message
  openaiMessages.push({ role: 'user', content: userMessage })

  // Agent loop: keep calling until no more tool calls
  let iterations = 0
  const deadline = Date.now() + 240000
  const MAX_ITERATIONS = 10

  while (iterations < MAX_ITERATIONS && Date.now() < deadline) {
    iterations++

    const response = await openai.chat.completions.create({
      model: context.connection?.chatModel || String(config.openaiChatModel),
      stream: false,
      messages: openaiMessages,
      tools: TOOL_DEFINITIONS,
      temperature: 0.7,
      max_completion_tokens: 2000,
    })

    const choice = response.choices[0]
    if (!choice) break

    const assistantMessage = choice.message

    // Add assistant message to conversation
    openaiMessages.push(assistantMessage)

    // If no tool calls, we're done
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return assistantMessage.content || ''
    }

    // Execute tool calls
    for (const toolCall of assistantMessage.tool_calls) {
      // Only handle function tool calls (skip custom tools)
      if (toolCall.type !== 'function') continue

      const handler = Object.hasOwn(toolHandlers, toolCall.function.name) ? toolHandlers[toolCall.function.name] : undefined
      let result: string

      if (handler) {
        try {
          const args = JSON.parse(toolCall.function.arguments)
          result = await handler(args)
        } catch (e: any) {
          result = e?.status ? 'Erro no provedor de IA. Verifique chave, saldo e acesso ao modelo.' : `Erro: ${e.message}`
        }
      } else {
        result = `Tool "${toolCall.function.name}" não encontrada.`
      }

      // Add tool result to conversation
      openaiMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })
    }
  }

  return 'Desculpe, não consegui completar a operação. Pode tentar novamente?'
}
