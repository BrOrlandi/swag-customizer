import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { FileStore, sixMonthsAfter } from '../server/utils/file-store'
test('six calendar months clamps month-end and retains UTC time', () => {
  assert.equal(sixMonthsAfter(new Date('2026-08-31T12:30:00Z')).toISOString(),'2027-02-28T12:30:00.000Z')
  assert.equal(sixMonthsAfter(new Date('2026-10-22T14:00:00Z')).toISOString(),'2027-04-22T14:00:00.000Z')
})
test('files survive a new store instance, expire from creation and are cleaned', async () => {
  const directory = await mkdtemp(join(tmpdir(),'swag-store-'))
  try {
    const store = new FileStore(directory)
    const image = await sharp({ create: { width: 4, height: 4, channels: 4, background: '#045cab' } }).png().toBuffer()
    const saved = await store.save(image,new Date('2026-01-01T00:00:00Z'))
    assert.equal(saved.expiresAt,'2026-07-01T00:00:00.000Z')
    const restarted = new FileStore(directory)
    assert.ok((await restarted.get(saved.id,new Date('2026-06-30'))).data.length)
    await assert.rejects(restarted.get(saved.id,new Date('2026-07-01')), { statusCode: 410 })
    assert.deepEqual(await readdir(directory),[])
    await store.save(image,new Date('2026-01-01'))
    assert.equal(await store.cleanup(new Date('2026-07-02')),1)
    await assert.rejects(store.get('../secrets'), { statusCode: 404 })
    await assert.rejects(store.save(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), { statusCode: 400 })
  } finally { await rm(directory,{ recursive:true, force:true }) }
})
