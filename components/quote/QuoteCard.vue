<template>
  <div class="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <NuxtLink
      :to="linkTo"
      class="flex flex-col p-5 gap-4"
    >
      <div class="flex gap-4">
        <!-- Logo thumbnail -->
        <div
          v-if="quote.logo_processed_url || quote.logo_url"
          class="flex-shrink-0 w-24 h-24 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden"
        >
          <img
            :src="quote.logo_processed_url || quote.logo_url!"
            :alt="quote.company_name"
            class="max-w-full max-h-full object-contain p-1"
          >
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-primary">{{ quote.company_name }}</h3>
              <p class="text-sm text-gray-500">{{ quote.contact_name }}</p>
            </div>
            <span
              :class="[
                'text-xs font-medium px-2.5 py-1 rounded-full mr-6',
                statusClasses[quote.status],
              ]"
            >
              {{ statusLabels[quote.status] }}
            </span>
          </div>

          <div class="flex items-end justify-between">
            <div class="text-sm text-gray-500">
              <p>{{ distinctItemsCount }} {{ distinctItemsCount === 1 ? 'produto' : 'produtos' }}</p>
              <p>{{ formatDate(quote.created_at) }}</p>
            </div>
            <span class="text-lg font-bold text-primary">
              {{ formatCurrency(quote.total_price) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Product thumbnails -->
      <div v-if="productImages.length > 0" class="grid grid-cols-5 pt-3 border-t border-gray-100 gap-2">
        <div
          v-for="(img, idx) in productImages"
          :key="idx"
          class="aspect-square rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden"
        >
          <img
            :src="img"
            :alt="`Produto ${idx + 1}`"
            class="max-w-full max-h-full object-contain"
          >
        </div>
        <div
          v-if="extraItemsCount > 0"
          class="aspect-square rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center"
        >
          <span class="text-sm font-medium text-gray-400">+{{ extraItemsCount }}</span>
        </div>
      </div>
    </NuxtLink>

    <button
      type="button"
      class="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
      title="Excluir orçamento"
      @click.prevent="showConfirm = true"
    >
      <Icon name="heroicons:trash" class="w-4 h-4" />
    </button>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="showConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="showConfirm = false"
      >
        <div class="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4">
          <h3 class="text-lg font-semibold text-primary mb-2">Excluir orçamento?</h3>
          <p class="text-sm text-gray-500 mb-6">
            O orçamento de <strong>{{ quote.company_name }}</strong> será removido da listagem. Esta ação não pode ser desfeita.
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
              @click="showConfirm = false"
            >
              Cancelar
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              :disabled="deleting"
              @click="handleDelete"
            >
              {{ deleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Quote, QuoteItem } from '~/types/quote'

interface QuoteWithItems extends Quote {
  quote_items?: Pick<QuoteItem, 'product_id' | 'variant_id' | 'personalized_image_url'>[]
}

interface Props {
  quote: QuoteWithItems
}

const props = defineProps<Props>()
const { softDeleteQuote } = useQuotes()
const { getById } = useProducts()
const showConfirm = ref(false)
const deleting = ref(false)

const MAX_THUMBNAILS = 4

const productImages = computed(() => {
  const items = props.quote.quote_items ?? []
  const images: string[] = []

  for (const item of items) {
    if (images.length >= MAX_THUMBNAILS) break

    // Use personalized image if available
    if (item.personalized_image_url) {
      images.push(item.personalized_image_url)
      continue
    }

    // Fallback to product mockup from products.json
    const product = getById(item.product_id)
    if (product) {
      const variant = product.variants.find(v => v.id === item.variant_id)
      const mockupUrl = variant?.sizes[0]?.mockupUrl || product.imageUrl
      if (mockupUrl) {
        images.push(mockupUrl)
        continue
      }
    }
  }

  return images
})

const distinctItemsCount = computed(() => props.quote.quote_items?.length ?? 0)

const extraItemsCount = computed(() => {
  const total = props.quote.quote_items?.length ?? 0
  return total > MAX_THUMBNAILS ? total - MAX_THUMBNAILS : 0
})

async function handleDelete() {
  deleting.value = true
  await softDeleteQuote(props.quote.id)
  deleting.value = false
  showConfirm.value = false
}

const linkTo = computed(() => {
  if (props.quote.status === 'draft') {
    return `/edit?id=${props.quote.id}`
  }
  return `/quote/${props.quote.id}`
})

const statusClasses: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
}

const statusLabels: Record<string, string> = {
  draft: 'Pendente',
  ready: 'Pronto',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}
</script>
