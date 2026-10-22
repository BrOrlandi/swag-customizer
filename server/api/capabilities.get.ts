import { requestKeys } from '../utils/http'
export default defineEventHandler(event => {
  const keys = requestKeys(event); const config = useRuntimeConfig(event)
  return { openai: !!keys.openai, gemini: !!keys.gemini, email: !!config.resendApiKey && !!config.emailFrom }
})
