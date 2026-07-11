import Taro from '@tarojs/taro'

declare const PROJECT_DOMAIN: string

export namespace Network {
    const createUrl = (url: string): string => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        return `${PROJECT_DOMAIN}${url}`
    }

    /** 从 auth-storage 获取 token */
    const getToken = (): string | null => {
        try {
            const raw = Taro.getStorageSync('auth-storage')
            if (raw) {
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
              return parsed?.state?.token || null
            }
          } catch {}
        return null
    }

    /** 处理 401 响应：自动登出 */
    const handleUnauthorized = () => {
        Taro.removeStorageSync('auth-storage')
        Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
        setTimeout(() => {
            Taro.navigateTo({ url: '/pages/auth/index' })
        }, 1500)
    }

    export const request: typeof Taro.request = (option) => {
        const token = getToken()
        const headers: Record<string, string> = {
            ...(option.header as Record<string, string> || {}),
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return Taro.request({
            ...option,
            url: createUrl(option.url),
            header: headers,
        }).then((res) => {
            // 检查 401 响应
            if (res.statusCode === 401) {
                handleUnauthorized()
            }
            return res
        })
    }

    export const uploadFile: typeof Taro.uploadFile = (option) => {
        const token = getToken()
        const header: Record<string, string> = {}
        if (token) {
            header['Authorization'] = `Bearer ${token}`
        }
        return Taro.uploadFile({
            ...option,
            url: createUrl(option.url),
            header,
        })
    }

    export const downloadFile: typeof Taro.downloadFile = (option) => {
        const token = getToken()
        const header: Record<string, string> = {}
        if (token) {
            header['Authorization'] = `Bearer ${token}`
        }
        return Taro.downloadFile({
            ...option,
            url: createUrl(option.url),
            header,
        })
    }
}
