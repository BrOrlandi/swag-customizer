<template>
  <tr class="border-b border-gray-100">
    <td class="py-3 text-primary">
      <div class="flex items-center gap-3">
        <img
          v-if="item.personalized_image_url"
          :src="item.personalized_image_url"
          :alt="item.product_name"
          class="w-10 h-10 rounded object-cover"
        />
        <span>{{ item.product_name }}</span>
      </div>
    </td>
    <td class="py-3 text-gray-600">{{ item.variant_color_name }}</td>
    <td class="py-3 text-gray-600">{{ item.size_name }}</td>
    <td class="py-3 text-center">{{ item.quantity }}</td>
    <td class="py-3 text-right">{{ formatCurrency(item.unit_price) }}</td>
    <td class="py-3 text-right font-medium">{{ formatCurrency(item.subtotal) }}</td>
  </tr>
</template>

<script setup lang="ts">
import type { QuoteItem } from '~/types/quote'

interface Props {
  item: QuoteItem
}

defineProps<Props>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
