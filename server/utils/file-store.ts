import { mkdir, readFile, writeFile, readdir, unlink, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { createError } from 'h3'
export function sixMonthsAfter(createdAt: Date): Date {
  const result = new Date(createdAt)
  const day = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + 6)
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth()+1, 0)).getUTCDate()
  result.setUTCDate(Math.min(day, lastDay))
  return result
}
export class FileStore {
  constructor(readonly directory: string, readonly maxBytes = 10 * 1024 ** 3) {}
  async init() { await mkdir(this.directory, { recursive: true }) }
  async save(input: Buffer, now = new Date()) {
    if (!input.length || input.length > 10 * 1024 ** 2) throw createError({ statusCode: 413, message: 'A imagem deve ter no máximo 10 MB.' })
    let data: Buffer
    try {
      const image = sharp(input, { limitInputPixels: 30000000, animated: false })
      const metadata = await image.metadata()
      if (!['png','jpeg','webp'].includes(metadata.format || '')) throw new Error('unsupported')
      data = await image.rotate().resize({ width: 4096, height: 4096, fit: 'inside', withoutEnlargement: true }).png().toBuffer()
    } catch { throw createError({ statusCode: 400, message: 'Envie uma imagem PNG, JPEG ou WebP válida.' }) }
    await this.init()
    let total = 0
    for (const name of await readdir(this.directory)) if (name.endsWith('.png')) total += (await stat(join(this.directory,name)).catch(() => ({ size: 0 }))).size
    if (total + data.length > this.maxBytes) throw createError({ statusCode: 507, message: 'Armazenamento temporariamente cheio. Baixe suas imagens e tente mais tarde.' })
    const id = randomUUID()
    const metadata = { id, createdAt: now.toISOString(), expiresAt: sixMonthsAfter(now).toISOString() }
    await writeFile(join(this.directory, `${id}.json`), JSON.stringify(metadata), { flag: 'wx' })
    try { await writeFile(join(this.directory, `${id}.png`), data, { flag: 'wx' }) }
    catch (e) { await unlink(join(this.directory,`${id}.json`)); throw e }
    return metadata
  }
  async get(id: string, now = new Date()) {
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id)) throw createError({ statusCode: 404, message: 'Arquivo não encontrado.' })
    let meta: { expiresAt: string }
    try { meta = JSON.parse(await readFile(join(this.directory,`${id}.json`),'utf8')) }
    catch { throw createError({ statusCode: 404, message: 'Arquivo não encontrado.' }) }
    if (now.getTime() >= Date.parse(meta.expiresAt)) {
      await this.remove(id)
      throw createError({ statusCode: 410, message: 'Esta imagem expirou após seis meses. Gere ou envie novamente.' })
    }
    try { return { data: await readFile(join(this.directory,`${id}.png`)), expiresAt: meta.expiresAt } }
    catch { throw createError({ statusCode: 404, message: 'Arquivo não encontrado.' }) }
  }
  async remove(id: string) { await Promise.all(['png','json'].map(ext => unlink(join(this.directory,`${id}.${ext}`)).catch(() => {}))) }
  async cleanup(now = new Date()) {
    await this.init(); let removed = 0
    for (const name of await readdir(this.directory)) {
      if (!name.endsWith('.json')) continue
      try {
        const meta = JSON.parse(await readFile(join(this.directory,name),'utf8'))
        if (Date.parse(meta.expiresAt) <= now.getTime()) { await this.remove(name.slice(0,-5)); removed++ }
      } catch { /* Leave malformed metadata for operator inspection. */ }
    }
    return removed
  }
}
export function fileStore() {
  const c = useRuntimeConfig()
  return new FileStore(resolve(String(c.storageDir)), Number(c.storageMaxBytes))
}
export function filePublicUrl(id: string) {
  const c = useRuntimeConfig()
  return `${String(c.publicUrl || 'http://localhost:3000').replace(/\/$/,'')}/api/files/${id}`
}
export async function saveImage(data: Buffer) {
  const file = await fileStore().save(data)
  return { ...file, url: filePublicUrl(file.id) }
}
