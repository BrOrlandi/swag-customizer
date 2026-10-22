import { readImageInput } from '../utils/image-input'
export default defineEventHandler(async event => {
  const { url } = getQuery(event)
  if (typeof url !== 'string') throw createError({ statusCode: 400, message: 'URL inválida.' })
  const image = await readImageInput(url)
  setHeader(event, 'Content-Type', image.mimeType)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return Buffer.from(image.data,'base64')
})
