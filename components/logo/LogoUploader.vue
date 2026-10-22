<template>
  <div>
    <!-- Drop zone -->
    <div
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
        isDragging ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent/50',
      ]"
      @click="fileInput?.click()"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <!-- Preview -->
      <div v-if="originalUrl" class="flex flex-col items-center gap-4">
        <img :src="processedUrl || originalUrl" alt="Logo preview" class="max-h-32 max-w-full object-contain" />
        <p class="text-sm text-gray-500">Logo carregado com sucesso</p>
        <div class="flex gap-3" @click.stop>
          <BaseButton
            v-if="!processedUrl"
            variant="accent"
            :disabled="isProcessing"
            @click="handleRemoveBackground"
          >
            <LoadingSpinner v-if="isProcessing" size="sm" class="mr-2" />
            {{ isProcessing ? 'Processando...' : 'Remover fundo' }}
          </BaseButton>
          <BaseButton variant="ghost" @click="handleClear">
            Remover
          </BaseButton>
        </div>
      </div>

      <!-- Upload prompt -->
      <div v-else class="flex flex-col items-center gap-3">
        <Icon name="heroicons:cloud-arrow-up" class="w-12 h-12 text-gray-400" />
        <p class="text-gray-600">Arraste o logo ou clique para selecionar</p>
        <p class="text-xs text-gray-400">PNG, JPEG ou SVG</p>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/svg+xml"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Error -->
    <p v-if="logoError" class="text-sm text-red-500 mt-2">{{ logoError }}</p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  uploaded: [url: string]
}>()

const {
  originalUrl,
  processedUrl,
  isProcessing,
  error: logoError,
  setLogo,
  removeBackground,
  reset,
} = useLogo()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    setLogo(file)
    nextTick(() => {
      if (originalUrl.value) emit('uploaded', originalUrl.value)
    })
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    setLogo(file)
    nextTick(() => {
      if (originalUrl.value) emit('uploaded', originalUrl.value)
    })
  }
}

async function handleRemoveBackground() {
  await removeBackground()
  if (processedUrl.value) {
    emit('uploaded', processedUrl.value)
  }
}

function handleClear() {
  reset()
  if (fileInput.value) fileInput.value.value = ''
}
</script>
