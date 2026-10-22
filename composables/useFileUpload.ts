export function useFileUpload() {
  async function upload(source: Blob | string): Promise<string> {
    const blob = typeof source === 'string' ? await fetch(source).then(r => r.blob()) : source
    if (blob.size > 10 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 10 MB.')
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1]!)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const result = await useBackend().request<{ url: string }>('/api/files', { method: 'POST', body: { data } })
    return result.url
  }
  return { upload }
}
