<template>
  <!-- Mobile toggle button -->
  <button
    class="lg:hidden fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center"
    @click="mobileOpen = !mobileOpen"
  >
    <Icon name="heroicons:shopping-cart" class="w-6 h-6" />
    <span
      v-if="items.length > 0"
      class="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
    >
      {{ items.length }}
    </span>
  </button>

  <!-- Sidebar -->
  <aside
    :class="[
      'bg-white shadow-lg flex flex-col',
      // Mobile: bottom sheet
      'fixed lg:relative inset-x-0 bottom-0 z-30 rounded-t-2xl lg:rounded-none transition-transform duration-300 max-h-[70vh] lg:max-h-none',
      mobileOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0',
      // Desktop: sidebar that grows with content
      'lg:w-80 lg:border-l lg:border-gray-200 lg:self-start lg:min-h-[300px] lg:sticky lg:top-4',
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold text-primary">Seu Kit</h3>
        <span
          v-if="items.length > 0"
          class="bg-accent text-white text-xs px-2 py-0.5 rounded-full"
        >
          {{ items.length }}
        </span>
      </div>
      <button class="lg:hidden text-gray-400 hover:text-gray-600" @click="mobileOpen = false">
        <Icon name="heroicons:x-mark" class="w-5 h-5" />
      </button>
    </div>

    <!-- Items list -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="items.length === 0" class="text-center py-8 text-gray-400 text-sm">
        Nenhum item adicionado
      </div>
      <div v-else class="flex flex-col gap-3">
        <CartItemRow
          v-for="item in items"
          :key="item.productId + item.variantId + item.sizeId"
          :item="item"
        />
      </div>
    </div>

    <!-- Total -->
    <div v-if="items.length > 0" class="border-t p-4">
      <div class="flex justify-between items-center">
        <span class="text-gray-600 font-medium">Total</span>
        <span class="text-lg font-bold text-primary">{{ formatCurrency(totalPrice) }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { items, totalPrice } = useCart()
const mobileOpen = ref(false)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
