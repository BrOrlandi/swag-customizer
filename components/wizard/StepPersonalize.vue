<template>
  <div>
    <!-- Logo uploader if no logo yet -->
    <div v-if="!logoUrl" class="max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold text-primary mb-4">Upload do Logo</h2>
      <LogoUploader @uploaded="handleLogoUploaded" />
    </div>

    <!-- Logo editor for each item with mockup -->
    <div v-else>
      <div v-if="itemsWithMockup.length > 0">
        <!-- Logo info + actions -->
        <div class="mb-4 flex flex-col items-center gap-2">
          <div class="text-sm text-gray-500">
            Personalizando item {{ currentItemIndex + 1 }} de {{ itemsWithMockup.length }}
          </div>
          <div class="flex items-center gap-3">
            <BaseButton
              v-if="!hasProcessedLogo"
              variant="accent"
              size="sm"
              :disabled="isProcessingLogo"
              @click="handleRemoveBackground"
            >
              <LoadingSpinner v-if="isProcessingLogo" size="sm" class="mr-1" />
              {{ isProcessingLogo ? 'Processando...' : 'Remover fundo do logo' }}
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="handleChangeLogo">
              Trocar logo
            </BaseButton>
          </div>
        </div>

        <!-- Mobile: horizontal product list above editor -->
        <div v-if="itemsWithMockup.length > 1" class="lg:hidden mb-4 -mx-4 px-4 overflow-x-auto">
          <div class="flex gap-3 pb-2" :style="{ minWidth: 'min-content' }">
            <button
              v-for="(item, index) in itemsWithMockup"
              :key="item.productId + item.variantId"
              class="flex-shrink-0 w-20 rounded-lg border-2 overflow-hidden transition-all"
              :class="index === currentItemIndex ? 'border-accent shadow-md' : 'border-gray-200 hover:border-gray-300'"
              @click="goToItem(index)"
            >
              <img
                :src="item.personalizedImageUrl || item.mockupUrl + '?tr=h-100,dpr-3'"
                :alt="item.productName"
                class="w-full aspect-square object-cover"
              />
              <div class="px-1 py-1 text-center">
                <p class="text-[10px] font-medium text-primary leading-tight truncate">{{ item.productName }}</p>
                <p class="text-[9px] text-gray-400 truncate">{{ item.colorName }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Desktop: editor + sidebar layout -->
        <div class="flex items-start justify-center gap-6">
          <!-- Editor with arrows -->
          <div class="flex items-center gap-4 justify-center flex-shrink-0">
            <!-- Previous item arrow -->
            <div class="group relative flex-shrink-0">
              <button
                :disabled="currentItemIndex === 0"
                class="w-10 h-10 flex items-center justify-center rounded-full border transition-colors"
                :class="currentItemIndex === 0 ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5'"
                @click="goToItem(currentItemIndex - 1)"
              >
                <Icon name="heroicons:chevron-left" class="w-5 h-5" />
              </button>
              <span
                v-if="currentItemIndex > 0"
                class="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Produto anterior
              </span>
            </div>

            <!-- Editor -->
            <div class="flex-shrink-0">
              <LogoEditor
                :key="currentItem.productId + currentItem.variantId"
                :mockup-url="currentItem.mockupUrl!"
                :logo-url="logoUrl"
                :product-name="currentItem.productName"
                :logo-position="currentItem.logoPosition"
                :logo-color-mode="currentItem.logoColorMode"
                :processing="isProcessingLogo"
                @save="(dataUrl) => handleSave(currentItem, dataUrl)"
                @position-change="(pos) => handlePositionChange(currentItem, pos)"
                @color-mode-change="(mode) => handleColorModeChange(currentItem, mode)"
              />
            </div>

            <!-- Next item arrow -->
            <div class="group relative flex-shrink-0">
              <button
                :disabled="currentItemIndex >= itemsWithMockup.length - 1"
                class="w-10 h-10 flex items-center justify-center rounded-full border transition-colors"
                :class="currentItemIndex >= itemsWithMockup.length - 1 ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5'"
                @click="goToItem(currentItemIndex + 1)"
              >
                <Icon name="heroicons:chevron-right" class="w-5 h-5" />
              </button>
              <span
                v-if="currentItemIndex < itemsWithMockup.length - 1"
                class="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Próximo produto
              </span>
            </div>
          </div>

          <!-- Desktop: vertical product sidebar -->
          <div v-if="itemsWithMockup.length > 1" class="hidden lg:block w-28 flex-shrink-0 max-h-[600px] overflow-y-auto">
            <div class="flex flex-col gap-3">
              <button
                v-for="(item, index) in itemsWithMockup"
                :key="item.productId + item.variantId"
                class="w-full rounded-lg border-2 overflow-hidden transition-all"
                :class="index === currentItemIndex ? 'border-accent shadow-md' : 'border-gray-200 hover:border-gray-300'"
                @click="goToItem(index)"
              >
                <img
                  :src="item.personalizedImageUrl || item.mockupUrl + '?tr=h-100,dpr-3'"
                  :alt="item.productName"
                  class="w-full aspect-square object-cover"
                />
                <div class="px-1.5 py-1.5 text-center">
                  <p class="text-[11px] font-medium text-primary leading-tight line-clamp-2">{{ item.productName }}</p>
                  <p class="text-[10px] text-gray-400 truncate">{{ item.colorName }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-400">
        <p>Nenhum item no carrinho possui mockup para personalização.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItem, LogoPosition } from '~/types/wizard'

const route = useRoute()
const router = useRouter()
const logo = useLogo()
const cart = useCart()
const { state: wizardState } = useWizard()

const { getById } = useProducts()
const logoUrl = computed(() => logo.processedUrl.value || logo.originalUrl.value)
const hasProcessedLogo = computed(() => !!logo.processedUrl.value)
const isProcessingLogo = computed(() => logo.isProcessing.value)
const currentItemIndex = ref(0)

// Track the item being edited so onBeforeUnmount saves to the correct item
let pendingProductId: string | null = null
let pendingVariantId: string | null = null

const itemsWithMockup = computed(() =>
  cart.items.value.filter((item) => {
    if (!item.mockupUrl) return false
    const product = getById(item.productId)
    if (product && product.category === 'suplementos') return false
    return true
  }),
)

const currentItem = computed(() => itemsWithMockup.value[currentItemIndex.value])


function handlePositionChange(_item: CartItem, pos: LogoPosition) {
  const pid = pendingProductId ?? _item.productId
  const vid = pendingVariantId ?? _item.variantId
  cart.updateItemLogoPosition(pid, vid, pos)
}

function handleColorModeChange(_item: CartItem, mode: 'color' | 'black' | 'white') {
  cart.updateItemLogoColorMode(_item.productId, _item.variantId, mode)
}

function handleSave(_item: CartItem, dataUrl: string) {
  const pid = pendingProductId ?? _item.productId
  const vid = pendingVariantId ?? _item.variantId
  cart.updateItemPersonalization(pid, vid, dataUrl)
  pendingProductId = null
  pendingVariantId = null

  // Upload to Supabase storage in background, replacing the data URL with a public URL
  if (wizardState.quoteId) {
    cart.uploadPersonalizedImage(pid, vid, dataUrl, wizardState.quoteId)
  }
}

function goToItem(index: number) {
  const current = itemsWithMockup.value[currentItemIndex.value]
  if (current) {
    pendingProductId = current.productId
    pendingVariantId = current.variantId
  }
  currentItemIndex.value = index
  // Sync URL query param
  router.replace({ query: { ...route.query, product: String(index) } })
}

function handleLogoUploaded(_url: string) {
  // Logo is already stored in useLogo composable
}

async function handleRemoveBackground() {
  await logo.removeBackground()
}

function handleChangeLogo() {
  logo.reset()
}
</script>
