<template>
  <div class="flex items-center justify-center">
    <div
      :class="[
        'animate-spin rounded-full border-2 border-gray-200 border-t-accent',
        sizeClasses[size],
      ]"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses: Record<string, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}
</script>
