<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-accent">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: string | number
  type?: string
  placeholder?: string
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
</script>
