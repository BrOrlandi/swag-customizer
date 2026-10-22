<template>
  <div class="border-t border-gray-200 px-3 py-2">
    <form class="flex items-end gap-2" @submit.prevent="handleSend">
      <!-- Logo upload button -->
      <button
        v-if="showUpload"
        type="button"
        class="p-2 text-gray-400 hover:text-accent transition-colors rounded-lg hover:bg-gray-100 shrink-0"
        title="Enviar logo"
        @click="triggerFileInput"
      >
        <Icon name="heroicons:paper-clip" class="w-5 h-5" />
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Text input -->
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 max-h-24 min-h-[40px]"
        placeholder="Digite sua mensagem..."
        rows="1"
        @keydown.enter.exact.prevent="handleSend"
        @input="autoResize"
      />

      <!-- Send button -->
      <button
        type="submit"
        class="w-[40px] h-[40px] bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
        :disabled="!canSend"
      >
        <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
  showUpload?: boolean
}

const emit = defineEmits<{
  send: [text: string]
  upload: [file: File]
}>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showUpload: false,
})

const canSend = computed(() => inputText.value.trim().length > 0 && !props.disabled)

function handleSend() {
  if (!canSend.value) return
  emit('send', inputText.value.trim())
  inputText.value = ''
  nextTick(() => {
    autoResize()
    textareaRef.value?.focus()
  })
}

function focus() {
  textareaRef.value?.focus()
}

defineExpose({ focus })

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 96) + 'px'
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload', file)
    target.value = '' // Reset for re-upload
  }
}
</script>
