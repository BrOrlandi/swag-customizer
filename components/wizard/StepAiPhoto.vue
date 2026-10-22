<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl shadow-sm p-6 md:p-8">
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-primary mb-2">Prévia do seu Kit</h2>
        <p class="text-gray-500 text-sm">
          Veja como os produtos do kit ficarão com a personalização aplicada
        </p>
      </div>

      <!-- No API keys configured -->
      <div v-if="availableModels.length === 0" class="py-8 text-gray-400 text-center">
        <Icon name="heroicons:exclamation-triangle" class="w-10 h-10 mx-auto mb-3" />
        <p>Nenhum modelo de IA disponível. Use o botão “Configurar chaves de API de IA” no topo da página.</p>
      </div>

      <!-- Configured -->
      <div v-else>
        <!-- Instructions (before generation) -->
        <div v-if="!generatedUrl && !isGenerating" class="mb-8">
          <div class="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:sparkles" class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-blue-800 space-y-2">
                <p class="font-semibold">Como funciona?</p>
                <p>
                  Nossa IA vai gerar uma foto profissional dos produtos do seu kit com a arte da marca aplicada de forma realista.
                </p>
              </div>
            </div>
          </div>

          <div v-if="hasNoProducts" class="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-amber-700">
                Nenhum produto foi adicionado ao kit. Volte às etapas anteriores para selecionar produtos.
              </p>
            </div>
          </div>

          <div v-else-if="personalizedCount === 0" class="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-amber-700">
                Nenhum produto foi personalizado ainda. A prévia ficará melhor se você personalizar os produtos com a logo na etapa anterior.
              </p>
            </div>
          </div>
        </div>

        <!-- Model selector -->
        <div class="mb-6">
          <label class="block text-xs font-medium text-gray-500 mb-2">Modelo de IA</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="model in availableModels"
              :key="model.id"
              class="flex-1 min-w-[140px] px-3 py-2 rounded-lg border text-left transition-all text-sm"
              :class="selectedModel === model.id
                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'"
              :disabled="isGenerating"
              @click="selectedModel = model.id"
            >
              <span class="font-medium block">{{ model.label }}</span>
              <span class="text-xs text-gray-400 block mt-0.5">{{ model.description }}</span>
            </button>
          </div>
        </div>

        <!-- Generated image -->
        <div v-if="generatedUrl" class="mb-6">
          <ExpiringImage
            :src="generatedUrl"
            alt="Prévia do kit gerada por IA"
            class="w-full rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            @click="showFullscreen = true"
          />
        </div>

        <!-- Loading -->
        <div v-if="isGenerating" class="py-12 text-center">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-500">Gerando prévia do kit com IA...</p>
          <p class="mt-1 text-xs text-gray-400">Isso pode levar alguns segundos</p>
        </div>

        <!-- Error -->
        <p v-if="aiError" class="text-sm text-red-500 mb-4 text-center">{{ aiError }}</p>

        <!-- Generate / Regenerate buttons -->
        <div class="flex justify-center gap-3">
          <BaseButton
            v-if="!isGenerating && !generatedUrl"
            variant="accent"
            size="lg"
            :disabled="hasNoProducts"
            @click="handleGenerate"
          >
            <Icon name="heroicons:sparkles" class="w-5 h-5 mr-1" />
            Gerar Prévia do Kit
          </BaseButton>

          <BaseButton
            v-if="generatedUrl && !isGenerating"
            variant="outline"
            size="md"
            @click="handleGenerate"
          >
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-1" />
            Gerar Novamente
          </BaseButton>

          <BaseButton
            v-if="generatedUrl && !isGenerating"
            variant="outline"
            size="md"
            @click="handleDownload"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
            Baixar Imagem
          </BaseButton>
        </div>
      </div>

      <!-- Next step button -->
      <div class="mt-8 pt-6 border-t text-center">
        <BaseButton variant="primary" size="lg" @click="wizard.nextStep()">
          Ir para o Resumo
          <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-1" />
        </BaseButton>
        <p class="mt-2 text-xs text-gray-400">
          {{ generatedUrl ? 'A prévia será incluída no orçamento' : 'Você pode pular esta etapa e gerar depois' }}
        </p>
      </div>
    </div>

    <!-- Fullscreen modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showFullscreen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer"
          @click="showFullscreen = false"
        >
          <button
            class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            @click.stop="showFullscreen = false"
          >
            <Icon name="heroicons:x-mark" class="w-8 h-8" />
          </button>
          <ExpiringImage
            :src="generatedUrl!"
            alt="Prévia do kit gerada por IA"
            class="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { AiPhotoProduct } from '~/composables/useAiPhoto'

const { isConfigured, generatedUrl, isGenerating, error: aiError, generatePhoto, selectedModel, availableModels } = useAiPhoto()
const { items } = useCart()
const wizard = useWizard()
const { getById } = useProducts()
const { updateQuoteAiPhoto } = useQuotes()

const showFullscreen = ref(false)
const hasNoProducts = computed(() => items.value.length === 0)

const personalizedCount = computed(() =>
  items.value.filter((item) => item.personalizedImageUrl).length
)

// Save AI photo URL to quote whenever it changes
watch(generatedUrl, (url) => {
  if (url && wizard.state.quoteId) {
    updateQuoteAiPhoto(wizard.state.quoteId, url)
  }
})

async function handleGenerate() {
  const products: AiPhotoProduct[] = items.value.map((item) => ({
    item,
    product: getById(item.productId),
  }))

  await generatePhoto(products)
}

async function handleDownload() {
  if (!generatedUrl.value) return
  const res = await fetch(generatedUrl.value)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const company = wizard.state.companyName.trim().toLowerCase().replace(/\s+/g, '-') || 'kit'
  a.download = `previa-kit-${company}.png`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
