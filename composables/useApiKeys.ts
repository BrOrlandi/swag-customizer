// Intentionally held only in memory: never persist keys in browser storage.
const openaiKey = ref('')
const geminiKey = ref('')
const chatProvider = ref<'openai' | '9router'>('openai')
const chatModel = ref('gpt-4o')
const imageModel = ref('gpt-image-1.5')
const settingsOpen = ref(false)
const capabilities = ref({ openai: false, gemini: false, email: false })
export function useApiKeys() {
  function headers(): Record<string, string> {
    return {
      'x-chat-provider': chatProvider.value,
      ...(chatModel.value.trim() ? { 'x-chat-model': chatModel.value.trim() } : {}),
      ...(chatProvider.value === 'openai' && imageModel.value.trim() ? { 'x-image-model': imageModel.value.trim() } : {}),
      ...(openaiKey.value.trim() ? { 'x-openai-key': openaiKey.value.trim() } : {}),
      ...(geminiKey.value.trim() ? { 'x-gemini-key': geminiKey.value.trim() } : {}),
    }
  }
  return { openaiKey, geminiKey, chatProvider, chatModel, imageModel, settingsOpen, capabilities, headers,
    hasChat: computed(() => !!openaiKey.value.trim() || (chatProvider.value === 'openai' && capabilities.value.openai)),
    hasOpenAI: computed(() => chatProvider.value === 'openai' && (!!openaiKey.value.trim() || capabilities.value.openai)),
    hasGemini: computed(() => !!geminiKey.value.trim() || capabilities.value.gemini),
    clear: () => { openaiKey.value = ''; geminiKey.value = '' },
  }
}
