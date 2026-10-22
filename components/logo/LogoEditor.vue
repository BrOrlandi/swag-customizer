<template>
  <div class="flex flex-col items-center">
    <div class="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div class="absolute top-2 left-2 z-10 flex gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
        <button
          v-for="opt in colorModeOptions"
          :key="opt.value"
          class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all"
          :class="colorMode === opt.value ? 'ring-2 ring-accent bg-white shadow-sm' : 'hover:bg-white/80'"
          @click="applyColorMode(opt.value)"
        >
          <span
            class="w-3 h-3 rounded-full border-2"
            :class="[opt.circleClass, colorMode === opt.value ? 'border-accent' : '']"
          />
          {{ opt.label }}
        </button>
      </div>
      <canvas ref="canvasEl" />
      <!-- Loading overlay during background removal -->
      <div v-if="processing" class="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
        <LoadingSpinner size="lg" />
        <p class="mt-3 text-sm text-gray-500">Removendo fundo do logo...</p>
      </div>
    </div>

    <h3 class="font-semibold text-primary mt-4">{{ productName }}</h3>
    <p class="text-sm text-gray-400">Arraste e redimensione o logo</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mockupUrl: string
  logoUrl: string
  productName: string
  logoPosition?: { left: number; top: number; scaleX: number; scaleY: number; angle: number } | null
  logoColorMode?: 'color' | 'black' | 'white'
  processing?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  save: [dataUrl: string]
  positionChange: [position: { left: number; top: number; scaleX: number; scaleY: number; angle: number }]
  colorModeChange: [mode: 'color' | 'black' | 'white']
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const fabricComposable = useFabric()

type ColorMode = 'color' | 'black' | 'white'
const colorMode = ref<ColorMode>(props.logoColorMode ?? 'color')
const colorModeOptions = [
  { value: 'color' as ColorMode, label: 'Colorido', circleClass: 'bg-gradient-to-br from-red-400 via-green-400 to-blue-400 border-transparent' },
  { value: 'black' as ColorMode, label: 'Preto', circleClass: 'bg-black border-transparent' },
  { value: 'white' as ColorMode, label: 'Branco', circleClass: 'bg-white border-gray-300' },
]

function applyColorMode(mode: ColorMode) {
  colorMode.value = mode
  fabricComposable.setLogoColorMode(mode)
  emit('colorModeChange', mode)
}

const canvasSize = computed(() => {
  if (import.meta.client && window.innerWidth < 640) return 360
  return 600
})

let saveTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedEmitPosition() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    const position = fabricComposable.getLogoPosition()
    if (position) emit('positionChange', position)
  }, 300)
}

onMounted(async () => {
  if (!canvasEl.value) return

  const c = fabricComposable.initCanvas(canvasEl.value, canvasSize.value, canvasSize.value)
  await fabricComposable.setBackgroundImage(props.mockupUrl)
  await fabricComposable.addLogo(props.logoUrl, props.logoPosition ?? undefined)

  // Restore saved color mode
  if (colorMode.value !== 'color') {
    fabricComposable.setLogoColorMode(colorMode.value)
  }

  // Save position on every move/scale/rotate
  c.on('object:modified', debouncedEmitPosition)
  c.on('object:moving', debouncedEmitPosition)
})

// Update logo image when it changes (e.g. after background removal)
watch(() => props.logoUrl, async (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    await fabricComposable.updateLogoImage(newUrl)
    debouncedEmitPosition()
  }
})

onBeforeUnmount(() => {
  // Save position before unmounting
  const position = fabricComposable.getLogoPosition()
  if (position) {
    emit('positionChange', position)
  }

  // Export and save personalized image synchronously
  const dataUrl = fabricComposable.exportCanvasDataUrl()
  if (dataUrl) {
    emit('save', dataUrl)
  }

  fabricComposable.dispose()
})
</script>
