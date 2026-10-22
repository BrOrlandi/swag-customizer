<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-3 py-2 bg-gray-50 border-b border-gray-200">
      <h4 class="text-xs font-semibold text-primary flex items-center gap-1.5">
        <Icon name="heroicons:shopping-cart" class="w-3.5 h-3.5" />
        Resumo do Orçamento
      </h4>
    </div>

    <div class="divide-y divide-gray-100">
      <div
        v-for="item in data.items"
        :key="item.id"
        class="px-3 py-2 flex items-center justify-between text-xs"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium text-primary truncate">{{ item.productName }}</p>
          <p class="text-gray-400">{{ item.colorName }} · {{ item.sizeName }}</p>
        </div>
        <div class="text-right shrink-0 ml-3">
          <p class="font-medium text-primary">{{ item.quantity }}x {{ formatCurrency(item.unitPrice) }}</p>
          <p class="text-gray-400">{{ formatCurrency(item.subtotal) }}</p>
        </div>
      </div>
    </div>

    <div class="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <span class="text-xs text-gray-500">{{ data.totalItems }} {{ data.totalItems === 1 ? 'item' : 'itens' }}</span>
      <span class="text-sm font-bold text-primary">{{ formatCurrency(data.totalPrice) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartSummaryData } from '~/types/ai-chat'

interface Props {
  data: CartSummaryData
}

defineProps<Props>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
