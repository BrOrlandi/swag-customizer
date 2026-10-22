<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="saved-title" class="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <Icon name="heroicons:check-circle" class="w-14 h-14 text-blue-600 mx-auto mb-4" />
        <h3 id="saved-title" class="text-xl font-bold text-primary">Proposta salva!</h3>
        <p class="text-sm text-gray-500 my-4">{{ message || 'Seu projeto está salvo neste navegador. Você pode consultá-lo e exportar a proposta em PDF.' }}</p>
        <button class="bg-primary text-white px-5 py-2 rounded-lg" @click="$emit('confirm')">Concluir</button>
      </section>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
defineProps<{ show: boolean; email?: string; message?: string }>()
defineEmits<{ confirm: [] }>()
</script>
