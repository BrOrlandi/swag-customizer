<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="size in sizes"
      :key="size.id"
      type="button"
      :disabled="!size.inStock"
      :class="[
        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        modelValue === size.id
          ? 'bg-primary text-white'
          : size.inStock
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed',
      ]"
      @click="size.inStock && $emit('update:modelValue', size.id)"
    >
      {{ size.name }}
      <span v-if="size.additionalPrice > 0" class="text-xs opacity-75">
        +{{ formatCurrency(size.additionalPrice) }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ProductSize } from '~/types/product'

interface Props {
  sizes: ProductSize[]
  modelValue: string | null
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string | null]
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
