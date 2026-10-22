import type { NormalizedProduct } from '~/types/product';
import type { CartItem } from '~/types/wizard';
import { buildProductDescription } from '~/utils/ai-prompts/product-description';
import { buildGeminiPrompt } from '~/utils/ai-prompts/gemini-prompt';
import { buildOpenAIPrompt } from '~/utils/ai-prompts/openai-prompt';

export interface AiPhotoProduct {
  item: CartItem;
  product: NormalizedProduct | null;
}

export type AiModelId = 'gemini-pro' | 'gpt-image';

export interface AiModelOption {
  id: AiModelId;
  label: string;
  description: string;
}

export const AI_MODELS: AiModelOption[] = [
  {
    id: 'gemini-pro',
    label: 'Google Gemini',
    description: 'Prévia do kit com Google',
  },
  {
    id: 'gpt-image',
    label: 'OpenAI Image',
    description: 'Prévia do kit com OpenAI',
  },
];

const isGenerating = ref(false);
const generatedUrl = ref<string | null>(null);
const error = ref<string | null>(null);
const selectedModel = ref<AiModelId>('gemini-pro');

export function useAiPhoto() {
  const isConfigured = computed(() => {
    const keys = useApiKeys();
    const model = selectedModel.value;
    if (model === 'gpt-image') return keys.hasOpenAI.value;
    return keys.hasGemini.value;
  });

  const availableModels = computed(() => {
    const keys = useApiKeys();
    return AI_MODELS.filter((m) => {
      if (m.id === 'gpt-image') return keys.hasOpenAI.value;
      return keys.hasGemini.value;
    });
  });

  watch(availableModels, (models) => {
    if (!models.some(m => m.id === selectedModel.value) && models[0]) selectedModel.value = models[0].id;
  }, { immediate: true });

  async function generatePhoto(products: AiPhotoProduct[]) {
    if (!isConfigured.value) {
      error.value = 'Chave de API não configurada para o modelo selecionado.';
      return;
    }

    isGenerating.value = true;
    error.value = null;
    generatedUrl.value = null;

    try {
      const productDescriptions = buildProductDescription(products);

      let imageBase64: string;
      let mimeType: string;

      if (selectedModel.value === 'gpt-image') {
        const prompt = buildOpenAIPrompt(productDescriptions);
        const result = await generateWithOpenAI(products, prompt);
        imageBase64 = result.data;
        mimeType = result.mimeType;
      } else {
        const prompt = buildGeminiPrompt(productDescriptions);
        const result = await generateWithGemini(products, prompt);
        imageBase64 = result.data;
        mimeType = result.mimeType;
      }

      // Apply watermark
      const watermarkedBase64 = await applyWatermark(imageBase64, mimeType);

      const dataUrl = `data:image/png;base64,${watermarkedBase64}`;
      generatedUrl.value = await useFileUpload().upload(dataUrl);
    } catch (e: any) {
      error.value = e.data?.message || 'Não foi possível gerar a imagem. Verifique sua chave e tente novamente.';
      console.error('AI photo generation failed');
    } finally {
      isGenerating.value = false;
    }
  }

  async function generateWithGemini(
    products: AiPhotoProduct[],
    prompt: string,
  ): Promise<{ data: string; mimeType: string }> {
    const imageParts = await collectImageParts(products);

    return await useBackend().request('/api/ai-photo/gemini', {
      method: 'POST',
      body: {
        prompt,
        imageParts,
        
      },
    });
  }

  async function generateWithOpenAI(
    products: AiPhotoProduct[],
    prompt: string,
  ): Promise<{ data: string; mimeType: string }> {
    const images: Array<{ data: string; mimeType: string; filename: string }> = [];

    for (const { item, product } of products) {
      const primaryUrl = item.personalizedImageUrl || item.mockupUrl;
      if (primaryUrl) {
        const part = await fetchImageAsBase64(primaryUrl);
        if (part) images.push({ ...part, filename: `product-${images.length}.png` });
      }
      if (product?.referenceImages) {
        const refs = product.referenceImages.filter(
          (ref) => ref.colorCode === item.variantId,
        );
        for (const ref of refs) {
          if (images.length >= 10) break;
          const part = await fetchImageAsBase64(ref.imageUrl);
          if (part) images.push({ ...part, filename: `product-${images.length}.png` });
        }
      }
      if (images.length >= 10) break;
    }

    return await useBackend().request('/api/ai-photo/openai', {
      method: 'POST',
      body: { prompt, images },
    });
  }

  async function collectImageParts(products: AiPhotoProduct[]) {
    const parts: Array<{ inlineData: { mimeType: string; data: string } }> = [];

    for (const { item, product } of products) {
      const primaryUrl = item.personalizedImageUrl || item.mockupUrl;
      if (primaryUrl) {
        const part = await fetchImagePart(primaryUrl);
        if (part) parts.push(part);
      }

      if (product?.referenceImages) {
        const refs = product.referenceImages.filter(
          (ref) => ref.colorCode === item.variantId,
        );
        for (const ref of refs) {
          if (parts.length >= 10) break;
          const part = await fetchImagePart(ref.imageUrl);
          if (part) parts.push(part);
        }
      }
    }

    return parts.slice(0, 10);
  }

  async function fetchImageAsBase64(
    url: string,
  ): Promise<{ data: string; mimeType: string } | null> {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const base64 = await blobToBase64(blob);
      return { data: base64, mimeType: blob.type || 'image/png' };
    } catch (e) {
      console.warn('Failed to fetch image:', url, e);
      return null;
    }
  }

  async function fetchImagePart(
    url: string,
  ): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const base64 = await blobToBase64(blob);
      return {
        inlineData: {
          mimeType: blob.type || 'image/png',
          data: base64,
        },
      };
    } catch (e) {
      console.warn('Failed to fetch image for AI photo:', url, e);
      return null;
    }
  }

  async function applyWatermark(
    imageBase64: string,
    mimeType: string,
  ): Promise<string> {
    const img = new Image();
    img.src = `data:${mimeType};base64,${imageBase64}`;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Load watermark logo
    const logo = new Image();
    logo.src = assetUrl('/images/swag-logo.png');
    await new Promise<void>((resolve, reject) => {
      logo.onload = () => resolve();
      logo.onerror = reject;
    });

    // Draw logo in top-right corner with transparency
    const logoHeight = Math.round(img.height * 0.08);
    const logoWidth = Math.round(logo.width * (logoHeight / logo.height));
    const padding = Math.round(img.width * 0.03);

    ctx.globalAlpha = 0.75;
    ctx.drawImage(
      logo,
      img.width - logoWidth - padding,
      padding,
      logoWidth,
      logoHeight,
    );
    ctx.globalAlpha = 1.0;

    // Export as base64
    const watermarkedDataUrl = canvas.toDataURL('image/png');
    return watermarkedDataUrl.split(',')[1];
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return {
    isGenerating,
    generatedUrl,
    error,
    isConfigured,
    selectedModel,
    availableModels,
    generatePhoto,
  };
}
