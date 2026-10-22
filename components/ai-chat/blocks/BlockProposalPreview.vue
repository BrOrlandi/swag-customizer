<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-4 py-3 bg-accent/5 border-b border-accent/10">
      <div class="flex items-center gap-2">
        <Icon name="heroicons:sparkles-solid" class="w-5 h-5 text-accent" />
        <h4 class="text-sm font-semibold text-primary">Seu orçamento está pronto!</h4>
      </div>
    </div>

    <div class="px-4 py-3 space-y-2">
      <div class="flex justify-between text-xs">
        <span class="text-gray-500">Itens</span>
        <span class="font-medium text-primary">{{ totalItems }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Total estimado</span>
        <span class="font-bold text-primary">{{ formatCurrency(totalPrice) }}</span>
      </div>
    </div>

    <div class="px-4 pb-3">
      <button
        class="w-full py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5"
        @click="handleViewProposal"
      >
        <Icon name="heroicons:document-text" class="w-4 h-4" />
        Ver Resumo e Finalizar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  quoteId: string
  totalItems: number
  totalPrice: number
}

const props = defineProps<Props>()

const { confirmCloseChat } = useAiChat()

function handleViewProposal() {
  // Close the chat and navigate to the proposal page
  confirmCloseChat()
  navigateTo(`/quote/${props.quoteId}`)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
