import { requestKeys } from '../../utils/http'
export default defineEventHandler(event => { const keys = requestKeys(event); return { openai: !!keys.openai, gemini: !!keys.gemini } })
