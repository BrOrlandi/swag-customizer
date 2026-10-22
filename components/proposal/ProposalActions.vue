<template>
  <div>
    <!-- Action Buttons (hidden in print) -->
    <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
      <BaseButton
        variant="outline"
        size="lg"
        :disabled="sending"
        class="w-full sm:w-auto"
        @click="handleExportPdf"
      >
        <Icon name="ph:file-pdf" size="20" class="mr-2" />
        Exportar PDF
      </BaseButton>
      <BaseButton
        v-if="!finalized"
        variant="accent"
        size="lg"
        :disabled="sending"
        class="w-full sm:w-auto"
        @click="$emit('finalize')"
      >
        <LoadingSpinner v-if="sending" size="sm" class="mr-2" />
        <Icon v-else name="ph:paper-plane-tilt" size="20" class="mr-2" />
        {{ sending ? 'Enviando...' : 'Finalizar Proposta' }}
      </BaseButton>
      <BaseButton
        v-else-if="capabilities.email"
        variant="accent"
        size="lg"
        :disabled="sending"
        class="w-full sm:w-auto"
        @click="handleResendEmail"
      >
        <LoadingSpinner v-if="sending" size="sm" class="mr-2" />
        <Icon v-else name="ph:envelope" size="20" class="mr-2" />
        {{ sending ? 'Enviando...' : 'Enviar por Email' }}
      </BaseButton>
    </div>

    <!-- Email sent toast -->
    <Transition name="fade">
      <div
        v-if="emailSentMessage"
        class="mt-4 text-center text-sm font-medium"
        :class="emailSentMessage.success ? 'text-green-600' : 'text-red-600'"
      >
        {{ emailSentMessage.text }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ProposalItem } from './ProposalView.vue'

interface Props {
  quoteId: string
  contactName: string
  companyName: string
  contactEmail: string
  logoUrl: string | null
  aiPhotoUrl: string | null
  items: ProposalItem[]
  totalPrice: number
  finalized: boolean
  sending: boolean
  getVisibleTags: (item: ProposalItem) => string[]
}

const props = defineProps<Props>()
const { capabilities } = useApiKeys()

defineEmits<{
  finalize: []
}>()

const emailSentMessage = ref<{ success: boolean; text: string } | null>(null)

function handleExportPdf() {
  window.print()
}

async function handleResendEmail() {
  emailSentMessage.value = null
  try {
    const result = await useBackend().request('/api/send-quote-email', {
      method: 'POST',
      body: {
        quoteId: props.quoteId,
        contactName: props.contactName,
        companyName: props.companyName,
        contactEmail: props.contactEmail,
        logoUrl: props.logoUrl,
        aiPhotoUrl: props.aiPhotoUrl,
        items: props.items.map((item) => ({
          productName: item.productName,
          colorName: item.colorName,
          sizeName: item.sizeName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
          personalizedImageUrl: item.personalizedImageUrl,
          mockupUrl: item.mockupUrl,
          tags: props.getVisibleTags(item),
        })),
        totalPrice: props.totalPrice,
      },
    })
    emailSentMessage.value = result.success ? { success: true, text: `Email enviado para ${props.contactEmail}` } : { success: false, text: 'Envio de e-mail não configurado. Você pode exportar o PDF.' }
  } catch (e) {
    console.error('Failed to resend email:', e)
    emailSentMessage.value = { success: false, text: 'Falha ao enviar email. Tente novamente.' }
  }
  setTimeout(() => { emailSentMessage.value = null }, 5000)
}
</script>
