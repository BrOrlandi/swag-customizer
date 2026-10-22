import { requestConnection, openAIClient } from '../utils/openai-connection'
import { requestKeys, requireKey, providerError } from '../utils/http'
export default defineEventHandler(async event => {
  const connection = requestConnection(event)
  const key = requireKey(requestKeys(event).openai)
  try {
    const list = await openAIClient(key,connection).models.list()
    const data = list.data as Array<{ id: string; capabilities?: { tools?: boolean; imageOutput?: boolean } }>
    const models = data.filter(m => connection.provider === '9router'
      ? m.capabilities?.tools !== false && !m.capabilities?.imageOutput
      : /^(gpt-|chatgpt-|o[134])/.test(m.id) && !/(image|audio|realtime|transcrib|tts|search)/.test(m.id))
      .map(m => ({ id: m.id })).sort((a,b) => a.id.localeCompare(b.id))
    const imageModels = connection.provider === 'openai' ? data.filter(m => /^gpt-image-/.test(m.id)).map(m => ({ id: m.id })) : []
    return { provider: connection.provider, models, imageModels, defaultChatModel: connection.chatModel, defaultImageModel: connection.imageModel }
  } catch (error) { providerError(error) }
})
