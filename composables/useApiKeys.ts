// Intentionally held only in memory: never persist keys in browser storage.
const openaiKey = ref('')
const geminiKey = ref('')
const settingsOpen = ref(false)
const capabilities = ref({ openai: false, gemini: false, email: false })
export function useApiKeys() {
  function headers(): Record<string, string> {
    return {
      ...(openaiKey.value.trim() ? { 'x-openai-key': openaiKey.value.trim() } : {}),
      ...(geminiKey.value.trim() ? { 'x-gemini-key': geminiKey.value.trim() } : {}),
    }
  }
  return { openaiKey, geminiKey, settingsOpen, capabilities, headers,
    hasOpenAI: computed(() => !!openaiKey.value.trim() || capabilities.value.openai),
    hasGemini: computed(() => !!geminiKey.value.trim() || capabilities.value.gemini),
    clear: () => { openaiKey.value = ''; geminiKey.value = '' },
  }
}
