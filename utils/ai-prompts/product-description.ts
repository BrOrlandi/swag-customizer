import type { AiPhotoProduct } from '~/composables/useAiPhoto'

export function buildProductDescription(products: AiPhotoProduct[]): string {
  // Sort by height descending to help the model understand relative scale
  const sorted = [...products].sort((a, b) => {
    const ha = a.product?.dimensions?.height_cm ?? 0
    const hb = b.product?.dimensions?.height_cm ?? 0
    return hb - ha
  })

  const descriptions = sorted.map(({ item, product }, i) => {
    const lines: string[] = []
    lines.push(
      `[Product ${i + 1}]: "${item.productName}" — color: ${item.colorName}`,
    )

    if (product?.dimensions) {
      const d = product.dimensions
      lines.push(
        `  REAL-WORLD SIZE: ${d.height_cm}cm tall × ${d.width_cm}cm wide × ${d.depth_cm}cm deep`,
      )
      if (d.description) lines.push(`  Material/build: ${d.description}`)
    }

    if (product?.description) {
      const shortDesc = product.description
        .split('\n')
        .slice(0, 2)
        .join(' ')
        .substring(0, 200)
      lines.push(`  Description: ${shortDesc}`)
    }

    if (product?.category) {
      lines.push(`  Category: ${product.category}`)
    }

    return lines.join('\n')
  })

  // Add explicit size comparison
  const withDimensions = sorted.filter(({ product }) => product?.dimensions)
  if (withDimensions.length >= 2) {
    const tallest = withDimensions[0]
    const smallest = withDimensions[withDimensions.length - 1]
    const th = tallest.product!.dimensions!.height_cm
    const sh = smallest.product!.dimensions!.height_cm
    const ratio = (th / sh).toFixed(1)
    descriptions.push(
      `\nSIZE COMPARISON: "${tallest.item.productName}" (${th}cm tall) is ${ratio}× taller than "${smallest.item.productName}" (${sh}cm tall). Respect these proportions exactly — the relative sizes between all products must be physically accurate.`,
    )
  }

  return descriptions.join('\n\n')
}
