import { z } from 'zod'
import { readJson } from '../../utils/http'
import { saveImage } from '../../utils/file-store'
export default defineEventHandler(async event => {
  const body = await readJson(event, z.object({ data: z.string().min(1).max(14 * 1024 * 1024).regex(/^[A-Za-z0-9+/]+={0,2}$/) }), 15 * 1024 * 1024)
  return await saveImage(Buffer.from(body.data, 'base64'))
})
