<template>
  <a :href="mailto" class="inline-flex items-center border border-gray-200 text-primary rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:bg-gray-50" @click="openContact">Contratar a Solução</a>
  <Teleport to="body">
    <dialog ref="dialog" class="contact-dialog" aria-labelledby="app-contact-title" @click="closeOnBackdrop">
      <button type="button" class="absolute top-3 right-4 text-3xl text-gray-500" aria-label="Fechar contato" @click="dialog?.close()">×</button>
      <h2 id="app-contact-title" class="text-2xl font-bold text-primary pr-8">Contratar a Solução</h2>
      <p class="text-sm text-gray-500 mt-4 leading-relaxed">Seu aplicativo de email foi solicitado. Se ele não abriu, use o Gmail ou copie o endereço para escrever pelo serviço de sua preferência.</p>
      <a :href="mailto" class="block my-5 text-lg font-semibold text-primary underline break-all">{{ email }}</a>
      <div class="flex flex-wrap gap-3">
        <a :href="gmail" target="_blank" rel="noopener noreferrer" class="bg-primary text-white rounded-xl px-4 py-3 text-sm font-semibold">Abrir no Gmail ↗</a>
        <button type="button" class="border border-blue-200 text-primary rounded-xl px-4 py-3 text-sm font-semibold" @click="copyEmail">Copiar email</button>
      </div>
      <p role="status" aria-live="polite" class="text-sm text-gray-500 mt-4 min-h-6">{{ status }}</p>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
const email = 'developer@brorlandi.xyz'
const subject = 'Contratar a Solução — Swag Customizer'
const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}`
const gmail = `https://mail.google.com/mail/?${new URLSearchParams({ view: 'cm', fs: '1', to: email, su: subject })}`
const dialog = ref<HTMLDialogElement | null>(null)
const status = ref('')
function openContact() {
  status.value = ''
  dialog.value?.showModal()
}
function closeOnBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.value.close()
}
async function copyEmail() {
  try { await navigator.clipboard.writeText(email); status.value = 'Email copiado!' }
  catch { status.value = 'Selecione e copie o endereço de email exibido acima.' }
}
</script>

<style scoped>
.contact-dialog { position: fixed; margin: auto; width: min(540px, calc(100% - 32px)); max-height: calc(100% - 32px); overflow-y: auto; padding: 28px; border: 1px solid #cbdce9; border-radius: 20px; color: #102c48; box-shadow: 0 24px 80px #071c3433; }
.contact-dialog::backdrop { background: #071c3480; }
</style>
