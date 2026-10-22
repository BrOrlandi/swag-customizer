import type { NormalizedProduct, ProductCategory } from '~/types/product'

const products = ref<NormalizedProduct[]>([])
const loading = ref(true)
let initialized = false

async function loadProducts() {
  if (initialized && products.value.length > 0) return
  loading.value = true
  try {
    const data = await $fetch<NormalizedProduct[]>(assetUrl('/data/products.json'))
    products.value = data
    initialized = true
  } catch (e) {
    console.error('Failed to load products:', e)
  } finally {
    loading.value = false
  }
}

export function useProducts() {
  if (!initialized) {
    loadProducts()
  }

  function getByCategory(category: ProductCategory) {
    return products.value.filter((p) => p.category === category)
  }

  function getById(id: string) {
    return products.value.find((p) => p.id === id) ?? null
  }

  return {
    products,
    loading,
    loadProducts,
    getByCategory,
    getById,
  }
}
