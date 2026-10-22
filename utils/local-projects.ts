import type { StoredQuote } from '~/types/quote'
export const PROJECTS_KEY = 'swag-customizer:projects:v1'
export function readProjects(): StoredQuote[] {
  const raw = localStorage.getItem(PROJECTS_KEY)
  if (!raw) return []
  const parsed = JSON.parse(raw)
  if (parsed.version !== 1 || !Array.isArray(parsed.projects)) throw new Error('Formato de projetos inválido. Exporte uma cópia antes de limpar os dados.')
  return parsed.projects
}
export function writeProjects(projects: StoredQuote[]) {
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify({ version: 1, projects })) }
  catch { throw new Error('Não foi possível salvar no navegador. Verifique o espaço disponível e exporte seus projetos.') }
}
export function putProject(project: StoredQuote) {
  const projects = readProjects()
  const index = projects.findIndex(p => p.id === project.id)
  if (index < 0) projects.push(project)
  else projects[index] = project
  writeProjects(projects)
}
