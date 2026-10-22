<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-primary transition-colors disabled:opacity-50"
      :disabled="modelValue <= min"
      @click="decrement"
    >
      <Icon name="heroicons:minus" class="w-4 h-4" />
    </button>
    <input
      type="number"
      :value="modelValue"
      :min="min"
      :max="max"
      class="w-12 text-center font-semibold text-primary bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      @input="handleInput"
    />
    <button
      type="button"
      class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-primary transition-colors disabled:opacity-50"
      :disabled="modelValue >= max"
      @click="increment"
    >
      <Icon name="heroicons:plus" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: number
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  min: 1,
  max: 999,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function decrement() {
  if (props.modelValue > props.min) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

function increment() {
  if (props.modelValue < props.max) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

function handleInput(event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value, 10)
  if (isNaN(value) || value < props.min) return
  emit('update:modelValue', Math.min(value, props.max))
}
</script>
