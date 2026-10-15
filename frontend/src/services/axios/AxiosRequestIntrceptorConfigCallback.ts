import appConfig from '@/configs/app.config'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import cookiesStorage from '@/utils/cookiesStorage'
import type { InternalAxiosRequestConfig } from 'axios'

const AxiosRequestIntrceptorConfigCallback = (
    config: InternalAxiosRequestConfig,
) => {
    if (config.url?.startsWith('/api')) {
        config.baseURL = ''
    } else if (config.url?.startsWith('api/')) {
        config.url = '/' + config.url
        config.baseURL = ''
    }

    const storage = appConfig.accessTokenPersistStrategy
    let accessToken = ''

    if (storage === 'localStorage') {
        accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else if (storage === 'sessionStorage') {
        accessToken = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else {
        accessToken = (cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE) as string) || ''
    }

    if (!accessToken && typeof window !== 'undefined') {
        accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }

    if (accessToken) {
        config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`
    }

    return config
}

export default AxiosRequestIntrceptorConfigCallback
