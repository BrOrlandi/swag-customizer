import type { ChatMessage, MessageBlock } from '~/types/ai-chat'

const STORAGE_KEY = 'swag-customizer:chat:v1'

interface PersistedState {
  messages: ChatMessage[]
  sessionId: string | null
  quoteId: string | null
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
}

function loadPersistedState(): PersistedState | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function persistState(state: PersistedState) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded, ignore */ }
}

function clearPersistedState() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// Restore from localStorage on module init
const persisted = loadPersistedState()

const isOpen = ref(persisted?.isOpen ?? false)
const isMinimized = ref(persisted?.isMinimized ?? false)
const isMaximized = ref(persisted?.isMaximized ?? false)
const messages = ref<ChatMessage[]>(persisted?.messages ?? [])
const sessionId = ref<string | null>(persisted?.sessionId ?? null)
const quoteId = ref<string | null>(persisted?.quoteId ?? null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const showCloseConfirm = ref(false)

export function useAiChat() {
  // Watch key state and persist on change
  function save() {
    // Strip loading flag before persisting
    const cleanMessages = messages.value.map((m) => {
      if (m.loading) {
        const { loading, ...rest } = m
        return rest
      }
      return m
    })
    persistState({
      messages: cleanMessages,
      sessionId: sessionId.value,
      quoteId: quoteId.value,
      isOpen: isOpen.value,
      isMinimized: isMinimized.value,
      isMaximized: isMaximized.value,
    })
  }

  watch([messages, sessionId, quoteId, isOpen, isMinimized, isMaximized], save, { deep: true })

  function toggleMaximize() {
    isMaximized.value = !isMaximized.value
  }

  function openChat() {
    if (!useApiKeys().hasOpenAI.value) { useApiKeys().settingsOpen.value = true; return }
    isOpen.value = true
    isMinimized.value = false

    // Send initial greeting if no messages
    if (messages.value.length === 0) {
      const greeting: ChatMessage = {
        role: 'assistant',
        content: 'Olá! Sou o **Agente de IA da Swag Customizer** 🤖\n\nPosso ajudar você a montar um kit corporativo personalizado de forma rápida e fácil.\n\nPara começar, qual é o seu **nome completo**?',
        timestamp: new Date().toISOString(),
      }
      messages.value.push(greeting)
    }
  }

  function requestCloseChat() {
    const hasUserMessages = messages.value.some((m) => m.role === 'user')
    if (hasUserMessages) {
      showCloseConfirm.value = true
    } else {
      confirmCloseChat()
    }
  }

  function cancelCloseChat() {
    showCloseConfirm.value = false
  }

  function confirmCloseChat() {
    showCloseConfirm.value = false
    isOpen.value = false
    isMinimized.value = false
    isMaximized.value = false
    messages.value = []
    sessionId.value = null
    quoteId.value = null
    error.value = null
    clearPersistedState()
  }

  function minimizeChat() {
    isMinimized.value = true
  }

  function restoreChat() {
    isMinimized.value = false
  }

  async function sendMessage(content: string, blocks?: MessageBlock[]) {
    if (!content.trim() || isLoading.value) return

    if (!useApiKeys().hasOpenAI.value) { useApiKeys().settingsOpen.value = true; return }
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      blocks: blocks?.length ? blocks : undefined,
      timestamp: new Date().toISOString(),
    }
    messages.value.push(userMessage)

    isLoading.value = true
    error.value = null

    try {
      const response = await useBackend().request('/api/ai-chat/stream', {
        method: 'POST',
        body: {
          message: content.trim(),
          quote: quoteId.value ? await useQuotes().fetchQuote(quoteId.value) : null,
          history: messages.value.slice(-61, -1).map(({ role, content, timestamp }) => ({ role, content, timestamp })),
        },
      })

      const data = response as any
      if (data.quote) await useQuotes().saveAgentQuote(data.quote)
      if (data.sessionId) sessionId.value = data.sessionId
      if (data.quoteId) quoteId.value = data.quoteId
      if (data.message) messages.value.push(data.message)
    } catch (e: any) {
      error.value = e.data?.message || 'Não foi possível enviar a mensagem. Tente novamente.'
      messages.value.push({
        role: 'assistant',
        content: e.statusCode === 401 || e.statusCode === 403 || e.status === 401 || e.status === 403
          ? 'Sua chave OpenAI é inválida ou não tem acesso ao modelo. Abra “Configurar chaves de API de IA” para informar outra chave.'
          : error.value || 'Não foi possível concluir o pedido. Tente novamente.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      isLoading.value = false
    }
  }

  async function uploadLogo(file: File, isProcessed = false): Promise<string | null> {
    if (!quoteId.value) {
      error.value = 'Nenhum orçamento criado ainda.'
      return null
    }

    try {
      const logoUrl = await useFileUpload().upload(file)
      const q = await useQuotes().fetchQuote(quoteId.value)
      if (q) await useQuotes().updateQuoteLogo(q.id, isProcessed ? q.logo_url : logoUrl, isProcessed ? logoUrl : null)
      return logoUrl
    } catch(e: any) { error.value = e.message || 'Falha ao enviar logo'; return null }
  }

  /**
   * Handles the full logo upload flow:
   * 1. Shows original image in user message immediately
   * 2. If BG removal needed: shows agent "processing" message with loading
   * 3. Processes BG removal client-side
   * 4. Uploads processed file
   * 5. Updates agent message with processed image
   * 6. Sends to AI for natural response
   */
  async function handleLogoUpload(file: File) {
    const { hasTransparency } = await import('~/utils/process-logo')

    // Step 1: Upload original file
    const originalUrl = await uploadLogo(file)
    if (!originalUrl) return

    // Step 2: Check if needs BG removal
    const needsBgRemoval = !(await hasTransparency(file))
    let finalUrl = originalUrl

    // Step 3: Add user message with original image
    messages.value.push({
      role: 'user',
      content: 'Enviei o logo da empresa',
      blocks: [{ type: 'image', url: originalUrl, alt: 'Logo da empresa' }],
      timestamp: new Date().toISOString(),
    })

    if (needsBgRemoval) {
      // Step 4: Add agent "processing" message with loading
      const processingIdx = messages.value.length
      messages.value.push({
        role: 'assistant',
        content: 'Recebi seu logo! Estou removendo o fundo da imagem para ficar perfeito na personalização dos produtos...',
        loading: true,
        timestamp: new Date().toISOString(),
      })

      try {
        // Step 5: Process BG removal client-side
        const { removeBackground } = await import('@imgly/background-removal')
        const blob = await removeBackground(file)
        const processedFile = new File([blob], 'logo-processed.png', { type: 'image/png' })

        // Step 6: Upload processed file (saved as logo_processed_url)
        const processedUrl = await uploadLogo(processedFile, true)
        if (processedUrl) finalUrl = processedUrl

        // Step 7: Update processing message with result
        messages.value[processingIdx] = {
          role: 'assistant',
          content: 'Pronto! Já removi o fundo do seu logo para ficar perfeito na personalização dos produtos.',
          blocks: [{ type: 'image', url: finalUrl, alt: 'Logo com fundo removido', transparent: true }],
          timestamp: new Date().toISOString(),
        }
      } catch (e) {
        console.error('Background removal failed')
        // Failed: just use original
        messages.value[processingIdx] = {
          role: 'assistant',
          content: 'Recebi seu logo!',
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Step 8: Send to AI backend (user message already in history)
    isLoading.value = true
    error.value = null

    try {
      const response = await useBackend().request('/api/ai-chat/stream', {
        method: 'POST',
        body: {
          message: `Logo da empresa enviado${needsBgRemoval ? ' (fundo removido automaticamente)' : ''}. URL do logo: ${finalUrl}`,
          quote: quoteId.value ? await useQuotes().fetchQuote(quoteId.value) : null,
          history: messages.value.slice(-60).map(({ role, content, timestamp }) => ({ role, content, timestamp })),
          userMessageIncluded: true,
        },
      })

      const data = response as any
      if (data.quote) await useQuotes().saveAgentQuote(data.quote)
      if (data.sessionId) sessionId.value = data.sessionId
      if (data.quoteId) quoteId.value = data.quoteId
      if (data.message) messages.value.push(data.message)
    } catch (e: any) {
      error.value = e.data?.message || 'Não foi possível enviar a mensagem. Tente novamente.'
      messages.value.push({
        role: 'assistant',
        content: e.statusCode === 401 || e.statusCode === 403 || e.status === 401 || e.status === 403
          ? 'Sua chave OpenAI é inválida ou não tem acesso ao modelo. Abra “Configurar chaves de API de IA” para informar outra chave.'
          : error.value || 'Não foi possível concluir o pedido. Tente novamente.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    isOpen,
    isMinimized,
    isMaximized,
    messages,
    sessionId,
    quoteId,
    isLoading,
    error,
    showCloseConfirm,
    openChat,
    requestCloseChat,
    cancelCloseChat,
    confirmCloseChat,
    minimizeChat,
    restoreChat,
    toggleMaximize,
    sendMessage,
    uploadLogo,
    handleLogoUpload,
  }
}
