<template>
  <div class="flex flex-wrap gap-2 p-1">
    <div
      v-for="variant in variants"
      :key="variant.id"
      class="relative group"
    >
      <button
        type="button"
        :class="[
          'w-8 h-8 rounded-full flex-shrink-0 transition-shadow border border-gray-200',
          modelValue === variant.id ? 'ring-2 ring-accent ring-offset-2' : 'hover:ring-1 hover:ring-gray-300',
        ]"
        :style="{ backgroundColor: variant.colorHex || '#9ca3af' }"
        @click="$emit('update:modelValue', variant.id)"
      />
      <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {{ variant.colorName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductVariant } from '~/types/product'

interface Props {
  variants: ProductVariant[]
  modelValue: string | null
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string | null]
}>()
</script>
