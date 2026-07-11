const PROJECT_DOMAIN = 'http://localhost:3000'

import { useAuthStore } from '@/store/useAuthStore'

export namespace Network {
  const createUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `${PROJECT_DOMAIN}${url}`
  }

  export async function request<T = any>(option: {
    url: string
    method?: string
    data?: any
  }): Promise<T> {
    const token = useAuthStore.getState().token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(createUrl(option.url), {
      method: option.method || 'GET',
      headers,
      body: option.data ? JSON.stringify(option.data) : undefined,
    })
    if (!response.ok) {
      const text = await response.text()
      let message = `Request failed: ${response.status}`
      try {
        const json = JSON.parse(text)
        if (json.message) message = json.message
      } catch {}
      throw new Error(message)
    }
    return response.json()
  }

  export async function uploadFile(option: {
    url: string
    filePath: string
    name: string
  }): Promise<any> {
    const token = useAuthStore.getState().token
    const formData = new FormData()
    formData.append(option.name, {
      uri: option.filePath,
      type: 'application/octet-stream',
      name: option.filePath.split('/').pop() || 'file',
    } as any)
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(createUrl(option.url), {
      method: 'POST',
      headers,
      body: formData,
    })
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
    return response.json()
  }
}
