import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
const products = JSON.parse(await readFile('public/data/products.json','utf8'))
const urls = new Set()
function collect(value) {
  if (Array.isArray(value)) value.forEach(collect)
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k,v]) => {
    if (typeof v === 'string' && /^(imageUrl|mockupUrl)$/.test(k) && v.startsWith('https://')) urls.add(v)
    else collect(v)
  })
}
collect(products)
await mkdir('public/images/products',{recursive:true}); await mkdir('server/assets/catalog',{recursive:true})
const mapping = {}; const queue = [...urls]; const failures = []
await Promise.all(Array.from({length:6},async () => {
  while(queue.length) {
    const url = queue.shift(); const id = createHash('sha256').update(url).digest('hex').slice(0,24); const filename = `${id}.webp`
    try {
      const response = await fetch(url,{signal:AbortSignal.timeout(45000)})
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = Buffer.from(await response.arrayBuffer())
      await sharp(data).resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toFile(`public/images/products/${filename}`)
      await copyFile(`public/images/products/${filename}`,`server/assets/catalog/${filename}`)
      mapping[url] = `/images/products/${filename}`
    } catch(e) { failures.push({url,error:String(e.message)}) }
  }
}))
function replace(value) {
 if (Array.isArray(value)) return value.map(replace)
 if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,replace(v)]))
 return typeof value === 'string' && mapping[value] ? mapping[value] : value
}
if (failures.length) { await writeFile('/tmp/swag-catalog-failures.json',JSON.stringify(failures,null,2)); console.log('Failures',failures.length) }
await writeFile('public/data/products.json',JSON.stringify(replace(products),null,2)+'\n')
await writeFile('server/assets/data/products.json',JSON.stringify(replace(products),null,2)+'\n')
await mkdir('docs',{recursive:true}); await writeFile('docs/catalog-sources.json',JSON.stringify(mapping,null,2)+'\n')
console.log(`Vendored ${Object.keys(mapping).length}/${urls.size} catalog images`)
