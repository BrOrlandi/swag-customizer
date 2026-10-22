<template>
  <div class="flex items-center justify-between px-4 py-3 bg-accent text-white rounded-t-2xl">
    <div class="flex items-center gap-2">
      <Icon name="heroicons:sparkles-solid" class="w-5 h-5" />
      <span class="font-semibold text-sm">Agente IA Swag</span>
    </div>
    <div class="flex items-center gap-1">
      <button
        class="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        title="Minimizar"
        @click="$emit('minimize')"
      >
        <Icon name="heroicons:minus" class="w-4 h-4" />
      </button>
      <button
        class="hidden sm:block p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        :title="isMaximized ? 'Restaurar' : 'Maximizar'"
        @click="$emit('toggle-maximize')"
      >
        <Icon
          :name="isMaximized ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'"
          class="w-4 h-4"
        />
      </button>
      <button
        class="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        title="Fechar"
        @click="$emit('close')"
      >
        <Icon name="heroicons:x-mark" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isMaximized?: boolean
}

withDefaults(defineProps<Props>(), {
  isMaximized: false,
})

defineEmits<{
  minimize: []
  'toggle-maximize': []
  close: []
}>()
</script>
