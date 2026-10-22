<template>
  <BaseButton variant="outline" size="lg" @click="openChat">
    <Icon name="heroicons:sparkles" class="w-5 h-5 mr-2" />
    Modo IA
  </BaseButton>
</template>

<script setup lang="ts">
const { openChat } = useAiChat()
</script>
