export function buildOpenAIPrompt(productDescriptions: string): string {
  return `Generate a single photorealistic product photograph.

MANUFACTURER BRANDING: The base products are unbranded. Keep manufacturer patches, side tags, caps and surfaces free of manufacturer names or logos. Do not restore any branding removed from the references. Preserve only the user-supplied custom artwork.

PRODUCTS (with exact real-world dimensions — respect these sizes precisely):
${productDescriptions}

REFERENCE IMAGES:
The attached images show each product with a custom logo already printed on it. For each product:
- Preserve the logo/artwork exactly as shown: same position, same scale, same angle, same colors. Do not move, resize, rotate, mirror, or recolor the artwork.
- Additional reference images of the same product show other angles for understanding its 3D shape and material.

SCENE:
Place all products on a real light-wood corporate office desk, photographed from an elevated 35-degree angle with an 85mm lens at f/4. The desk has visible wood grain texture and subtle warm reflections. Background: softly blurred modern office, completely out of focus. Include a small plant leaf as minimal props.

CRITICAL — SIZE ACCURACY:
Each product must be rendered at its correct real-world scale relative to every other product. A carry-on suitcase (55cm tall) must be significantly larger than a backpack (45cm), which must be significantly larger than a water bottle (25cm). The size ratios must look physically accurate as if you placed the real products side by side.

MATERIAL FIDELITY:
- Suitcases: rigid ABS plastic shell, subtle sheen, visible ridges, real spinner wheels, telescopic handle. Heavy and solid.
- Bags/backpacks: real polyester fabric with visible weave, functional zippers, padded straps, real stitching.
- Bottles: real stainless steel or plastic, natural specular highlights, logo follows cylinder curvature.
- Each product has real weight — proper contact shadows, no floating appearance.

ARTWORK RULES:
- The logo print is a silk-screen or DTF transfer bonded to the surface.
- Colors are pixel-perfect to the reference — no color shift, no desaturation, no tint.
- Do not add any text, labels, product names, or words anywhere. The only graphic on each product is the printed logo from the mockup.

LIGHTING:
Soft diffused three-point lighting. Key light overhead-left, warm fill from right, subtle rim light for edge separation. Natural contact shadows. Specular highlights on glossy and metal surfaces. Shallow depth of field.

OUTPUT:
A single photorealistic photograph. No collage, no split panels, no frames, no watermarks, no labels.`
}
