const logoFile = ref<File | null>(null)
const originalUrl = ref<string | null>(null)
const processedUrl = ref<string | null>(null)
const isProcessing = ref(false)
const error = ref<string | null>(null)

export function useLogo() {
  function setLogo(file: File) {
    logoFile.value = file
    error.value = null
    processedUrl.value = null
    const reader = new FileReader()
    reader.onload = (e) => {
      originalUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  async function removeBackground() {
    if (!originalUrl.value) return
    isProcessing.value = true
    error.value = null
    try {
      const { removeBackground: removeBg } = await import(
        '@imgly/background-removal'
      )
      const blob = await removeBg(originalUrl.value)
      const dataUrl = await blobToDataUrl(blob)
      processedUrl.value = dataUrl
    } catch (e: any) {
      error.value =
        e.message || 'Failed to remove background. The package may not be installed.'
      console.error('Background removal error:', e)
    } finally {
      isProcessing.value = false
    }
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  function generateWhiteVersion(imageDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            data[i] = 255
            data[i + 1] = 255
            data[i + 2] = 255
          }
        }
        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageDataUrl
    })
  }

  function needsWhiteVersion(colorName: string): boolean {
    const darkColors = [
      'Preto',
      'Preta',
      'Chumbo',
      'Azul Marinho',
      'Marrom',
      'Vinho',
    ]
    return darkColors.some(
      (c) => colorName.toLowerCase() === c.toLowerCase()
    )
  }

  async function uploadToBackend(dataUrl: string, _path?: string, _oldUrl?: string | null): Promise<string | null> {
    try { return await useFileUpload().upload(dataUrl) }
    catch (e: any) { error.value = e.message || 'Falha ao enviar logo'; return null }
  }

  function reset() {
    logoFile.value = null
    originalUrl.value = null
    processedUrl.value = null
    isProcessing.value = false
    error.value = null
  }

  return {
    logoFile,
    originalUrl,
    processedUrl,
    isProcessing,
    error,
    setLogo,
    removeBackground,
    generateWhiteVersion,
    needsWhiteVersion,
    uploadToBackend,
    reset,
  }
}
