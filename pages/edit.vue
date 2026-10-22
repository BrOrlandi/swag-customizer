<template>
  <div>
    <!-- Loading existing quote -->
    <div v-if="loadingEdit" class="flex justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Finalized: show only the proposal -->
    <div v-else-if="quoteFinalized" class="max-w-4xl mx-auto">
      <StepSummary />
    </div>

    <!-- Wizard flow -->
    <div v-else class="flex flex-col lg:flex-row gap-6" :class="{ 'justify-center': hideCart }">
      <!-- Main content -->
      <div class="flex-1 min-w-0" :class="{ 'max-w-4xl mx-auto': hideCart }">
        <!-- Progress bar -->
        <WizardProgress
          :steps="WIZARD_STEPS"
          :current-step="wizard.state.currentStep"
          class="mb-8 print:hidden"
          @go-to-step="wizard.goToStep"
        />

        <!-- Top navigation buttons -->
        <div class="flex items-center justify-between mb-4 print:hidden">
          <button
            v-if="wizard.state.currentStep > 0"
            class="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
            @click="wizard.prevStep()"
          >
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            Voltar
          </button>
          <div v-else />

          <button
            v-if="!isLastStep"
            class="flex items-center gap-1 text-sm font-medium border border-primary text-primary rounded-lg px-4 py-1.5 hover:bg-primary hover:text-white transition-colors"
            @click="wizard.nextStep()"
          >
            Próximo
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
          </button>
        </div>

        <!-- Step content -->
        <StepInfo v-if="currentStepConfig.id === 'info'" />

        <StepCategory
          v-else-if="currentStepConfig.categories"
          :key="currentStepConfig.id"
          :categories="currentStepConfig.categories"
        />

        <StepPersonalize v-else-if="currentStepConfig.id === 'personalize'" />

        <StepAiPhoto v-else-if="currentStepConfig.id === 'ai-photo'" />

        <StepSummary v-else-if="currentStepConfig.id === 'summary'" @finalized="quoteFinalized = true" />

        <!-- Bottom navigation buttons -->
        <div class="flex items-center justify-between mt-8 print:hidden">
          <button
            v-if="wizard.state.currentStep > 0"
            class="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
            @click="wizard.prevStep()"
          >
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            Voltar
          </button>
          <div v-else />

          <button
            v-if="!isLastStep"
            class="flex items-center gap-1 text-sm font-medium border border-primary text-primary rounded-lg px-4 py-1.5 hover:bg-primary hover:text-white transition-colors"
            @click="wizard.nextStep()"
          >
            Próximo
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Cart sidebar -->
      <CartSidebar v-if="!hideCart" class="print:hidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from '~/types/wizard'
import { WIZARD_STEPS } from '~/types/wizard'

const route = useRoute()
const router = useRouter()
const wizard = useWizard()
const { isLastStep } = wizard
const cart = useCart()
const logo = useLogo()
const { fetchQuote, updateQuoteLastStep, syncQuoteItems, updateQuoteLogo } = useQuotes()
const { generatedUrl: aiPhotoUrl } = useAiPhoto()
const { getById: getProductById, loadProducts } = useProducts()

const loadingEdit = ref(false)
const quoteFinalized = ref(false)

function resolveMockupUrl(productId: string, variantId: string, sizeId: string): string | null {
  const product = getProductById(productId)
  if (!product) return null
  const variant = product.variants.find((v) => v.id === variantId)
  if (!variant) return product.imageUrl
  const size = variant.sizes.find((s) => s.id === sizeId)
  return size?.mockupUrl ?? variant.sizes[0]?.mockupUrl ?? product.imageUrl
}

// Sync step changes to URL query param and persist to quote
watch(() => wizard.state.currentStep, (step) => {
  const { product: _, ...rest } = route.query as Record<string, string>
  const query: Record<string, string> = { ...rest, step: String(step) }
  if (wizard.state.quoteId) {
    query.id = wizard.state.quoteId
  }
  router.replace({ query })
  if (wizard.state.quoteId) {
    updateQuoteLastStep(wizard.state.quoteId, step)
  }
})

watch(() => [wizard.state.contactName, wizard.state.companyName, wizard.state.contactEmail], async () => {
  if (!wizard.state.quoteId || loadingEdit.value) return
  const q = await fetchQuote(wizard.state.quoteId)
  if (q) await useQuotes().saveAgentQuote({ ...q, contact_name: wizard.state.contactName, company_name: wizard.state.companyName, contact_email: wizard.state.contactEmail, updated_at: new Date().toISOString() })
})

