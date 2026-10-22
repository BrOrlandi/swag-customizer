<template>
  <div>
    <ProposalView
      v-if="wizard.state.quoteId"
      :quote-id="wizard.state.quoteId"
      :contact-name="wizard.state.contactName"
      :company-name="wizard.state.companyName"
      :contact-email="wizard.state.contactEmail"
      :logo-url="wizard.state.logoUrl"
      :ai-photo-url="aiPhotoUrl"
      :items="proposalItems"
      :total-price="cartTotal"
      :finalized="finalized"
      :sending="saving"
      @finalize="handleSave"
    />

    <p v-if="quotes.error.value" role="alert" class="text-red-600 text-center mt-4">{{ quotes.error.value }}</p>
    <EmailSentModal
      :show="showSuccessModal"
      :email="wizard.state.contactEmail"
      :message="saveMessage"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProposalItem } from '~/components/proposal/ProposalView.vue'

const wizard = useWizard()
const { items: cartItems, totalPrice: cartTotal } = useCart()
const { generatedUrl: aiPhotoUrl } = useAiPhoto()
const quotes = useQuotes()
const { getById } = useProducts()

const router = useRouter()

const saveMessage = ref('')
const saving = ref(false)
const finalized = ref(false)
const showSuccessModal = ref(false)

const proposalItems = computed<ProposalItem[]>(() =>
  cartItems.value.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    variantId: item.variantId,
    colorName: item.colorName,
    sizeId: item.sizeId,
    sizeName: item.sizeName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    mockupUrl: item.mockupUrl,
    personalizedImageUrl: item.personalizedImageUrl,
  })),
)

function getVisibleTags(item: ProposalItem): string[] {
  const product = getById(item.productId)
  const tags: string[] = []
  if (product) {
    if (product.variants.length > 1) {
      tags.push(item.colorName)
    }
    const hasMultipleSizes = product.variants.some((v) => v.sizes.length > 1)
    if (hasMultipleSizes) {
      tags.push(item.sizeName)
    }
  } else {
    tags.push(item.colorName)
    tags.push(item.sizeName)
  }
  return tags
}

async function handleSave() {
  if (!wizard.state.quoteId) return
  saving.value = true
  try {
    const success = await quotes.finalizeQuote(
      wizard.state.quoteId,
      wizard.state,
      cartItems.value,
      wizard.state.logoUrl,
      wizard.state.logoProcessedUrl,
    )
    if (success) {
      // Send email
      try {
        const emailResult = await useBackend().request('/api/send-quote-email', {
          method: 'POST',
          body: {
            quoteId: wizard.state.quoteId,
            contactName: wizard.state.contactName,
            companyName: wizard.state.companyName,
            contactEmail: wizard.state.contactEmail,
            logoUrl: wizard.state.logoUrl,
            aiPhotoUrl: aiPhotoUrl.value,
            items: proposalItems.value.map((item) => ({
              productName: item.productName,
              colorName: item.colorName,
              sizeName: item.sizeName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.unitPrice * item.quantity,
              personalizedImageUrl: item.personalizedImageUrl,
              mockupUrl: item.mockupUrl,
              tags: getVisibleTags(item),
            })),
            totalPrice: cartTotal.value,
          },
        })
        saveMessage.value = emailResult.success ? 'Proposta salva neste navegador e enviada por e-mail.' : 'Proposta salva neste navegador. O envio por e-mail não está configurado; você pode exportar o PDF.'
      } catch (emailError) {
        saveMessage.value = 'Proposta salva neste navegador. O e-mail não pôde ser enviado; você pode exportar o PDF.'
      }
      finalized.value = true
      showSuccessModal.value = true
    } else { saveMessage.value = quotes.error.value || 'Falha ao salvar. Verifique o espaço no navegador.' }
  } finally {
    saving.value = false
  }
}

function handleConfirm() {
  showSuccessModal.value = false
  router.push('/')
}
</script>
