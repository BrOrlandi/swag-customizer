import type { CartItem, LogoPosition } from '~/types/wizard'

const STORAGE_KEY = 'swag-customizer:cart:v1'

const items = ref<CartItem[]>([])
let initialized = false

function loadFromStorage() {
  if (initialized) return
  initialized = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        items.value = parsed
      }
    }
  } catch {
    // ignore corrupt data
  }

  watch(items, (val) => {
    try {
      const stripped = val.map(i => ({ ...i, personalizedImageUrl: i.personalizedImageUrl?.startsWith('data:') ? null : i.personalizedImageUrl }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped))
    } catch {
      // quota exceeded — ignore
    }
  }, { deep: true })
}

export function useCart() {
  if (import.meta.client) {
    loadFromStorage()
  }
  function findIndex(productId: string, variantId: string, sizeId: string) {
    return items.value.findIndex(
      (i) =>
        i.productId === productId &&
        i.variantId === variantId &&
        i.sizeId === sizeId
    )
  }

  function addItem(item: CartItem) {
    const idx = findIndex(item.productId, item.variantId, item.sizeId)
    if (idx >= 0) {
      items.value[idx].quantity += item.quantity
    } else {
      items.value.push({ ...item })
    }
  }

  function removeItem(productId: string, variantId: string, sizeId: string) {
    const idx = findIndex(productId, variantId, sizeId)
    if (idx >= 0) {
      items.value.splice(idx, 1)
    }
  }

  function updateQuantity(
    productId: string,
    variantId: string,
    sizeId: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeItem(productId, variantId, sizeId)
      return
    }
    const idx = findIndex(productId, variantId, sizeId)
    if (idx >= 0) {
      items.value[idx].quantity = quantity
    }
  }

  function clearCart() {
    items.value = []
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  )

  function getItemsByProduct(productId: string) {
    return items.value.filter((i) => i.productId === productId)
  }

  function updateItemPersonalization(productId: string, variantId: string, imageUrl: string) {
    const idx = items.value.findIndex(
      (i) => i.productId === productId && i.variantId === variantId
    )
    if (idx >= 0) {
      items.value[idx].personalizedImageUrl = imageUrl
    }
  }

  async function uploadPersonalizedImage(
    productId: string,
    variantId: string,
    dataUrl: string,
    quoteId: string
  ): Promise<string | null> {
    try {
      const publicUrl = await useFileUpload().upload(dataUrl)

      const idx = items.value.findIndex(
        (i) => i.productId === productId && i.variantId === variantId
      )
      if (idx >= 0) {
        items.value[idx].personalizedImageUrl = publicUrl
      }

      return publicUrl
    } catch (e: any) {
      console.error('Failed to upload personalized image:', e)
      return null
    }
  }

  function updateItemLogoColorMode(productId: string, variantId: string, mode: 'color' | 'black' | 'white') {
    const idx = items.value.findIndex(
      (i) => i.productId === productId && i.variantId === variantId
    )
    if (idx >= 0) {
      items.value[idx].logoColorMode = mode
    }
  }

  function updateItemLogoPosition(productId: string, variantId: string, position: LogoPosition | null) {
    const idx = items.value.findIndex(
      (i) => i.productId === productId && i.variantId === variantId
    )
    if (idx >= 0) {
      items.value[idx].logoPosition = position
    }
  }

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getItemsByProduct,
    updateItemPersonalization,
    uploadPersonalizedImage,
    updateItemLogoColorMode,
    updateItemLogoPosition,
  }
}
