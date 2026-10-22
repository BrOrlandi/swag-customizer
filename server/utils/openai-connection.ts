import OpenAI from 'openai'
import { createError, getHeader, type H3Event } from 'h3'
export type ChatProvider = 'openai' | '9router'
export interface OpenAIConnection { provider: ChatProvider; baseURL: string; chatModel: string; imageModel: string }
const endpoints = { openai: 'https://api.openai.com/v1', '9router': 'https://gateway.example.com/v1' } as const
export function resolveConnection(input: { provider?: string; chatModel?: string; imageModel?: string }, defaults: { chatModel: string; imageModel: string; routerChatModel: string }): OpenAIConnection {
  const provider = input.provider || 'openai'
  if (provider !== 'openai' && provider !== '9router') throw createError({ statusCode: 400, message: 'Provedor de IA inválido.' })
  const chatModel = input.chatModel?.trim() || (provider === '9router' ? defaults.routerChatModel : defaults.chatModel)
  const imageModel = input.imageModel?.trim() || defaults.imageModel
  for (const model of [chatModel,imageModel]) if (!/^[a-zA-Z0-9_.:/@\[\]-]{1,160}$/.test(model)) throw createError({ statusCode: 400, message: 'Nome de modelo inválido.' })
  return { provider, baseURL: endpoints[provider], chatModel, imageModel }
}
export function requestConnection(event: H3Event) {
  const config = useRuntimeConfig(event)
  return resolveConnection({ provider: getHeader(event,'x-chat-provider'), chatModel: getHeader(event,'x-chat-model'), imageModel: getHeader(event,'x-image-model') }, { chatModel: String(config.openaiChatModel), imageModel: String(config.openaiImageModel), routerChatModel: String(config.nineRouterChatModel) })
}
export function openAIClient(key: string, connection?: OpenAIConnection) {
  return new OpenAI({ apiKey: key, baseURL: connection?.baseURL, maxRetries: 0, timeout: 240000 })
}
