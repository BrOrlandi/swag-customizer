const API_KEYS_STORAGE_KEY = 'swag-customizer:api-keys:v1'
function loadSavedKeys(): Record<string, unknown> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const saved = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || 'null')
    return saved && saved.version === 1 && typeof saved === 'object' ? saved : {}
  } catch { return {} }
}
const savedKeys = loadSavedKeys()
const openaiKey = ref(typeof savedKeys.openaiKey === 'string' ? savedKeys.openaiKey : '')
const geminiKey = ref(typeof savedKeys.geminiKey === 'string' ? savedKeys.geminiKey : '')
const chatProvider = ref<'openai' | '9router'>(savedKeys.chatProvider === '9router' ? '9router' : 'openai')
const chatModel = ref(typeof savedKeys.chatModel === 'string' ? savedKeys.chatModel : 'gpt-4o')
const imageModel = ref(typeof savedKeys.imageModel === 'string' ? savedKeys.imageModel : 'gpt-image-1.5')
const storageError = ref('')
const settingsOpen = ref(false)
const capabilities = ref({ openai: false, gemini: false, email: false })
export function useApiKeys() {
  function persist() {
    try {
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify({ version: 1, openaiKey: openaiKey.value, geminiKey: geminiKey.value, chatProvider: chatProvider.value, chatModel: chatModel.value, imageModel: imageModel.value }))
      storageError.value = ''
      return true
    } catch { storageError.value = 'Não foi possível salvar as chaves neste navegador. Verifique as permissões de armazenamento.'; return false }
  }
  function clear() {
    openaiKey.value = ''; geminiKey.value = ''
    try { localStorage.removeItem(API_KEYS_STORAGE_KEY); storageError.value = '' }
    catch { storageError.value = 'Não foi possível apagar as chaves salvas. Limpe os dados deste site nas configurações do navegador.' }
  }
  function headers(): Record<string, string> {
    return {
      'x-chat-provider': chatProvider.value,
      ...(chatModel.value.trim() ? { 'x-chat-model': chatModel.value.trim() } : {}),
      ...(chatProvider.value === 'openai' && imageModel.value.trim() ? { 'x-image-model': imageModel.value.trim() } : {}),
      ...(openaiKey.value.trim() ? { 'x-openai-key': openaiKey.value.trim() } : {}),
      ...(geminiKey.value.trim() ? { 'x-gemini-key': geminiKey.value.trim() } : {}),
    }
  }
  return { openaiKey, geminiKey, chatProvider, chatModel, imageModel, settingsOpen, capabilities, headers, persist, storageError, clear,
    hasChat: computed(() => !!openaiKey.value.trim() || (chatProvider.value === 'openai' && capabilities.value.openai)),
    hasOpenAI: computed(() => chatProvider.value === 'openai' && (!!openaiKey.value.trim() || capabilities.value.openai)),
    hasGemini: computed(() => !!geminiKey.value.trim() || capabilities.value.gemini),
  }
}
