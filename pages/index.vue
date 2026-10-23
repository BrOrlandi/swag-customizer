<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <h1 class="text-2xl font-bold text-primary">Orçamentos</h1>
      <KitCreationActions v-if="quotes.length > 0" />
    </div>

    <p class="text-sm text-gray-500 mb-5">Monte seu kit com o editor ou peça ajuda ao agente de IA. Seus projetos ficam neste navegador.</p>
    <ProjectBackup class="mb-5" />
    <p v-if="error" role="alert" class="text-red-600 mb-4">{{ error }}</p>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="quotes.length === 0"
      class="text-center py-20"
    >
      <Icon name="heroicons:inbox" class="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <p class="text-gray-500 text-lg">Nenhum orçamento criado ainda.</p>
      <p class="text-gray-400 mt-1">Comece criando um novo kit!</p>
      <KitCreationActions class="mt-6 mx-auto w-fit max-w-full" />
    </div>

    <!-- Quotes grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <QuoteCard
        v-for="quote in quotes"
        :key="quote.id"
        :quote="quote"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { quotes, loading, error, fetchQuotes } = useQuotes()
const { isOpen } = useAiChat()

onMounted(() => {
  fetchQuotes()
})

// Refetch quotes when AI chat is closed (to show newly created quotes)
watch(isOpen, (open) => {
  if (!open) fetchQuotes()
})
</script>
