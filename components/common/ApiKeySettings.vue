<template>
  <Teleport to="body">
    <div v-if="settingsOpen" class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" @click.self="settingsOpen = false">
      <section role="dialog" aria-modal="true" aria-labelledby="keys-title" class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 id="keys-title" class="text-xl font-bold text-primary">Configurar chaves de API de IA</h2>
        <p class="text-sm text-gray-500 mt-3">As chaves ficam salvas no localStorage deste navegador e são enviadas por HTTPS ao backend e ao provedor escolhido apenas para processar seus pedidos. Use “Apagar chaves” para removê-las.</p>
        <form class="space-y-4 mt-5" @submit.prevent="save">
          <label class="block text-sm font-medium">Provedor do agente
            <select v-model="draftProvider" class="mt-1 w-full border rounded-lg px-3 py-2" @change="changeProvider">
              <option value="openai">OpenAI</option><option value="9router">9router</option>
            </select>
          </label>
          <p v-if="draftProvider === '9router'" class="text-xs text-gray-500">Endpoint: https://gateway.example.com/v1. Para imagens, configure Google Gemini abaixo.</p>
          <label class="block text-sm font-medium">{{ draftProvider === '9router' ? 'Chave 9router — agente' : 'Chave OpenAI — agente e imagens' }}
            <input v-model="draftOpenai" type="password" autocomplete="off" spellcheck="false" class="mt-1 w-full border rounded-lg px-3 py-2" :placeholder="draftProvider === '9router' ? 'Sua chave 9router' : 'Sua chave OpenAI'" />
          </label>
          <div class="flex items-end gap-2">
            <label class="block text-sm font-medium flex-1 min-w-0">Modelo do agente
              <input v-model="draftModel" list="chat-model-options" autocomplete="off" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="ID exato do modelo" />
              <datalist id="chat-model-options"><option v-for="model in models" :key="model.id" :value="model.id" /></datalist>
            </label>
            <button type="button" :disabled="loadingModels || !draftOpenai.trim()" class="border rounded-lg px-3 py-2 text-sm text-primary disabled:opacity-50" @click="loadModels">{{ loadingModels ? 'Carregando…' : 'Carregar modelos' }}</button>
          </div>
          <p v-if="modelMessage" role="status" class="text-xs" :class="modelError ? 'text-red-600' : 'text-gray-500'">{{ modelMessage }}</p>
          <label v-if="draftProvider === 'openai'" class="block text-sm font-medium">Modelo de imagem OpenAI
            <input v-model="draftImageModel" list="image-model-options" autocomplete="off" class="mt-1 w-full border rounded-lg px-3 py-2" />
            <datalist id="image-model-options"><option v-for="model in imageModels" :key="model.id" :value="model.id" /></datalist>
          </label>
          <label class="block text-sm font-medium">Google Gemini — imagens
            <input v-model="draftGemini" type="password" autocomplete="off" spellcheck="false" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Sua chave Gemini" />
          </label>
          <p class="text-xs text-gray-500">Você pode escolher um modelo da lista ou digitar seu ID exato. O uso das APIs depende das permissões e limites do provedor. As chaves continuam disponíveis ao recarregar a página.</p>
          <p v-if="storageError" role="alert" class="text-sm text-red-600">{{ storageError }}</p>
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
const { openaiKey, geminiKey, chatProvider, chatModel, imageModel, settingsOpen, clear, persist, storageError } = useApiKeys()
const draftOpenai = ref('')
const draftGemini = ref('')
const draftProvider = ref<'openai'|'9router'>('openai')
const draftModel = ref('')
const draftImageModel = ref('')
const models = ref<Array<{id:string}>>([])
const imageModels = ref<Array<{id:string}>>([])
const loadingModels = ref(false)
const modelMessage = ref('')
const modelError = ref(false)
let requestVersion = 0
watch(settingsOpen, open => {
  requestVersion++
  if (open) { draftOpenai.value = openaiKey.value; draftGemini.value = geminiKey.value; draftProvider.value = chatProvider.value; draftModel.value = chatModel.value; draftImageModel.value = imageModel.value }
  else { draftOpenai.value = ''; draftGemini.value = '' }
  models.value = []; imageModels.value = []; modelMessage.value = ''; loadingModels.value = false
})
function changeProvider() {
  requestVersion++; draftOpenai.value = ''; models.value = []; imageModels.value = []; modelMessage.value = ''; loadingModels.value = false
  draftModel.value = draftProvider.value === '9router' ? 'cx/gpt-6.1-sol' : 'gpt-4o'
}
async function loadModels() {
  const version = ++requestVersion
  loadingModels.value = true; modelMessage.value = ''; modelError.value = false
  try {
    const result = await $fetch<{models:Array<{id:string}>;imageModels:Array<{id:string}>}>(useBackend().url('/api/chat-models'), { headers: { 'x-openai-key': draftOpenai.value.trim(), 'x-chat-provider': draftProvider.value }, timeout: 30000 })
    if (version !== requestVersion) return
    models.value = result.models; imageModels.value = result.imageModels
    modelMessage.value = `${result.models.length} modelos disponíveis. Escolha no campo acima ou digite o ID.`
  } catch(e: any) {
    if (version !== requestVersion) return
    modelError.value = true; modelMessage.value = e.data?.message || 'Não foi possível carregar os modelos. Você pode informar o ID manualmente.'
  } finally { if (version === requestVersion) loadingModels.value = false }
}
function save() {
  openaiKey.value = draftOpenai.value.trim(); geminiKey.value = draftGemini.value.trim(); chatProvider.value = draftProvider.value; chatModel.value = draftModel.value.trim(); imageModel.value = draftImageModel.value.trim(); if (persist()) settingsOpen.value = false
}
function clearKeys() { clear(); draftOpenai.value = ''; draftGemini.value = ''; models.value = []; modelMessage.value = '' }
</script>
