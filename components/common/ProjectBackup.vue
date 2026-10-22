<template>
  <div class="flex flex-wrap gap-3 items-center text-sm">
    <button class="border rounded-lg px-3 py-2 text-primary" @click="exportProjects">Exportar projetos</button>
    <label class="border rounded-lg px-3 py-2 text-primary cursor-pointer">Importar projetos<input type="file" accept="application/json" class="hidden" @change="importProjects" /></label>
    <span v-if="message" role="status" class="text-gray-500">{{ message }}</span>
  </div>
</template>
<script setup lang="ts">
import { readProjects, putProject } from '~/utils/local-projects'
import { quoteSchema } from '~/utils/quote-schema'
const message = ref('')
function exportProjects() {
  try {
    const blob = new Blob([JSON.stringify({ version: 1, projects: readProjects() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'swag-customizer-projects.json'; link.click(); URL.revokeObjectURL(url)
    message.value = 'Backup exportado. As URLs das imagens expiram seis meses após a criação.'
  } catch(e: any) { message.value = e.message }
}
async function importProjects(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]
  if (!file) return
  try {
    if (file.size > 4*1024*1024) throw new Error('Arquivo maior que 4 MB.')
    const data = JSON.parse(await file.text())
    if (data.version !== 1 || !Array.isArray(data.projects) || data.projects.length > 1000) throw new Error('Backup inválido.')
    const projects = data.projects.map((p: unknown) => quoteSchema.parse(p))
    for (const project of projects) putProject(project)
    await useQuotes().fetchQuotes(); message.value = 'Projetos importados.'
  } catch { message.value = 'Não foi possível importar. Confira o arquivo e o espaço do navegador.' }
  input.value = ''
}
</script>
