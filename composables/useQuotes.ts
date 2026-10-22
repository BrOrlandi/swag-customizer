import type { Quote, StoredQuote } from '~/types/quote'
import type { WizardState, CartItem } from '~/types/wizard'
import { readProjects, writeProjects, putProject } from '~/utils/local-projects'
const quotes = ref<StoredQuote[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
export function useQuotes() {
  async function fetchQuotes() {
    loading.value = true
    try { quotes.value = readProjects().filter(q => !q.deleted_at).sort((a,b) => b.created_at.localeCompare(a.created_at)); error.value = null }
    catch(e: any) { error.value = e.message }
    finally { loading.value = false }
  }
  async function fetchQuote(id: string) { return readProjects().find(q => q.id === id && !q.deleted_at) || null }
  async function patch(id: string, values: Partial<StoredQuote>) {
    const quote = await fetchQuote(id)
    if (!quote) throw new Error('Projeto não encontrado neste navegador.')
    putProject({ ...quote, ...values, updated_at: new Date().toISOString() })
    await fetchQuotes()
  }
  async function createDraftQuote(state: WizardState) {
    try {
      const now = new Date().toISOString(); const id = crypto.randomUUID()
      putProject({ id, contact_name: state.contactName, company_name: state.companyName, contact_email: state.contactEmail, status: 'draft', source: 'wizard', total_items: 0, total_price: 0, logo_url: null, logo_processed_url: null, ai_photo_url: null, last_step: 0, created_at: now, updated_at: now, quote_items: [] })
      await fetchQuotes(); return id
    } catch(e: any) { error.value = e.message; return null }
  }
  async function syncQuoteItems(id: string, items: CartItem[]) {
    const quote_items = items.map(i => ({ id: `${i.productId}:${i.variantId}:${i.sizeId}`, quote_id: id, product_id: i.productId, product_name: i.productName, variant_id: i.variantId, variant_color_name: i.colorName, size_id: i.sizeId, size_name: i.sizeName, quantity: i.quantity, unit_price: i.unitPrice, subtotal: i.quantity*i.unitPrice, personalized_image_url: i.personalizedImageUrl?.startsWith('data:') ? null : i.personalizedImageUrl, logo_position: i.logoPosition, logo_color_mode: i.logoColorMode, created_at: new Date().toISOString() }))
    await patch(id, { quote_items, total_items: items.reduce((n,i) => n+i.quantity,0), total_price: items.reduce((n,i) => n+i.unitPrice*i.quantity,0) })
  }
  async function finalizeQuote(id: string, state: WizardState, items: CartItem[], logo?: string|null, processed?: string|null) {
    try { await syncQuoteItems(id, items); await patch(id, { contact_name: state.contactName, company_name: state.companyName, contact_email: state.contactEmail, status: 'ready', logo_url: logo || null, logo_processed_url: processed || null }); return true }
    catch(e: any) { error.value = e.message; return false }
  }
  async function softDeleteQuote(id: string) { await patch(id, { deleted_at: new Date().toISOString() }); return true }
  async function saveAgentQuote(quote: StoredQuote) { putProject(quote); await fetchQuotes() }
  return { quotes, loading, error, fetchQuotes, fetchQuote, createDraftQuote, finalizeQuote, syncQuoteItems, softDeleteQuote, saveAgentQuote,
    updateQuoteStatus: (id: string, status: Quote['status']) => patch(id, { status }),
    updateQuoteAiPhoto: (id: string, url: string) => patch(id, { ai_photo_url: url }),
    updateQuoteLastStep: (id: string, step: number) => patch(id, { last_step: step }),
    updateQuoteLogo: (id: string, logo: string|null, processed: string|null) => patch(id, { logo_url: logo, logo_processed_url: processed }),
  }
}
