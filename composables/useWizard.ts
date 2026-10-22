import { WIZARD_STEPS } from '~/types/wizard'
import type { WizardState } from '~/types/wizard'

const state = reactive<WizardState>({
  currentStep: 0,
  quoteId: null,
  contactName: '',
  companyName: '',
  contactEmail: '',
  logoFile: null,
  logoUrl: null,
  logoProcessedUrl: null,
})

export function useWizard() {
  const currentStepConfig = computed(() => WIZARD_STEPS[state.currentStep])
  const totalSteps = computed(() => WIZARD_STEPS.length)
  const isFirstStep = computed(() => state.currentStep === 0)
  const isLastStep = computed(() => state.currentStep === WIZARD_STEPS.length - 1)

  const canProceed = computed(() => {
    if (state.currentStep === 0) {
      return (
        state.contactName.trim() !== '' &&
        state.companyName.trim() !== '' &&
        state.contactEmail.trim() !== ''
      )
    }
    return true
  })

  function nextStep() {
    if (state.currentStep < WIZARD_STEPS.length - 1) {
      state.currentStep++
    }
  }

  function prevStep() {
    if (state.currentStep > 0) {
      state.currentStep--
    }
  }

  function goToStep(n: number) {
    if (n >= 0 && n < WIZARD_STEPS.length) {
      state.currentStep = n
    }
  }

  function reset() {
    state.currentStep = 0
    state.quoteId = null
    state.contactName = ''
    state.companyName = ''
    state.contactEmail = ''
    state.logoFile = null
    state.logoUrl = null
    state.logoProcessedUrl = null
  }

  return {
    state,
    currentStepConfig,
    totalSteps,
    isFirstStep,
    isLastStep,
    canProceed,
    nextStep,
    prevStep,
    goToStep,
    reset,
  }
}
