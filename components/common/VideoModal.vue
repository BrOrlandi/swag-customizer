<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click="$emit('close')"
      >
        <div class="relative w-full max-w-3xl mx-4" @click.stop>
          <button
            class="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
            @click="$emit('close')"
          >
            <Icon name="heroicons:x-mark" class="w-8 h-8" />
          </button>
          <div class="relative w-full" style="padding-bottom: 56.25%">
            <iframe
              v-if="show"
              class="absolute inset-0 w-full h-full rounded-lg"
              :src="embedUrl"
              title="Apresentação em vídeo"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  videoId: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const embedUrl = computed(() => `https://www.youtube.com/embed/${props.videoId}?autoplay=1`)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
