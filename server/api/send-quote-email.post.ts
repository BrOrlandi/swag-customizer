import { Resend } from 'resend'
import { z } from 'zod'
import { readJson } from '../utils/http'
const text = z.string().max(300)
export default defineEventHandler(async event => {
  const c = useRuntimeConfig(event)
  if (!c.resendApiKey || !c.emailFrom) return { success: false, disabled: true, message: 'Envio de e-mail não configurado. A proposta está salva no navegador.' }
  const body = await readJson(event, z.object({ contactEmail: z.string().email().max(254), contactName: text, companyName: text, items: z.array(z.object({ productName: text, colorName: text, sizeName: text, quantity: z.number().int().min(1).max(10000), unitPrice: z.number().min(0).max(100000) })).max(100), totalPrice: z.number().min(0).max(1e9) }), 128*1024)
  const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]!))
  const money = (n: number) => n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })
  // A local project URL cannot be opened by an email recipient: include the actual proposal.
  const html = `<h1>Swag Customizer</h1><p>by @BrOrlandi</p><p>Olá, ${escape(body.contactName)}.</p><h2>Kit — ${escape(body.companyName)}</h2><ul>${body.items.map(i => `<li>${escape(i.productName)} — ${escape(i.colorName)} / ${escape(i.sizeName)} — ${i.quantity} × ${money(i.unitPrice)}</li>`).join('')}</ul><p>Total estimado: <strong>${money(body.totalPrice)}</strong></p><p>Demonstração independente. Este e-mail não representa uma compra ou compromisso de produção.</p>`
  const { data, error } = await new Resend(String(c.resendApiKey)).emails.send({ from: String(c.emailFrom), to: body.contactEmail, subject: 'Sua proposta — Swag Customizer', html })
  if (error) throw createError({ statusCode: 502, message: 'Não foi possível enviar o e-mail. Sua proposta continua salva.' })
  return { success: true, emailId: data?.id }
})
