import type OpenAI from 'openai'
import { randomUUID } from 'node:crypto'
import { searchProducts, getProductById } from './products-loader'
import type { ProductCardData, MessageBlock } from '~/types/ai-chat'
import type { StoredQuote, QuoteItem } from '~/types/quote'
import { openaiImage, geminiImage } from '../ai-images'
import { readImageInput } from '../image-input'
import { saveImage } from '../file-store'
export interface AgentContext { quote: StoredQuote | null; keys: { openai: string; gemini: string } }
function productToCardData(p: any): ProductCardData { return { ...p, variants: p.variants } }
// OpenAI tool definitions
export const TOOL_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Busca produtos disponíveis por nome ou categoria. Categorias: mochilas, bolsas, malas, garrafas, copos, acessorios, suplementos.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Termo de busca por nome ou descrição' },
          category: { type: 'string', description: 'Categoria: mochilas, bolsas, malas, garrafas, copos, acessorios, suplementos' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_details',
      description: 'Busca detalhes completos de um produto por ID, incluindo variantes, cores e tamanhos disponíveis.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID do produto' },
        },
        required: ['productId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_draft_quote',
      description: 'Cria um orçamento rascunho. Use quando tiver nome, empresa e email do usuário.',
      parameters: {
        type: 'object',
        properties: {
          contactName: { type: 'string', description: 'Nome completo do contato' },
          companyName: { type: 'string', description: 'Nome da empresa' },
          contactEmail: { type: 'string', description: 'Email de contato' },
        },
        required: ['contactName', 'companyName', 'contactEmail'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_item_to_quote',
      description: 'Adiciona um produto ao orçamento. Pode usar IDs ou nomes para identificar o produto, cor e tamanho.',
      parameters: {
        type: 'object',
        properties: {
          quoteId: { type: 'string', description: 'ID do orçamento' },
          productId: { type: 'string', description: 'ID do produto (opcional se productName for fornecido)' },
          productName: { type: 'string', description: 'Nome do produto (ex: "Garrafa Térmica Fresh")' },
          variantId: { type: 'string', description: 'ID da variante/cor (opcional se colorName for fornecido)' },
          colorName: { type: 'string', description: 'Nome da cor (ex: "Branca", "Preta")' },
          sizeId: { type: 'string', description: 'ID do tamanho (opcional se sizeName for fornecido)' },
          sizeName: { type: 'string', description: 'Nome do tamanho (ex: "Fresh 650ml", "Fresh 1200ml")' },
          quantity: { type: 'number', description: 'Quantidade desejada' },
        },
        required: ['quoteId', 'quantity'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_item_from_quote',
      description: 'Remove um item do orçamento pelo nome do produto. Se houver múltiplos itens do mesmo produto com cores diferentes, informe a cor.',
      parameters: {
        type: 'object',
        properties: {
          quoteId: { type: 'string', description: 'ID do orçamento' },
          productName: { type: 'string', description: 'Nome do produto a remover (ex: "Capa para Notebook Slim")' },
          colorName: { type: 'string', description: 'Cor do produto (opcional, para diferenciar variantes)' },
        },
        required: ['quoteId', 'productName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_item_quantity',
      description: 'Atualiza a quantidade de um item no orçamento pelo nome do produto.',
      parameters: {
        type: 'object',
        properties: {
          quoteId: { type: 'string', description: 'ID do orçamento' },
          productName: { type: 'string', description: 'Nome do produto (ex: "Mochila Voyage")' },
          colorName: { type: 'string', description: 'Cor do produto (opcional, para diferenciar variantes)' },
          quantity: { type: 'number', description: 'Nova quantidade' },
        },
        required: ['quoteId', 'productName', 'quantity'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_cart_summary',
      description: 'Mostra o resumo atual do carrinho/orçamento.',
      parameters: {
        type: 'object',
        properties: {
          quoteId: { type: 'string', description: 'ID do orçamento' },
        },
        required: ['quoteId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_supplements',
      description: 'Sugere suplementos Rituária para complementar o kit.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_mockup',
      description: 'Gera o mockup do próximo produto customizável do orçamento que ainda não tem mockup. Busca automaticamente o item, logo e imagem do produto. Basta passar o quoteId.',
      parameters: {
        type: 'object',
        properties: {
          quoteId: { type: 'string', description: 'ID do orçamento' },
        },
        required: ['quoteId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_ai_preview',
      description: 'Gera uma prévia artística do kit completo com todos os produtos.',
      parameters: {
        type: 'object',
        properties: {
          quoteId: { type: 'string', description: 'ID do orçamento' },
        },
        required: ['quoteId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_proposal_button',
      description: 'Mostra o botão para o usuário ir para a tela de resumo e finalizar o orçamento. Use somente DEPOIS de gerar os mockups e a prévia do kit.',
      parameters: {
        type: 'object',
        properties: {
          quoteId: { type: 'string', description: 'ID do orçamento' },
        },
        required: ['quoteId'],
      },
    },
  },
]


export function createToolHandlers(emitBlock: (block: MessageBlock) => void, context: AgentContext): Record<string, (args: any) => Promise<string>> {
  function quote() { if (!context.quote) throw new Error('Peça os dados do contato e crie o orçamento primeiro.'); return context.quote }
  function summary() {
    const q = quote()
    q.total_items = q.quote_items.reduce((n,i) => n+i.quantity,0)
    q.total_price = q.quote_items.reduce((n,i) => n+i.subtotal,0)
    q.updated_at = new Date().toISOString()
    return { quoteId: q.id, totalItems: q.total_items, totalPrice: q.total_price, items: q.quote_items.map(i => ({ id: i.id, productName: i.product_name, colorName: i.variant_color_name, sizeName: i.size_name, quantity: i.quantity, unitPrice: i.unit_price, subtotal: i.subtotal })) }
  }
  function emitSummary() { emitBlock({ type: 'cart_summary', data: summary() }) }
  const quantity = (n: unknown) => { if (!Number.isInteger(n) || Number(n) < 1 || Number(n) > 10000) throw new Error('Quantidade deve ser inteira entre 1 e 10.000.'); return Number(n) }
  const matching = (name: string, color?: string) => quote().quote_items.filter(i => i.product_name.toLowerCase().includes(String(name).toLowerCase()) && (!color || i.variant_color_name.toLowerCase().includes(color.toLowerCase())))
  return {
    search_products: async ({query,category}) => {
      const results = await searchProducts(query,category)
      emitBlock({ type: 'product_cards', products: results.map(productToCardData) })
      return JSON.stringify(results.map(p => ({ ...p, referenceImages: undefined })))
    },
    get_product_details: async ({productId}) => JSON.stringify(await getProductById(productId)),
    create_draft_quote: async ({contactName,companyName,contactEmail}) => {
      if (!context.quote) {
        if (![contactName,companyName,contactEmail].every(v => typeof v === 'string' && v.length > 0 && v.length < 300)) throw new Error('Dados do contato inválidos.')
        const now = new Date().toISOString()
        context.quote = { id: randomUUID(), contact_name: contactName, company_name: companyName, contact_email: contactEmail, status: 'draft', source: 'ai-chat', total_price: 0, total_items: 0, logo_url: null, logo_processed_url: null, ai_photo_url: null, last_step: 1, created_at: now, updated_at: now, quote_items: [] }
      }
      return `Orçamento atual: ${context.quote.id}. Continue a seleção de produtos.`
    },
    add_item_to_quote: async ({productId,productName,variantId,colorName,sizeId,sizeName,quantity: n}) => {
      const q = quote()
      const products = productId ? [await getProductById(productId)] : await searchProducts(productName)
      const p = products.find(p => p && (p.id === productId || p.name.toLowerCase() === String(productName).toLowerCase())) || products[0]
      if (!p) throw new Error('Produto não encontrado. Busque no catálogo.')
      const variant = p.variants.find(v => v.id === variantId || v.colorName.toLowerCase() === String(colorName).toLowerCase()) || (p.variants.length === 1 ? p.variants[0] : undefined)
      if (!variant) throw new Error(`Escolha uma cor: ${p.variants.map(v => v.colorName).join(', ')}`)
      const size = variant.sizes.find(s => s.id === sizeId || s.name.toLowerCase() === String(sizeName).toLowerCase()) || (variant.sizes.length === 1 ? variant.sizes[0] : undefined)
      if (!size || !size.inStock) throw new Error(`Escolha um tamanho disponível: ${variant.sizes.filter(s => s.inStock).map(s => s.name).join(', ')}`)
      const count = quantity(n); const unitPrice = p.basePrice + (size.additionalPrice || 0)
      const existing = q.quote_items.find(i => i.product_id === p.id && i.variant_id === variant.id && i.size_id === size.id)
      if (existing) { existing.quantity += count; quantity(existing.quantity); existing.subtotal = existing.quantity*existing.unit_price }
      else {
        if (q.quote_items.length >= 100) throw new Error('Limite de 100 itens por projeto.')
        q.quote_items.push({ id: randomUUID(), quote_id: q.id, product_id: p.id, product_name: p.name, variant_id: variant.id, variant_color_name: variant.colorName, size_id: size.id, size_name: size.name, quantity: count, unit_price: unitPrice, subtotal: count*unitPrice, personalized_image_url: null, logo_position: null, logo_color_mode: 'color', created_at: new Date().toISOString() })
      }
      emitSummary(); return 'Produto adicionado. Resumo atualizado.'
    },
    remove_item_from_quote: async ({productName,colorName}) => {
      const q = quote(); const items = matching(productName,colorName)
      if (!items.length) throw new Error('Item não encontrado no orçamento.')
      q.quote_items = q.quote_items.filter(i => !items.includes(i)); emitSummary(); return 'Itens removidos.'
    },
    update_item_quantity: async ({productName,colorName,quantity: n}) => {
      const items = matching(productName,colorName)
      if (items.length !== 1) throw new Error('Informe o produto e a cor para identificar um único item.')
      const item = items[0]!
      item.quantity = quantity(n); item.subtotal = item.quantity*item.unit_price; emitSummary(); return 'Quantidade atualizada.'
    },
    get_cart_summary: async () => { emitSummary(); return 'Resumo exibido.' },
    suggest_supplements: async () => {
      const products = await searchProducts(undefined,'suplementos')
      emitBlock({ type: 'product_cards', products: products.map(productToCardData) }); return JSON.stringify(products)
    },
    generate_mockup: async () => {
      if (!context.keys.openai) throw new Error('Configure uma chave OpenAI para gerar mockups.')
      const q = quote(); const logoUrl = q.logo_processed_url || q.logo_url
      if (!logoUrl) { emitBlock({ type: 'logo_upload', quoteId: q.id }); return 'Peça ao usuário para enviar o logo pelo botão exibido.' }
      for (const item of q.quote_items) {
        const product = await getProductById(item.product_id)
        if (!product?.customizable || item.personalized_image_url) continue
        const size = product.variants.find(v => v.id === item.variant_id)?.sizes.find(s => s.id === item.size_id)
        if (!size?.mockupUrl) continue
        const images = await Promise.all([readImageInput(logoUrl),readImageInput(size.mockupUrl)])
        const result = await openaiImage(context.keys.openai, `A primeira imagem é um logo e a segunda é o produto ${product.name} na cor ${item.variant_color_name}. Aplique o logo centralizado no produto de forma natural e proporcional. Preserve o produto e o fundo. Use logo branco sobre produtos pretos para contraste.`,images)
        const saved = await saveImage(Buffer.from(result.data,'base64'))
        item.personalized_image_url = saved.url
        q.updated_at = new Date().toISOString()
        emitBlock({ type: 'image', url: saved.url, alt: `Mockup ${product.name}` })
        return 'Mockup gerado e exibido. Se houver mais produtos sem mockup, ofereça gerar os próximos.'
      }
      return 'Todos os produtos personalizáveis já possuem mockup.'
    },
    generate_ai_preview: async () => {
      const q = quote()
      if (!q.quote_items.length) throw new Error('Adicione produtos primeiro.')
      const images = []
      for (const item of q.quote_items.slice(0,8)) {
        const p = await getProductById(item.product_id)
        const url = item.personalized_image_url || p?.imageUrl
        if (url) images.push(await readImageInput(url))
      }
      const prompt = `Crie uma foto profissional de catálogo com estes produtos dispostos juntos sobre superfície neutra: ${q.quote_items.map(i => `${i.product_name} (${i.variant_color_name})`).join(', ')}. Preserve as personalizações das imagens de referência.`
      const result = context.keys.gemini ? await geminiImage(context.keys.gemini,prompt,images) : await openaiImage(context.keys.openai,prompt,images)
      const saved = await saveImage(Buffer.from(result.data,'base64'))
      q.ai_photo_url = saved.url; q.updated_at = new Date().toISOString()
      emitBlock({ type: 'image', url: saved.url, alt: 'Prévia do kit' }); return 'Prévia gerada.'
    },
    show_proposal_button: async () => {
      const q = quote(); const data = summary()
      if (!data.items.length) throw new Error('O orçamento está vazio.')
      q.status = 'ready'
      emitBlock({ type: 'proposal_preview', quoteId: q.id, totalItems: data.totalItems, totalPrice: data.totalPrice }); return 'Proposta exibida. Pode exportar como PDF; e-mail depende da configuração da demonstração.'
    },
  }
}
