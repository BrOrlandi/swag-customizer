<template>
  <div
    ref="scrollContainer"
    class="flex-1 overflow-y-auto py-4 space-y-4"
  >
    <AiChatMessage
      v-for="(msg, idx) in messages"
      :key="idx"
      :message="msg"
    />

    <AiChatTypingIndicator v-if="isLoading" />

    <!-- Scroll anchor -->
    <div ref="scrollAnchor" />
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/types/ai-chat'

interface Props {
  messages: ChatMessage[]
  isLoading: boolean
}

const props = defineProps<Props>()

const scrollContainer = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

// Auto-scroll when messages change or loading state changes
watch(() => props.messages.length, scrollToBottom)
watch(() => props.isLoading, scrollToBottom)

onMounted(scrollToBottom)
</script>
