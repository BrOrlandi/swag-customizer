/**
 * Client-side logo utilities: checks if an image has transparency.
 * Background removal is handled separately in the chat flow.
 */

export async function hasTransparency(file: File): Promise<boolean> {
  // SVGs are always considered transparent
  if (file.type === 'image/svg+xml') return true

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // Sample at reduced size for performance
      const scale = Math.min(1, 100 / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Check border pixels for transparency
      const w = canvas.width
      const h = canvas.height
      let transparentCount = 0
      const borderPixels: number[] = []

      for (let x = 0; x < w; x++) {
        borderPixels.push((0 * w + x) * 4 + 3)
        borderPixels.push(((h - 1) * w + x) * 4 + 3)
      }
      for (let y = 0; y < h; y++) {
        borderPixels.push((y * w + 0) * 4 + 3)
        borderPixels.push((y * w + (w - 1)) * 4 + 3)
      }

      for (const idx of borderPixels) {
        if (data[idx] < 250) transparentCount++
      }

      resolve(transparentCount / borderPixels.length > 0.1)
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(file)
  })
}
