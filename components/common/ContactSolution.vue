<template>
  <button type="button" class="inline-flex items-center border border-gray-200 text-primary rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:bg-gray-50" @click="dialog?.showModal()">Contratar a Solução</button>
  <Teleport to="body">
    <dialog ref="dialog" class="contact-dialog" aria-label="Contratar a Solução" @click="closeOnBackdrop">
      <button type="button" class="absolute top-3 right-4 text-3xl text-gray-500" aria-label="Fechar contato" @click="dialog?.close()">×</button>
      <a :href="mailto" class="block my-5 text-center text-lg font-semibold text-primary underline break-all">{{ email }}</a>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
const email = 'developer@brorlandi.xyz'
const subject = 'Contratar a Solução — Swag Customizer'
const body = 'Olá, Bruno!\r\n\r\nTenho interesse em contratar a solução Swag Customizer para minha empresa.\r\n\r\nNome:\r\nEmpresa:\r\nO que precisamos personalizar:\r\nQuantidade estimada:\r\nPrazo desejado:\r\n\r\nPodemos conversar sobre personalização, implantação e valores?\r\n\r\nObrigado!'
const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
const dialog = ref<HTMLDialogElement | null>(null)
function closeOnBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.value.close()
}
</script>

<style scoped>
.contact-dialog { position: fixed; margin: auto; width: min(540px, calc(100% - 32px)); max-height: calc(100% - 32px); overflow-y: auto; padding: 28px; border: 1px solid #cbdce9; border-radius: 20px; color: #102c48; box-shadow: 0 24px 80px #071c3433; }
.contact-dialog::backdrop { background: #071c3480; }
</style>
