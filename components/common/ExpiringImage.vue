<template>
  <img v-if="!failed" v-bind="$attrs" :src="src || undefined" @error="failed = true" />
  <span v-else v-bind="$attrs" role="status" class="inline-flex items-center justify-center bg-gray-100 text-gray-500 text-xs p-4">Imagem indisponível ou expirada. Envie ou gere novamente.</span>
</template>
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = defineProps<{ src?: string | null }>()
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>
