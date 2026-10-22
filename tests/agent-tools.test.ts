import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createToolHandlers, type AgentContext } from '../server/utils/ai-chat/tools'
import { loadProductsServer } from '../server/utils/ai-chat/products-loader'
test('agent changes only the supplied project, validates variants and quantities, calculates catalog prices', async () => {
  const context: AgentContext = { quote: null, keys: { openai:'', gemini:'' } }
  const blocks: any[] = []
  const tools = createToolHandlers(block => blocks.push(block),context)
  await tools.create_draft_quote!({ contactName:'Demo',companyName:'Test',contactEmail:'demo@example.com' })
  const id = context.quote!.id
  await tools.create_draft_quote!({ contactName:'Other',companyName:'Other',contactEmail:'other@example.com' })
  assert.equal(context.quote!.id,id)
  const products = await loadProductsServer()
  const p = products.find(p => p.variants.some(v => v.sizes.some(s => s.inStock)))!
  const v = p.variants.find(v => v.sizes.some(s => s.inStock))!
  const s = v.sizes.find(s => s.inStock)!
  const args = { productId:p.id,variantId:v.id,sizeId:s.id,quantity:3 }
  await tools.add_item_to_quote!(args)
  assert.equal(context.quote!.total_price,(p.basePrice+s.additionalPrice)*3)
  assert.equal(context.quote!.quote_items.length,1)
  await assert.rejects(tools.add_item_to_quote!({...args,quantity:-1}))
  await tools.update_item_quantity!({productName:p.name,colorName:v.colorName,quantity:5})
  assert.equal(context.quote!.total_items,5)
  await tools.remove_item_from_quote!({productName:p.name,colorName:v.colorName})
  assert.equal(context.quote!.total_price,0)
  assert.ok(blocks.some(b => b.type === 'cart_summary'))
  const other: AgentContext = {quote:null,keys:{openai:'',gemini:''}}
  await assert.rejects(createToolHandlers(()=>{},other).get_cart_summary!({quoteId:id}))
})
