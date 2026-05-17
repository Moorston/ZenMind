import Taro from '@tarojs/taro'

declare const PROJECT_DOMAIN: string

export namespace Network {
    const createUrl = (url: string): string => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        return `${PROJECT_DOMAIN}${url}`
    }

    export const request: typeof Taro.request = option => {
        return Taro.request({
            ...option,
            url: createUrl(option.url),
        })
    }

    export const uploadFile: typeof Taro.uploadFile = option => {
        return Taro.uploadFile({
            ...option,
            url: createUrl(option.url),
        })
    }

    export const downloadFile: typeof Taro.downloadFile = option => {
        return Taro.downloadFile({
            ...option,
            url: createUrl(option.url),
        })
    }
}
