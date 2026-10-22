export function buildGeminiPrompt(productDescriptions: string): string {
  return `A high-resolution, studio-lit product photograph of corporate gift items arranged on a modern office desk. The scene is captured with an 85mm lens at f/4 from an elevated 35-degree angle.

PRODUCT CATALOG — render each product at its EXACT real-world dimensions listed below. The size ratios between products must be physically correct:
${productDescriptions}

IMAGE REFERENCE KEY:
- For each product, the FIRST attached image is the customized mockup showing the logo/artwork already applied. This is your PRIMARY reference for artwork placement, colors, and position.
- Additional images show the same product from other angles to help you understand its 3D shape, material texture, and proportions.

SCENE DESCRIPTION:
A clean corporate office desk made of light natural wood with visible grain texture. The desk surface has subtle warm reflections. The background is a softly blurred modern office environment — completely out of focus.

ARTWORK PRESERVATION — this is critical:
- Reproduce the printed logo/artwork on each product EXACTLY as it appears in the mockup reference: identical position, identical angle, identical scale, identical colors.
- Change nothing about the artwork — same hue, same saturation, same brightness. Preserve color fidelity with zero shift.
- The print looks like a real silk-screen or DTF transfer physically bonded to the product surface.

PRODUCT FIDELITY:
- Each product must appear at its real-world size. A 55cm-tall suitcase must tower over a 25cm-tall water bottle. A backpack at 45cm must be visibly smaller than the suitcase but much larger than a bottle.
- Suitcases and luggage: rigid ABS plastic shell with subtle sheen, visible ribbing/ridges, real spinner wheels, telescopic handle extended slightly. Heavy, solid presence.
- Backpacks and bags: real polyester or nylon fabric with visible weave texture, functional zippers with metal pulls, padded straps, real stitching lines.
- Bottles and tumblers: real stainless steel or plastic with natural specular highlights and reflections. The logo follows the cylinder curvature.
- All products sit firmly on the desk with natural contact shadows showing real weight — no floating, no plastic toy appearance.

LIGHTING:
Three-point softbox setup. Key light: soft diffused overhead, slightly left. Fill light: gentle warm from right. Rim light: subtle back-edge separation. Natural contact shadows under each product. Slight specular highlights on metal and glossy surfaces.

ABSOLUTE RESTRICTIONS:
- The image contains ONLY the products with their existing printed artwork, the desk, and the minimal props. Nothing else.
- Do not add any text, labels, product names, brand names, captions, or words anywhere in the image or on the products.
- Do not invent or add any graphic, pattern, or design element not present in the reference mockups.
- Output a single photorealistic photograph — not a collage, not multiple panels, no watermarks, no borders.`
}
