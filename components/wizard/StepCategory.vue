<template>
  <div>
    <!-- Supplements callout -->
    <div
      v-if="categories.includes('suplementos')"
      class="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 text-sm text-primary"
    >
      Que tal incluir suplementos de bem-estar no kit? Produtos da Rituaria são perfeitos para kits de wellness corporativo.
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="products.length === 0"
      class="text-center py-20 text-gray-400"
    >
      <Icon name="heroicons:inbox" class="w-12 h-12 mx-auto mb-3" />
      <p>Nenhum produto encontrado nesta categoria.</p>
    </div>

    <!-- Product grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @add="handleAddToCart"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import type { ProductCategory } from '~/types/product'
import type { CartItem } from '~/types/wizard'

interface Props {
  categories: ProductCategory[]
}

const props = defineProps<Props>()

const { getByCategory, loading: productsLoading } = useProducts()
const cart = useCart()

const loading = productsLoading
const products = computed(() =>
  props.categories.flatMap((cat) => getByCategory(cat))
)

function handleAddToCart(item: Omit<CartItem, 'personalizedImageUrl' | 'logoPosition' | 'logoColorMode'>) {
  cart.addItem({ ...item, personalizedImageUrl: null, logoPosition: null, logoColorMode: 'color' })
}

</script>
