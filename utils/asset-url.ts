export function assetUrl(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path
  const base = useRuntimeConfig().app.baseURL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
