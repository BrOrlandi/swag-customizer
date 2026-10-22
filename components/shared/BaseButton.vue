<template>
  <button
    :class="[baseClasses, variantClasses[variant], sizeClasses[size]]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})

defineEmits<{
  click: []
}>()

const baseClasses = 'rounded-full font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center'

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  accent: 'bg-accent text-white hover:bg-accent/90',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-primary hover:bg-gray-100',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5',
  lg: 'px-8 py-3 text-lg',
}
</script>
