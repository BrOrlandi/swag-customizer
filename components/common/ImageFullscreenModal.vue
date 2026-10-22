<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="imageUrl"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer"
        @click="$emit('close')"
      >
        <button
          class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          @click.stop="$emit('close')"
        >
          <Icon name="heroicons:x-mark" class="w-8 h-8" />
        </button>
        <LoadingSpinner v-if="loading" size="lg" class="text-white" />
        <img
          v-show="!loading"
          :src="imageUrl"
          :alt="alt"
          class="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
          @load="loading = false"
          @click.stop
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  imageUrl: string | null
  alt?: string
  showLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Imagem',
  showLoading: false,
})

defineEmits<{
  close: []
}>()

const loading = ref(false)

watch(() => props.imageUrl, (url) => {
  if (url && props.showLoading) loading.value = true
  else loading.value = false
})
</script>
