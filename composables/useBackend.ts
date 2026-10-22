export function useBackend() {
  const config = useRuntimeConfig()
  const keys = useApiKeys()
  function url(path: string) {
    const base = String(config.public.apiBase || '').replace(/\/$/, '')
    return base ? `${base}${path}` : path
  }
  async function request<T = any>(path: string, options: { method?: 'GET' | 'POST'; body?: any } = {}): Promise<T> {
    return await $fetch<T>(url(path), { ...options, headers: keys.headers(), timeout: 300000 }) as T
  }
  return { request, url }
}
