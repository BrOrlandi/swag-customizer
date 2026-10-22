<template>
  <div class="max-w-3xl mx-auto">
    <!-- Back button (finalized mode only) -->
    <button
      v-if="finalized"
      class="print:hidden flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors"
      @click="$router.push('/')"
    >
      <Icon name="heroicons:arrow-left" class="w-4 h-4" />
      Voltar
    </button>

    <!-- Proposal Content -->
    <div id="proposal-content" class="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none print:rounded-none">
      <!-- Header -->
      <div class="bg-gray-100 px-6 py-8 md:px-8 text-center border-b border-gray-200">
        <ExpiringImage :src="assetUrl('/images/swag-logo.png')" alt="Swag Customizer" class="h-10 mx-auto mb-4" />
        <h2 class="text-xl md:text-2xl font-bold tracking-wide" style="color: #045CAB;">PROPOSTA COMERCIAL</h2>
        <p class="text-gray-500 text-sm mt-1">Presentes Corporativos</p>
      </div>

      <!-- Contact Info -->
      <div class="px-6 py-6 md:px-8 border-b border-gray-200">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações de Contato</h3>
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <ExpiringImage
            v-if="logoUrl"
            :src="logoUrl"
            alt="Logo do cliente"
            class="w-24 h-auto max-h-24 object-contain flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-primary text-lg">{{ contactName }}</p>
            <p class="text-gray-500">{{ companyName }}</p>
            <p class="text-gray-500">{{ contactEmail }}</p>
          </div>
          <div class="sm:text-right flex-shrink-0">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Data</p>
            <p class="text-gray-500 text-sm">{{ displayDate }}</p>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="px-6 py-6 md:px-8">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Itens do Kit</h3>
        <div v-if="sortedItems.length === 0" class="text-gray-400 text-sm py-8 text-center">
          Nenhum item adicionado ao kit.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="item in sortedItems"
            :key="item.productId + item.variantId + item.sizeId"
            class="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4 py-4 px-4 rounded-lg"
            style="break-inside: avoid;"
          >
            <div
              class="w-[72px] h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
              :class="{ 'cursor-pointer hover:opacity-80 transition-opacity': item.personalizedImageUrl || item.mockupUrl }"
              @click="openImageModal(item.personalizedImageUrl || item.mockupUrl)"
            >
              <ExpiringImage
                v-if="item.personalizedImageUrl || item.mockupUrl"
                :src="item.personalizedImageUrl || item.mockupUrl || ''"
                :alt="item.productName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <Icon name="ph:package" size="28" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-primary text-[15px] mb-1.5">{{ item.productName }}</p>
              <div v-if="getVisibleTags(item).length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in getVisibleTags(item)"
                  :key="tag"
                  class="inline-flex items-center bg-gray-100 text-gray-600 text-xs leading-none px-2.5 py-1.5 rounded-full"
                >{{ tag }}</span>
              </div>
            </div>
            <div class="w-full sm:w-auto flex-shrink-0 sm:text-right self-center flex justify-between sm:block">
              <p class="text-sm text-gray-500">{{ item.quantity }} × {{ formatCurrency(item.unitPrice) }}</p>
              <p class="font-semibold text-primary">{{ formatCurrency(item.unitPrice * item.quantity) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div class="px-6 py-5 md:px-8 bg-gray-50 border-t-2 border-gray-200">
        <div class="flex items-center justify-between">
          <span class="text-gray-500 text-sm">Total</span>
          <span class="text-2xl font-bold text-primary">{{ formatCurrency(totalPrice) }}</span>
        </div>
      </div>

      <!-- Personalized Images Gallery -->
      <div v-if="personalizedImages.length > 0" class="px-6 py-6 md:px-8 border-t border-gray-200">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Imagens Personalizadas</h3>
        <div class="grid grid-cols-2 gap-4">
          <ExpiringImage
            v-for="(img, index) in personalizedImages"
            :key="index"
            :src="img"
            alt="Produto personalizado"
            class="rounded-lg w-full aspect-square object-cover cursor-pointer hover:opacity-80 transition-opacity print:mt-8"
            @click="openImageModal(img)"
          />
        </div>
      </div>

      <!-- AI Preview Image -->
      <div v-if="aiPhotoUrl" class="px-6 py-6 md:px-8 print:break-before-page">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Prévia do Kit</h3>
        <ExpiringImage
          :src="aiPhotoUrl"
          alt="Prévia do Kit gerada por IA"
          class="w-full rounded-xl border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
          @click="openImageModal(aiPhotoUrl)"
        />
      </div>

      <!-- Footer -->
      <div class="bg-gray-100 px-6 py-5 md:px-8 text-center border-t border-gray-200">
        <p class="font-semibold text-sm" style="color: #045CAB;">Swag Customizer — Vendas Corporativas</p>
        <p class="text-gray-500 text-sm">by @BrOrlandi</p>
      </div>
    </div>

    <!-- Fullscreen image modal -->
    <ImageFullscreenModal
      :image-url="modalImageUrl"
      alt="Imagem do produto"
      @close="modalImageUrl = null"
    />

    <!-- Action buttons + email -->
    <ProposalActions
      :quote-id="quoteId"
      :contact-name="contactName"
      :company-name="companyName"
      :contact-email="contactEmail"
      :logo-url="logoUrl"
      :ai-photo-url="aiPhotoUrl"
      :items="sortedItems"
      :total-price="totalPrice"
      :finalized="finalized"
      :sending="sending"
      :get-visible-tags="getVisibleTags"
      @finalize="$emit('finalize')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductCategory } from '~/types/product'
import { WIZARD_STEPS } from '~/types/wizard'

export interface ProposalItem {
  productId: string
  productName: string
  variantId: string
  colorName: string
  sizeId: string
  sizeName: string
  quantity: number
  unitPrice: number
  mockupUrl: string | null
  personalizedImageUrl: string | null
}

interface Props {
  quoteId: string
  contactName: string
  companyName: string
  contactEmail: string
  logoUrl: string | null
  aiPhotoUrl: string | null
  items: ProposalItem[]
  totalPrice: number
  finalized?: boolean
  sending?: boolean
  date?: string
}

const props = withDefaults(defineProps<Props>(), {
  finalized: false,
  sending: false,
  date: '',
})

defineEmits<{
  finalize: []
}>()

const { getById } = useProducts()

const modalImageUrl = ref<string | null>(null)

const displayDate = computed(() => props.date || new Date().toLocaleDateString('pt-BR'))

// Build category order from wizard steps
const categoryOrder: ProductCategory[] = WIZARD_STEPS
  .filter((s) => s.categories)
  .flatMap((s) => s.categories!)

const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => {
    const productA = getById(a.productId)
    const productB = getById(b.productId)
    const catA = productA?.category
    const catB = productB?.category
    const idxA = catA ? categoryOrder.indexOf(catA) : categoryOrder.length
    const idxB = catB ? categoryOrder.indexOf(catB) : categoryOrder.length
    return idxA - idxB
  })
})

const personalizedImages = computed(() =>
  sortedItems.value
    .filter((item) => item.personalizedImageUrl)
    .map((item) => item.personalizedImageUrl!),
)

function getVisibleTags(item: ProposalItem): string[] {
  const product = getById(item.productId)
  const tags: string[] = []
  if (product) {
    if (product.variants.length > 1) {
      tags.push(item.colorName)
    }
    const hasMultipleSizes = product.variants.some((v) => v.sizes.length > 1)
    if (hasMultipleSizes) {
      tags.push(item.sizeName)
    }
  } else {
    tags.push(item.colorName)
    tags.push(item.sizeName)
  }
  return tags
}

function openImageModal(url: string | null) {
  if (url) modalImageUrl.value = url
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
