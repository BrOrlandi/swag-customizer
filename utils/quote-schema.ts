import { z } from 'zod'
const text = z.string().max(500)
const imageUrl = z.string().max(2000).refine(s => s.startsWith('https://') || s.startsWith('http://localhost') || /^\/images\/products\/[a-f0-9]+\.(webp|png|jpg)$/.test(s)).nullable()
export const quoteItemSchema = z.object({
  id: text, quote_id: z.string().uuid(), product_id: text, product_name: text, variant_id: text, variant_color_name: text, size_id: text, size_name: text,
  quantity: z.number().int().min(1).max(10000), unit_price: z.number().min(0).max(100000), subtotal: z.number().min(0).max(1e9),
  personalized_image_url: imageUrl, logo_position: z.object({ left: z.number(), top: z.number(), scaleX: z.number(), scaleY: z.number(), angle: z.number() }).nullable(), logo_color_mode: text.nullable(), created_at: text,
})
export const quoteSchema = z.object({
  id: z.string().uuid(), contact_name: text, company_name: text, contact_email: text, status: z.enum(['draft','ready']),
  total_price: z.number().min(0).max(1e9), total_items: z.number().min(0).max(1e6), logo_url: imageUrl, logo_processed_url: imageUrl, ai_photo_url: imageUrl,
  created_at: text, updated_at: text, last_step: z.number().int().min(0).max(7).optional(), source: z.enum(['wizard','ai-chat']).optional(), deleted_at: text.nullable().optional(), quote_items: z.array(quoteItemSchema).max(100),
})
