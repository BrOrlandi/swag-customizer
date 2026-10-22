import { fileStore } from '../utils/file-store'
export default defineNitroPlugin(nitroApp => {
  const cleanup = () => fileStore().cleanup().catch(() => console.error('Temporary file cleanup failed'))
  void cleanup()
  const timer = setInterval(cleanup, 60 * 60 * 1000)
  timer.unref()
  nitroApp.hooks.hook('close', () => clearInterval(timer))
})
