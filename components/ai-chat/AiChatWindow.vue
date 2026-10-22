<template>
  <Teleport to="body">
    <!-- Minimized pill -->
    <Transition name="fade">
      <button
        v-if="isOpen && isMinimized"
        class="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-accent text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:bg-accent/90 transition-all"
        @click="restoreChat"
      >
        <Icon name="heroicons:sparkles-solid" class="w-5 h-5" />
        <span class="text-sm font-medium">Agente IA</span>
        <span
          v-if="messages.length > 0"
          class="w-5 h-5 bg-white/20 rounded-full text-[10px] flex items-center justify-center"
        >
          {{ messages.length }}
        </span>
      </button>
    </Transition>

    <!-- Backdrop (maximized only) -->
    <Transition name="fade">
      <div
        v-if="isOpen && !isMinimized && isMaximized"
        class="fixed inset-0 z-40 bg-black/30"
        @click="toggleMaximize"
      />
    </Transition>

    <!-- Chat window -->
    <Transition name="chat-slide">
      <div
        v-if="isOpen && !isMinimized"
        :class="[
          'fixed z-50 flex flex-col bg-white shadow-2xl overflow-hidden transition-all duration-300',
          isMaximized
            ? 'inset-0 m-auto w-[720px] max-w-[calc(100vw-4rem)] h-[80vh] max-h-[800px] rounded-2xl border border-gray-200'
            : 'bottom-0 right-0 w-full h-full sm:bottom-4 sm:right-4 sm:w-[420px] sm:h-[640px] sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl sm:border sm:border-gray-200',
        ]"
      >
        <AiChatHeader
          :is-maximized="isMaximized"
          @minimize="minimizeChat"
          @toggle-maximize="toggleMaximize"
          @close="requestCloseChat"
        />

        <!-- Close confirmation banner -->
        <div
          v-if="showCloseConfirm"
          class="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3"
        >
          <p class="text-xs text-amber-800">Encerrar conversa? O histórico será apagado.</p>
          <div class="flex items-center gap-2 shrink-0">
            <button
              class="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              @click="cancelCloseChat"
            >
              Cancelar
            </button>
            <button
              class="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              @click="confirmCloseChat"
            >
              Encerrar
            </button>
          </div>
        </div>

        <AiChatMessages
          :messages="messages"
          :is-loading="isLoading"
          class="flex-1 min-h-0"
        />

        <AiChatInput
          ref="chatInputRef"
          :disabled="isLoading"
          :show-upload="!!quoteId"
          @send="handleSend"
          @upload="handleUpload"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const {
  isOpen,
  isMinimized,
  isMaximized,
  messages,
  quoteId,
  isLoading,
  showCloseConfirm,
  minimizeChat,
  restoreChat,
  toggleMaximize,
  requestCloseChat,
  cancelCloseChat,
  confirmCloseChat,
  sendMessage,
  handleLogoUpload,
} = useAiChat()

const chatInputRef = ref<{ focus: () => void } | null>(null)

// Refocus input when loading finishes (AI response arrived)
watch(isLoading, (loading) => {
  if (!loading) {
    nextTick(() => chatInputRef.value?.focus())
  }
})

function handleSend(text: string) {
  sendMessage(text)
}

function handleUpload(file: File) {
  handleLogoUpload(file)
}
</script>

<style scoped>
/* Fade transition for minimized pill and backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-up transition for chat window */
.chat-slide-enter-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.chat-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.chat-slide-enter-from {
  transform: translateY(20px);
  opacity: 0;
}
.chat-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
