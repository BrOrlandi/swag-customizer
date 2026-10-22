<template>
  <Teleport to="body">
    <div v-if="settingsOpen" class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" @click.self="settingsOpen = false">
      <section role="dialog" aria-modal="true" aria-labelledby="keys-title" class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h2 id="keys-title" class="text-xl font-bold text-primary">Configurar chaves de API de IA</h2>
        <p class="text-sm text-gray-500 mt-3">As chaves ficam nesta sessão e são enviadas por HTTPS ao backend apenas para processar seus pedidos. Não são salvas. O uso das APIs é cobrado pelos provedores.</p>
        <form class="space-y-4 mt-5" @submit.prevent="save">
          <label class="block text-sm font-medium">OpenAI — agente e imagens
            <input v-model="draftOpenai" type="password" autocomplete="off" spellcheck="false" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Sua chave OpenAI" />
          </label>
          <label class="block text-sm font-medium">Google Gemini — imagens
            <input v-model="draftGemini" type="password" autocomplete="off" spellcheck="false" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Sua chave Gemini" />
          </label>
          <p class="text-xs text-gray-500">Sem chaves, você pode montar kits, personalizar manualmente e exportar PDF. Recarregar a página apaga as chaves.</p>
          <div class="flex justify-between gap-3">
            <button type="button" class="text-sm text-red-600" @click="clearKeys">Apagar chaves</button>
            <div class="flex gap-3"><button type="button" class="text-sm" @click="settingsOpen = false">Cancelar</button><button class="bg-primary text-white rounded-lg px-4 py-2 text-sm">Aplicar</button></div>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
const { openaiKey, geminiKey, settingsOpen, clear } = useApiKeys()
const draftOpenai = ref('')
const draftGemini = ref('')
watch(settingsOpen, open => { if (open) { draftOpenai.value = openaiKey.value; draftGemini.value = geminiKey.value } })
function save() { openaiKey.value = draftOpenai.value.trim(); geminiKey.value = draftGemini.value.trim(); draftOpenai.value = ''; draftGemini.value = ''; settingsOpen.value = false }
function clearKeys() { clear(); draftOpenai.value = ''; draftGemini.value = '' }
</script>
