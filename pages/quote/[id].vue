<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <ProposalView
      v-else-if="quote"
      :quote-id="quote.id"
      :contact-name="quote.contact_name"
      :company-name="quote.company_name"
      :contact-email="quote.contact_email"
      :logo-url="quote.logo_url"
      :ai-photo-url="quote.ai_photo_url"
      :items="proposalItems"
      :total-price="quote.total_price"
      :date="formatDate(quote.created_at)"
      finalized
    />

    <!-- Not found -->
    <div v-else class="text-center py-20 text-gray-400">
      <p>Orçamento não encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Quote, QuoteItem } from '~/types/quote'
import type { ProposalItem } from '~/components/proposal/ProposalView.vue'

const route = useRoute()
const quotesComposable = useQuotes()
const { loadProducts, getById: getProductById } = useProducts()

const loading = ref(true)
const quote = ref<Quote | null>(null)
const quoteItems = ref<QuoteItem[]>([])

function resolveMockupUrl(productId: string, variantId: string, sizeId: string): string | null {
  const product = getProductById(productId)
  if (!product) return null
  const variant = product.variants.find((v) => v.id === variantId)
  if (!variant) return product.imageUrl
  const size = variant.sizes.find((s) => s.id === sizeId)
  return size?.mockupUrl ?? variant.sizes[0]?.mockupUrl ?? product.imageUrl
}

const proposalItems = computed<ProposalItem[]>(() =>
  quoteItems.value.map((item) => ({
    productId: item.product_id,
    productName: item.product_name,
    variantId: item.variant_id,
    colorName: item.variant_color_name,
    sizeId: item.size_id,
    sizeName: item.size_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    mockupUrl: resolveMockupUrl(item.product_id, item.variant_id, item.size_id),
    personalizedImageUrl: item.personalized_image_url,
  })),
)

onMounted(async () => {
  try {
    await loadProducts()
    const id = route.params.id as string
    const result = await quotesComposable.fetchQuote(id)
    if (result) {
      const { quote_items, ...quoteData } = result
      quote.value = quoteData as Quote
      quoteItems.value = quote_items || []
    }
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}
</script>