// Debounced sync of cart items to localStorage
let syncTimeout: ReturnType<typeof setTimeout> | null = null
watch(cart.items, (items) => {
  if (!wizard.state.quoteId || loadingEdit.value) return
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    syncQuoteItems(wizard.state.quoteId!, [...items])
  }, 500)
}, { deep: true })

onUnmounted(() => {
  if (syncTimeout) clearTimeout(syncTimeout)
})

// Save newly uploaded logos and retain their backend URLs locally.
watch(logo.originalUrl, async (url) => {
  if (!url || !wizard.state.quoteId || !url.startsWith('data:')) return
  // New original logo uploaded — clear old processed URL and delete old processed file
  const oldOriginalUrl = wizard.state.logoUrl
  const oldProcessedUrl = wizard.state.logoProcessedUrl
  wizard.state.logoProcessedUrl = null
  const publicUrl = await logo.uploadToBackend(url, `${wizard.state.quoteId}/original.png`, oldOriginalUrl)
  if (publicUrl) {
    wizard.state.logoUrl = publicUrl
    updateQuoteLogo(wizard.state.quoteId, publicUrl, null)
  }
})

watch(logo.processedUrl, async (url) => {
  if (!url || !wizard.state.quoteId || !url.startsWith('data:')) return
  const oldProcessedUrl = wizard.state.logoProcessedUrl
  const publicUrl = await logo.uploadToBackend(url, `${wizard.state.quoteId}/processed.png`, oldProcessedUrl)
  if (publicUrl) {
    wizard.state.logoProcessedUrl = publicUrl
    updateQuoteLogo(wizard.state.quoteId, wizard.state.logoUrl, publicUrl)
  }
})

onMounted(async () => {
  const editId = route.query.id as string | undefined

  if (editId) {
    // Load existing draft quote for editing
    loadingEdit.value = true
    // Clear cart immediately to prevent stale localStorage items from leaking
    cart.clearCart()
    try {
      // Ensure products are loaded so we can resolve mockup URLs
      await loadProducts()
      const result = await fetchQuote(editId)
      if (result && result.status === 'draft') {
        // Populate wizard state
        wizard.state.quoteId = result.id
        wizard.state.contactName = result.contact_name
        wizard.state.companyName = result.company_name
        wizard.state.contactEmail = result.contact_email
        wizard.state.logoUrl = result.logo_url
        wizard.state.logoProcessedUrl = result.logo_processed_url
        // Restore step from URL, or from saved last_step, or default to step 1
        const stepParam = parseInt(route.query.step as string, 10)
        const savedStep = result.last_step ?? 1
        wizard.state.currentStep = (!isNaN(stepParam) && stepParam >= 0 && stepParam < WIZARD_STEPS.length)
          ? stepParam
          : (savedStep >= 0 && savedStep < WIZARD_STEPS.length ? savedStep : 1)

        // Restore logo in useLogo composable
        if (result.logo_processed_url) logo.processedUrl.value = result.logo_processed_url
        else if (result.logo_url) logo.originalUrl.value = result.logo_url

        // Restore AI photo if previously generated
        if (result.ai_photo_url) aiPhotoUrl.value = result.ai_photo_url

        // Populate cart from existing items, resolving mockup URLs from products data
        for (const item of result.quote_items || []) {
          cart.addItem({
            productId: item.product_id,
            productName: item.product_name,
            variantId: item.variant_id,
            colorName: item.variant_color_name,
            sizeId: item.size_id,
            sizeName: item.size_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            mockupUrl: resolveMockupUrl(item.product_id, item.variant_id, item.size_id),
            personalizedImageUrl: item.personalized_image_url,
            logoPosition: item.logo_position,
            logoColorMode: (item.logo_color_mode as CartItem['logoColorMode']) ?? 'color',
          })
        }
      } else {
        // Quote not found or not draft, redirect to view
        navigateTo(result ? `/quote/${editId}` : '/')
      }
    } finally {
      // Wait for Vue to flush pending watchers before allowing syncs
      await nextTick()
      loadingEdit.value = false
    }
  } else {
    // New kit - reset wizard state and cart to start fresh
    wizard.reset()
    logo.reset()
    cart.clearCart()
    aiPhotoUrl.value = null
  }
})

const currentStepConfig = computed(() => WIZARD_STEPS[wizard.state.currentStep] ?? WIZARD_STEPS[0])

const FULL_WIDTH_STEPS = ['personalize', 'summary', 'ai-photo']
const hideCart = computed(() => FULL_WIDTH_STEPS.includes(currentStepConfig.value.id))
</script>
