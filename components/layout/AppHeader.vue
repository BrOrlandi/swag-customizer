<template>
  <header class="min-h-20 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 print:hidden">
    <NuxtLink to="/"><img :src="assetUrl('/images/swag-logo.svg')" alt="Swag Customizer by @BrOrlandi" class="h-12 sm:h-14" /></NuxtLink>
    <div class="flex flex-wrap items-center gap-2">
      <a href="https://github.com/BrOrlandi/swag-customizer" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border border-gray-200 text-primary rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:bg-gray-50">
        <Icon name="ph:github-logo-fill" class="w-5 h-5" />
        Código fonte
      </a>
      <ContactSolution />
      <button class="border border-blue-200 bg-blue-50 text-primary rounded-lg px-3 py-2 text-xs sm:text-sm font-medium" @click="settingsOpen = true">Configurar chaves de API de IA</button>
    </div>
  </header>
  <ApiKeySettings />
</template>
<script setup lang="ts">
const { settingsOpen, capabilities } = useApiKeys()
onMounted(async () => { try { capabilities.value = await useBackend().request('/api/capabilities') } catch { /* Manual customization remains available. */ } })
</script>
