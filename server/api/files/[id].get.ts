import { fileStore } from '../../utils/file-store'
export default defineEventHandler(async event => {
  const file = await fileStore().get(getRouterParam(event, 'id') || '')
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Content-Security-Policy', "default-src 'none'; sandbox")
  setHeader(event, 'Cache-Control', `public, max-age=${Math.max(0,Math.min(86400,Math.floor((Date.parse(file.expiresAt)-Date.now())/1000)))}`)
  setHeader(event, 'X-File-Expires-At', file.expiresAt)
  return file.data
})
