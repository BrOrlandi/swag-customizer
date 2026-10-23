<template>
  <header class="min-h-20 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 print:hidden">
    <NuxtLink to="/"><img :src="assetUrl('/images/swag-logo.svg')" alt="Swag Customizer by @BrOrlandi" class="h-12 sm:h-14" /></NuxtLink>
    <div class="flex flex-wrap items-center gap-2">
      <a href="https://github.com/BrOrlandi/swag-customizer" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border border-gray-200 text-primary rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:bg-gray-50">
        <Icon name="ph:github-logo-fill" class="w-5 h-5" />
        Código fonte
      </a>
      <ContactSolution />
      <button class="api-keys-button border rounded-lg px-3 py-2 text-xs sm:text-sm font-medium" :class="hasChat ? 'border-blue-200 bg-blue-50 text-primary' : 'api-keys-missing'" :aria-label="hasChat ? 'Configurar chaves de API de IA' : 'Configurar chaves de API de IA — configuração pendente'" @click="settingsOpen = true">Configurar chaves de API de IA</button>
    </div>
  </header>
  <ApiKeySettings />
</template>
<script setup lang="ts">
const { settingsOpen, capabilities, hasChat } = useApiKeys()
onMounted(async () => { try { capabilities.value = await useBackend().request('/api/capabilities') } catch { /* Manual customization remains available. */ } })
</script>

<style scoped>
.api-keys-missing { color: #b91c1c; background: #fef2f2; border-color: #f87171; animation: api-key-pulse 1.8s ease-in-out infinite; }
@keyframes api-key-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(239 68 68 / 0); } 50% { box-shadow: 0 0 0 5px rgb(239 68 68 / .22); } }
@media (prefers-reduced-motion: reduce) { .api-keys-missing { animation: none; box-shadow: 0 0 0 3px rgb(239 68 68 / .18); } }
</style>
