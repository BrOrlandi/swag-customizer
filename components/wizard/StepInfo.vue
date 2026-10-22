<template>
  <div class="max-w-lg mx-auto">
    <div class="bg-white rounded-xl shadow-sm p-6 md:p-8">
      <h2 class="text-xl font-semibold text-primary mb-6">Informações de contato</h2>
      <form class="flex flex-col gap-5" @submit.prevent="handleContinue">
        <BaseInput
          v-model="contactName"
          label="Nome do contato"
          placeholder="Seu nome completo"
          :required="true"
        />
        <BaseInput
          v-model="companyName"
          label="Nome da empresa"
          placeholder="Nome da empresa"
          :required="true"
        />
        <BaseInput
          v-model="contactEmail"
          type="email"
          label="E-mail de contato"
          placeholder="email@empresa.com"
          :required="true"
        />
        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
        <BaseButton type="submit" variant="accent" size="lg" class="mt-2 w-full" :disabled="saving">
          <LoadingSpinner v-if="saving" size="sm" class="mr-2" />
          {{ saving ? 'Salvando...' : 'Continuar' }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const wizard = useWizard()
const quotes = useQuotes()

const contactName = computed({
  get: () => wizard.state.contactName,
  set: (v: string) => { wizard.state.contactName = v },
})
const companyName = computed({
  get: () => wizard.state.companyName,
  set: (v: string) => { wizard.state.companyName = v },
})
const contactEmail = computed({
  get: () => wizard.state.contactEmail,
  set: (v: string) => { wizard.state.contactEmail = v },
})

const errorMessage = ref('')
const saving = ref(false)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleContinue() {
  errorMessage.value = ''

  if (!contactName.value.trim() || !companyName.value.trim() || !contactEmail.value.trim()) {
    errorMessage.value = 'Todos os campos são obrigatórios.'
    return
  }

  if (!isValidEmail(contactEmail.value)) {
    errorMessage.value = 'Insira um e-mail válido.'
    return
  }

  // Create draft quote if not already created
  if (!wizard.state.quoteId) {
    saving.value = true
    try {
      const quoteId = await quotes.createDraftQuote(wizard.state)
      if (quoteId) {
        wizard.state.quoteId = quoteId
      } else {
        errorMessage.value = 'Erro ao salvar o orçamento. Tente novamente.'
        return
      }
    } finally {
      saving.value = false
    }
  }

  wizard.nextStep()
}
</script>
