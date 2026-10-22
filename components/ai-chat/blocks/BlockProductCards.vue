<template>
  <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
    <div
      v-for="(product, pIdx) in products"
      :key="product.id"
      class="shrink-0 w-48 bg-white rounded-xl shadow-sm border border-gray-100 snap-start flex flex-col"
    >
      <!-- Product image (clickable for fullscreen) -->
      <div
        class="aspect-square bg-gray-50 rounded-t-xl overflow-hidden relative cursor-pointer"
        @click="openFullscreen(pIdx)"
      >
        <img
          v-if="getDisplayImage(pIdx)"
          :src="getDisplayImage(pIdx)!"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
          <Icon name="heroicons:photo" class="w-10 h-10" />
        </div>
        <span
          v-if="!product.customizable"
          class="absolute top-2 left-2 bg-accent/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full"
        >
          Suplemento
        </span>
        <!-- Zoom hint -->
        <div class="absolute bottom-1.5 right-1.5 bg-black/40 text-white rounded-full p-1">
          <Icon name="heroicons:magnifying-glass-plus" class="w-3 h-3" />
        </div>
      </div>

      <!-- Card body -->
      <div class="p-2.5 space-y-1.5 flex-1 flex flex-col">
        <h4 class="text-xs font-semibold text-primary leading-tight line-clamp-2">{{ product.name }}</h4>

        <div class="flex items-baseline gap-1">
          <span class="text-sm font-bold text-primary">{{ formatCurrency(getDisplayPrice(pIdx)) }}</span>
          <span v-if="product.oldPrice" class="text-[10px] text-gray-400 line-through">
            {{ formatCurrency(product.oldPrice) }}
          </span>
        </div>

        <!-- Size selector (shown first, when multiple unique sizes exist) -->
        <div v-if="getUniqueSizes(pIdx).length > 1" class="flex gap-1 flex-wrap">
          <button
            v-for="size in getUniqueSizes(pIdx)"
            :key="size.name"
            class="px-2 py-0.5 text-[10px] font-medium rounded-full border transition-all"
            :class="getSelectedSizeName(pIdx) === size.name
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-gray-200 text-gray-500 hover:border-gray-400'"
            @click="selectSize(pIdx, size.name)"
          >
            {{ formatSizeLabel(size.name) }}
          </button>
        </div>

        <!-- Color dots (filtered by selected size) -->
        <div v-if="getFilteredVariants(pIdx).length > 1" class="flex gap-1 flex-wrap">
          <button
            v-for="variant in visibleVariants(pIdx)"
            :key="variant.id"
            class="w-5 h-5 rounded-full border-2 transition-all"
            :class="getSelectedVariantId(pIdx) === variant.id ? 'border-accent scale-110 ring-1 ring-accent/30' : 'border-gray-200 hover:border-gray-400'"
            :style="{ backgroundColor: variant.colorHex || '#ccc' }"
            :title="variant.colorName"
            @click="selectVariant(pIdx, variant.id)"
          />
          <button
            v-if="getFilteredVariants(pIdx).length > MAX_VISIBLE_COLORS && !expandedColors[pIdx]"
            class="text-[10px] text-accent font-medium self-center pl-0.5"
            @click="expandedColors[pIdx] = true"
          >
            +{{ getFilteredVariants(pIdx).length - MAX_VISIBLE_COLORS }}
          </button>
        </div>

        <!-- Selected color name -->
        <p v-if="getFilteredVariants(pIdx).length > 1" class="text-[10px] text-gray-400">
          {{ getSelectedVariant(pIdx)?.colorName }}
        </p>

        <!-- "Quero este" button -->
        <button
          class="mt-auto w-full py-1.5 bg-accent text-white text-xs font-medium rounded-full hover:bg-accent/90 transition-colors flex items-center justify-center gap-1"
          @click="handleSelect(pIdx)"
        >
          <Icon name="heroicons:plus-small" class="w-4 h-4" />
          Quero este
        </button>
      </div>
    </div>
  </div>

  <!-- Fullscreen modal -->
  <ImageFullscreenModal
    :image-url="fullscreenUrl"
    :alt="fullscreenAlt"
    show-loading
    @close="fullscreenUrl = null"
  />
</template>

<script setup lang="ts">
import type { ProductCardData } from '~/types/ai-chat'

