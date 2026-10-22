<template>
  <div class="w-full">
    <div class="flex items-start justify-center">
      <template v-for="(step, index) in steps" :key="step.id">
        <div class="flex flex-col items-center shrink-0">
          <!-- Step circle -->
          <button
            type="button"
            :class="[
              'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-colors cursor-pointer',
              index < currentStep
                ? 'bg-accent text-white'
                : index === currentStep
                  ? 'bg-accent text-white animate-pulse'
                  : 'bg-gray-300 text-gray-500',
            ]"
            @click="emit('go-to-step', index)"
          >
            <Icon v-if="index < currentStep" name="heroicons:check" class="w-4 h-4" />
            <span v-else>{{ index + 1 }}</span>
          </button>
          <!-- Step label (desktop only) -->
          <span
            :class="[
              'hidden md:block mt-1.5 text-[11px] font-medium text-center leading-tight max-w-[80px]',
              index <= currentStep ? 'text-accent' : 'text-gray-400',
            ]"
          >
            {{ step.label }}
          </span>
        </div>
        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          :class="[
            'h-0.5 mx-0.5 md:mx-1 flex-1 min-w-3 max-w-12 mt-3.5 md:mt-4',
            index < currentStep ? 'bg-accent' : 'bg-gray-300',
          ]"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StepDef {
  id: string
  label: string
  category?: string
}

interface Props {
  steps: StepDef[]
  currentStep: number
}

defineProps<Props>()
const emit = defineEmits<{
  'go-to-step': [index: number]
}>()
</script>
