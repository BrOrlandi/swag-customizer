<template>
  <div class="prose prose-sm max-w-none text-sm leading-relaxed" v-html="renderedHtml" />
</template>

<script setup lang="ts">
interface Props {
  content: string
}

const props = defineProps<Props>()

const renderedHtml = computed(() => {
  // Simple markdown rendering (bold, italic, line breaks)
  return props.content
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
})
</script>