interface Props {
  products: ProductCardData[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [productName: string, colorName: string, sizeName: string]
}>()

const MAX_VISIBLE_COLORS = 8

// Track selected size name per product
const selectedSizes = reactive<Record<number, string>>({})

// Track selected variant ID per product
const selectedVariantIds = reactive<Record<number, string>>({})

// Track expanded color lists
const expandedColors = reactive<Record<number, boolean>>({})

// Initialize defaults
for (let i = 0; i < props.products.length; i++) {
  const sizes = getUniqueSizesForProduct(props.products[i])
  selectedSizes[i] = sizes.length > 0 ? sizes[0].name : ''
  selectedVariantIds[i] = props.products[i].variants[0]?.id ?? ''
}

// --- Unique sizes (deduplicated across all variants) ---

interface UniqueSize {
  name: string
  additionalPrice: number
}

function getUniqueSizesForProduct(product: ProductCardData): UniqueSize[] {
  const seen = new Map<string, UniqueSize>()
  for (const variant of product.variants) {
    for (const size of variant.sizes) {
      if (!seen.has(size.name)) {
        seen.set(size.name, { name: size.name, additionalPrice: size.additionalPrice })
      }
    }
  }
  return [...seen.values()]
}

function getUniqueSizes(pIdx: number): UniqueSize[] {
  return getUniqueSizesForProduct(props.products[pIdx])
}

function getSelectedSizeName(pIdx: number): string {
  return selectedSizes[pIdx] ?? ''
}

// --- Variants filtered by selected size ---

function getFilteredVariants(pIdx: number) {
  const product = props.products[pIdx]
  if (!product) return []
  const sizeName = getSelectedSizeName(pIdx)
  if (!sizeName) return product.variants
  return product.variants.filter((v) =>
    v.sizes.some((s) => s.name === sizeName),
  )
}

function visibleVariants(pIdx: number) {
  const filtered = getFilteredVariants(pIdx)
  if (expandedColors[pIdx]) return filtered
  return filtered.slice(0, MAX_VISIBLE_COLORS)
}

function getSelectedVariantId(pIdx: number): string {
  return selectedVariantIds[pIdx] ?? ''
}

function getSelectedVariant(pIdx: number) {
  const product = props.products[pIdx]
  if (!product) return null
  return product.variants.find((v) => v.id === getSelectedVariantId(pIdx)) ?? null
}

// --- Selection handlers ---

function selectSize(pIdx: number, sizeName: string) {
  selectedSizes[pIdx] = sizeName
  expandedColors[pIdx] = false
  // If current variant doesn't have this size, switch to first variant that does
  const currentVariant = getSelectedVariant(pIdx)
  if (currentVariant) {
    const hasSize = currentVariant.sizes.some((s) => s.name === sizeName)
    if (!hasSize) {
      const fallback = props.products[pIdx].variants.find((v) =>
        v.sizes.some((s) => s.name === sizeName),
      )
      if (fallback) selectedVariantIds[pIdx] = fallback.id
    }
  }
}

function selectVariant(pIdx: number, variantId: string) {
  selectedVariantIds[pIdx] = variantId
}

// --- Display helpers ---

function getSelectedSizeObj(pIdx: number) {
  const variant = getSelectedVariant(pIdx)
  if (!variant) return null
  const sizeName = getSelectedSizeName(pIdx)
  if (sizeName) {
    return variant.sizes.find((s) => s.name === sizeName) ?? variant.sizes[0] ?? null
  }
  return variant.sizes[0] ?? null
}

function getDisplayImage(pIdx: number): string | null {
  const product = props.products[pIdx]
  if (!product) return null

  const sizeObj = getSelectedSizeObj(pIdx)
  if (sizeObj?.mockupUrl) return imgTransform(sizeObj.mockupUrl)

  // Fallback: first size of selected variant
  const variant = getSelectedVariant(pIdx)
  const fallbackMockup = variant?.sizes[0]?.mockupUrl
  if (fallbackMockup) return imgTransform(fallbackMockup)

  return product.imageUrl ? imgTransform(product.imageUrl) : null
}

function getDisplayPrice(pIdx: number): number {
  const product = props.products[pIdx]
  if (!product) return 0
  const sizeObj = getSelectedSizeObj(pIdx)
  return product.basePrice + (sizeObj?.additionalPrice || 0)
}

function formatSizeLabel(name: string): string {
  const match = name.match(/(\d+ml)/i)
  return match ? match[1] : name
}

function handleSelect(pIdx: number) {
  const product = props.products[pIdx]
  if (!product) return

  const variant = getSelectedVariant(pIdx)
  const uniqueSizes = getUniqueSizes(pIdx)
  const sizeObj = getSelectedSizeObj(pIdx)

  emit(
    'select',
    product.name,
    variant?.colorName || '',
    uniqueSizes.length > 1 ? (sizeObj?.name || '') : '',
  )
}

// --- Fullscreen ---

const fullscreenUrl = ref<string | null>(null)
const fullscreenAlt = ref('Imagem do produto')

function openFullscreen(pIdx: number) {
  const product = props.products[pIdx]
  if (!product) return

  const variant = getSelectedVariant(pIdx)
  const sizeObj = getSelectedSizeObj(pIdx)
  const mockup = sizeObj?.mockupUrl || variant?.sizes[0]?.mockupUrl

  fullscreenUrl.value = imgTransform(mockup || product.imageUrl || '', 800)
  fullscreenAlt.value = `${product.name} - ${variant?.colorName || ''}`
}

function imgTransform(url: string, height = 300): string {
  if (!url) return ''
  const sep = url.includes('?') ? ',' : '?tr='
  return `${url}${sep}h-${height},dpr-2`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
