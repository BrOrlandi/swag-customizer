<template>
  <div class="bg-white rounded-xl border border-dashed border-gray-300 p-4 text-center">
    <div v-if="!uploading && !uploaded">
      <Icon name="heroicons:cloud-arrow-up" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p class="text-xs text-gray-500 mb-2">Arraste ou clique para enviar o logo</p>
      <label
        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-full cursor-pointer hover:bg-accent/90 transition-colors"
      >
        <Icon name="heroicons:arrow-up-tray" class="w-3.5 h-3.5" />
        Escolher Arquivo
        <input type="file" accept="image/*" class="hidden" @change="handleFile" />
      </label>
    </div>

    <div v-else-if="uploading" class="py-2">
      <LoadingSpinner size="sm" />
      <p class="text-xs text-gray-400 mt-2">Enviando logo...</p>
    </div>

    <div v-else class="flex items-center gap-2">
      <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 shrink-0" />
      <p class="text-xs font-medium text-primary">Logo recebido! A remoção de fundo será feita automaticamente.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  quoteId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  uploaded: [file: File]
}>()

const uploading = ref(false)
const uploaded = ref(false)

async function handleFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  // Small delay to show the uploading state
  await new Promise((r) => setTimeout(r, 300))
  uploading.value = false
  uploaded.value = true

  // Emit the file for the parent to handle via handleLogoUpload
  emit('uploaded', file)
}
</script>
