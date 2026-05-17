const PROJECT_DOMAIN = 'http://localhost:3000'

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
    const response = await fetch(createUrl(option.url), {
      method: option.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: option.data ? JSON.stringify(option.data) : undefined,
    })
    return response.json()
  }

  export async function uploadFile(option: {
    url: string
    filePath: string
    name: string
  }): Promise<any> {
    const formData = new FormData()
    formData.append(option.name, {
      uri: option.filePath,
      type: 'application/octet-stream',
      name: option.filePath.split('/').pop() || 'file',
    } as any)
    const response = await fetch(createUrl(option.url), {
      method: 'POST',
      body: formData,
    })
    return response.json()
  }
}
