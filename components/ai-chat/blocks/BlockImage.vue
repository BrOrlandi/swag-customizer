<template>
  <div
    class="rounded-xl overflow-hidden border border-gray-200"
    :class="{ 'bg-checkerboard': transparent }"
  >
    <ExpiringImage
      :src="url"
      :alt="alt || 'Imagem gerada'"
      class="w-full h-auto"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  url: string
  alt?: string
  transparent?: boolean
}

withDefaults(defineProps<Props>(), {
  transparent: false,
})
</script>

<style scoped>
.bg-checkerboard {
  background-image: repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%);
  background-size: 16px 16px;
}
</style>
