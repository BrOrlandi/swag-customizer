<template>
  <div class="bg-white rounded-xl shadow-sm flex flex-col" @mouseenter="prefetchHighRes">
    <!-- Product image -->
    <div class="aspect-square bg-gray-100 relative cursor-pointer rounded-t-xl overflow-hidden" @click="displayImage && (showImageModal = true)">
      <!-- Loading overlay with fade (always mounted, opacity toggled) -->
      <div
        class="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 transition-opacity duration-300 pointer-events-none"
        :class="cardImageLoading ? 'opacity-100' : 'opacity-0'"
      >
        <LoadingSpinner size="md" />
      </div>
      <img
        v-if="displayImage"
        :src="displayImage"
        :alt="product.name"
        class="w-full h-full object-cover"
        @load="onCardImageLoad"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <Icon name="heroicons:photo" class="w-16 h-16" />
      </div>
      <!-- Supplement badge -->
      <span
        v-if="!product.customizable"
        class="absolute top-3 left-3 bg-accent/90 text-white text-xs font-medium px-2.5 py-1 rounded-full"
      >
        Suplemento
      </span>
    </div>

    <!-- Fullscreen image modal -->
    <ImageFullscreenModal
      :image-url="showImageModal ? highResImage : null"
      :alt="product.name"
      show-loading
      @close="showImageModal = false"
    />

    <!-- Card content -->
    <div class="p-4 flex flex-col gap-3 flex-1">
      <h3 class="font-semibold text-primary leading-tight">{{ product.name }}</h3>

      <!-- Price -->
      <div class="flex items-baseline gap-2">
        <span class="text-lg font-bold text-primary">{{ formatCurrency(product.basePrice) }}</span>
        <span v-if="product.oldPrice" class="text-sm text-gray-400 line-through">
          {{ formatCurrency(product.oldPrice) }}
        </span>
      </div>

      <!-- Size picker first (hide if only one unique size) -->
      <SizePicker
        v-if="uniqueSizes.length > 1"
        :sizes="uniqueSizes"
        :model-value="selectedSizeName"
        @update:model-value="handleSizeChange"
      />

      <!-- Color picker filtered by selected size (hide if only one variant) -->
      <ColorPicker
        v-if="availableVariants.length > 1"
        :variants="availableVariants"
        :model-value="selectedVariantId"
        @update:model-value="handleVariantChange"
      />

      <!-- Quantity -->
      <QuantityInput v-model="quantity" />

      <!-- Add to cart button -->
      <BaseButton
        variant="accent"
        size="sm"
        :disabled="!canAdd"
        class="w-full mt-auto"
        @click="handleAdd"
      >
        <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
        Adicionar ao Kit
      </BaseButton>

      <!-- Product details link -->
      <a
        v-if="product.productUrl"
        :href="product.productUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-center text-gray-400 hover:text-primary transition-colors"
      >
        <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5 inline mr-0.5" />
        Ver detalhes no site
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NormalizedProduct } from '~/types/product'

interface Props {
  product: NormalizedProduct
}

const props = defineProps<Props>()
const emit = defineEmits<{
  add: [item: {
    productId: string
    productName: string
    variantId: string
    colorName: string
    sizeId: string
    sizeName: string
    quantity: number
    unitPrice: number
    mockupUrl: string | null
  }]
}>()

const quantity = ref(1)
const showImageModal = ref(false)
const cardImageLoading = ref(true)

// Collect unique sizes across all variants (by name, deduplicated)
const uniqueSizes = computed(() => {
  const seen = new Map<string, { id: string; name: string; inStock: boolean; additionalPrice: number; mockupUrl: string | null }>()
  for (const variant of props.product.variants) {
    for (const size of variant.sizes) {
      if (!seen.has(size.name)) {
        seen.set(size.name, { ...size, id: size.name })
      }
    }
  }
  return [...seen.values()]
})

// Selected size name (not id) - first pick
const selectedSizeName = ref<string | null>(
  uniqueSizes.value.length > 0 ? uniqueSizes.value[0].id : null,
)

// Variants that have the selected size available
const availableVariants = computed(() => {
  if (!selectedSizeName.value) return props.product.variants
  return props.product.variants.filter((v) =>
    v.sizes.some((s) => s.name === selectedSizeName.value),
  )
})

const selectedVariantId = ref<string | null>(
  props.product.variants.length > 0 ? props.product.variants[0].id : null,
)

const selectedVariant = computed(() =>
  props.product.variants.find((v) => v.id === selectedVariantId.value) ?? null,
)

// The actual size object from the selected variant matching the selected size name
const selectedSize = computed(() => {
  if (!selectedVariant.value || !selectedSizeName.value) return null
  return selectedVariant.value.sizes.find((s) => s.name === selectedSizeName.value) ?? null
})

function imgTransform(url: string | null, height = 500): string | null {
  if (!url) return null
  const sep = url.includes('?') ? ',' : '?tr='
  return `${url}${sep}h-${height},dpr-3`
}

const rawImage = computed(() =>
  selectedSize.value?.mockupUrl
    ?? selectedVariant.value?.sizes[0]?.mockupUrl
    ?? props.product.imageUrl,
)

const displayImage = computed(() => imgTransform(rawImage.value))

const highResImage = computed(() => imgTransform(rawImage.value, 800))

let imageLoadedFlag = false
let overlayTimer: ReturnType<typeof setTimeout> | null = null

watch(displayImage, () => {
  imageLoadedFlag = false
  // Only show overlay if image hasn't loaded by next frame (not cached)
  if (overlayTimer) clearTimeout(overlayTimer)
  overlayTimer = setTimeout(() => {
    if (!imageLoadedFlag) {
      cardImageLoading.value = true
    }
  }, 50)
})

const canAdd = computed(() => {
  if (!selectedVariantId.value) return false
  if (uniqueSizes.value.length > 0 && !selectedSizeName.value) return false
  return quantity.value > 0
})

function handleSizeChange(sizeName: string | null) {
  selectedSizeName.value = sizeName
  // If current variant doesn't have this size, switch to first variant that does
  if (sizeName && selectedVariant.value) {
    const hasSize = selectedVariant.value.sizes.some((s) => s.name === sizeName)
    if (!hasSize) {
      const fallback = props.product.variants.find((v) =>
        v.sizes.some((s) => s.name === sizeName),
      )
      selectedVariantId.value = fallback?.id ?? null
    }
  }
}

function handleVariantChange(variantId: string | null) {
  selectedVariantId.value = variantId
}

function handleAdd() {
  if (!selectedVariant.value) return
  const size = selectedSize.value
  const additionalPrice = size?.additionalPrice ?? 0

  emit('add', {
    productId: props.product.id,
    productName: props.product.name,
    variantId: selectedVariant.value.id,
    colorName: selectedVariant.value.colorName,
    sizeId: size?.id ?? '',
    sizeName: size?.name ?? selectedSizeName.value ?? '',
    quantity: quantity.value,
    unitPrice: props.product.basePrice + additionalPrice,
    mockupUrl: size?.mockupUrl ?? null,
  })

  quantity.value = 1
}

function onCardImageLoad() {
  imageLoadedFlag = true
  if (overlayTimer) {
    clearTimeout(overlayTimer)
    overlayTimer = null
  }
  cardImageLoading.value = false
}

function prefetchHighRes() {
  const url = highResImage.value
  if (!url) return
  const img = new Image()
  img.src = url
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
