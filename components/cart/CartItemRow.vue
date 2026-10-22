<template>
  <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <!-- Product image -->
    <div class="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
      <ExpiringImage
        v-if="item.mockupUrl"
        :src="thumbUrl"
        :alt="item.productName"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <Icon name="heroicons:photo" class="w-6 h-6" />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-primary truncate">{{ item.productName }}</p>
      <div class="flex flex-wrap gap-1.5 mt-1">
        <span v-if="showColorName" class="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
          {{ item.colorName }}
        </span>
        <span v-if="showSizeName" class="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
          {{ item.sizeName }}
        </span>
      </div>
      <div class="flex items-center justify-between mt-1.5">
        <QuantityInput
          :model-value="item.quantity"
          @update:model-value="cart.updateQuantity(item.productId, item.variantId, item.sizeId, $event)"
        />
        <span class="text-sm font-semibold text-primary">
          {{ formatCurrency(item.unitPrice * item.quantity) }}
        </span>
      </div>
    </div>
    <button
      type="button"
      class="text-gray-400 hover:text-red-500 transition-colors p-1"
      title="Remover item"
      @click="handleRemove"
    >
      <Icon name="heroicons:trash" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from '~/types/wizard'

interface Props {
  item: CartItem
}

const props = defineProps<Props>()
const cart = useCart()
const { getById } = useProducts()

const showColorName = computed(() => {
  if (!props.item.colorName || props.item.colorName === 'Padrão') return false
  return true
})

const showSizeName = computed(() => {
  if (!props.item.sizeName || props.item.sizeName === 'Único') return false
  // Hide if size name is contained in product name (redundant)
  if (props.item.productName.toLowerCase().includes(props.item.sizeName.toLowerCase())) return false
  // Hide if every variant of this product has only one size
  const product = getById(props.item.productId)
  if (product && product.variants.every((v) => v.sizes.length <= 1)) return false
  return true
})

const thumbUrl = computed(() => {
  const url = props.item.mockupUrl
  if (!url) return null
  const sep = url.includes('?') ? ',' : '?tr='
  return `${url}${sep}h-100,dpr-3`
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function handleRemove() {
  cart.removeItem(props.item.productId, props.item.variantId, props.item.sizeId)
}
</script>
