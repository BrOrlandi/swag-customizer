<template>
  <div
    :class="[
      'flex gap-2 px-4',
      message.role === 'user' ? 'justify-end' : 'justify-start',
    ]"
  >
    <!-- Assistant avatar -->
    <div
      v-if="message.role === 'assistant'"
      class="w-7 h-7 shrink-0 rounded-full bg-accent/10 flex items-center justify-center mt-0.5"
    >
      <Icon name="heroicons:sparkles-solid" class="w-3.5 h-3.5 text-accent" />
    </div>

    <div
      :class="[
        'max-w-[85%] space-y-2',
        message.role === 'user' ? 'items-end' : 'items-start',
      ]"
    >
      <!-- User image blocks (logo preview) - shown above the text bubble -->
      <template v-if="message.role === 'user' && message.blocks">
        <div
          v-for="(block, idx) in message.blocks"
          :key="`user-block-${idx}`"
          class="w-full flex justify-end"
        >
          <div
            v-if="block.type === 'image'"
            class="w-20 h-20 rounded-xl overflow-hidden border-2 border-accent/30 bg-[repeating-conic-gradient(#f3f3f3_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]"
          >
            <img
              :src="(block as any).url"
              :alt="(block as any).alt || 'Logo'"
              class="w-full h-full object-contain"
            />
          </div>
        </div>
      </template>

      <!-- Text bubble -->
      <div
        :class="[
          'rounded-2xl px-3.5 py-2.5 text-sm',
          message.role === 'user'
            ? 'bg-accent text-white rounded-br-md'
            : 'bg-gray-100 text-primary rounded-bl-md',
        ]"
      >
        <BlockText :content="displayContent" />
        <!-- Loading spinner for processing messages -->
        <div v-if="message.loading" class="flex items-center gap-2 mt-2">
          <div class="w-3.5 h-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-accent" />
          <span class="text-xs text-gray-400">Processando...</span>
        </div>
      </div>

      <!-- Rich blocks (only for assistant messages) -->
      <template v-if="message.role === 'assistant' && message.blocks">
        <div
          v-for="(block, idx) in message.blocks"
          :key="idx"
          class="w-full"
        >
          <BlockProductCards
            v-if="block.type === 'product_cards'"
            :products="block.products"
            @select="handleProductSelect"
          />
          <BlockCartSummary
            v-else-if="block.type === 'cart_summary'"
            :data="block.data"
          />
          <BlockLogoUpload
            v-else-if="block.type === 'logo_upload'"
            :quote-id="block.quoteId"
            @uploaded="handleLogoUploaded"
          />
          <BlockProposalPreview
            v-else-if="block.type === 'proposal_preview'"
            :quote-id="block.quoteId"
            :total-items="block.totalItems"
            :total-price="block.totalPrice"
          />
          <BlockImage
            v-else-if="block.type === 'image'"
            :url="block.url"
            :alt="block.alt"
            :transparent="block.transparent"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/types/ai-chat'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const { sendMessage, handleLogoUpload } = useAiChat()

// Strip internal URL markers from user messages for display
const displayContent = computed(() => {
  if (props.message.role === 'user' && props.message.blocks?.some((b) => b.type === 'image')) {
    // Strip ". URL: ..." or "URL: ..." from the end of the message
    return props.message.content.replace(/\.?\s*URL[^)]*:\s*\S+$/i, '').trim()
  }
  return props.message.content
})

function handleProductSelect(productName: string, colorName: string, sizeName: string) {
  const colorPart = colorName ? ` na cor ${colorName}` : ''
  const sizePart = sizeName ? ` no tamanho ${sizeName}` : ''
  sendMessage(`Adicione ${productName}${colorPart}${sizePart}`)
}

function handleLogoUploaded(file: File) {
  handleLogoUpload(file)
}
</script>
