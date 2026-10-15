import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useSessionUser, useToken } from '@/store/authStore'
import {
    TOKEN_NAME_IN_STORAGE,
    REFRESH_TOKEN_NAME_IN_STORAGE,
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
} from '@/constants/api.constant'
import endpointConfig from '@/configs/endpoint.config'
import appConfig from '@/configs/app.config'

const unauthorizedCode = [401, 419, 440]

let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error)
        } else if (token) {
            promise.resolve(token)
        }
    })
    failedQueue = []
}

export const handleAxiosResponseError = async (
    error: AxiosError,
    axiosInstance: AxiosInstance,
) => {
    const { response, config } = error
    const originalRequest = config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!response || !unauthorizedCode.includes(response.status)) {
        return Promise.reject(error)
    }

    const requestUrl = originalRequest.url || ''
    const isAuthUrl =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/verify-2fa')

    // Legitimate auth failure or already retried - clear session and redirect
    if (isAuthUrl || originalRequest._retry) {
        const { clearTokens } = useToken()
        clearTokens()
        useSessionUser.getState().setUser({
            avatar: '',
            userName: '',
            email: '',
            authority: [],
        })
        useSessionUser.getState().setSessionSignedIn(false)
        return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_NAME_IN_STORAGE)

    if (!refreshToken) {
        const { clearTokens } = useToken()
        clearTokens()
        useSessionUser.getState().setUser({
            avatar: '',
            userName: '',
            email: '',
            authority: [],
        })
        useSessionUser.getState().setSessionSignedIn(false)
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-in')) {
            window.location.href = appConfig.unAuthenticatedEntryPath
        }
        return Promise.reject(error)
    }

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
        })
            .then((token) => {
                if (originalRequest.headers) {
                    originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
                }
                return axiosInstance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
        // Raw axios call to refresh endpoint
        const refreshResponse = await axios.post(
            endpointConfig.refreshToken,
            { refresh_token: refreshToken },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        )

        const newAccessToken =
            refreshResponse.data?.access_token || refreshResponse.data?.token
        const newRefreshToken =
            refreshResponse.data?.refresh_token || refreshToken

        if (!newAccessToken) {
            throw new Error('Refresh endpoint did not return an access token')
        }

        // Save new tokens
        localStorage.setItem(TOKEN_NAME_IN_STORAGE, newAccessToken)
        if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_NAME_IN_STORAGE, newRefreshToken)
        }

        const { setTokens } = useToken()
        setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken })

        if (originalRequest.headers) {
            originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${newAccessToken}`
        }

        processQueue(null, newAccessToken)

        return axiosInstance(originalRequest)
    } catch (refreshError) {
        processQueue(refreshError, null)
        const { clearTokens } = useToken()
        clearTokens()
        useSessionUser.getState().setUser({
            avatar: '',
            userName: '',
            email: '',
            authority: [],
        })
        useSessionUser.getState().setSessionSignedIn(false)

        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-in')) {
            window.location.href = appConfig.unAuthenticatedEntryPath
        }

        return Promise.reject(refreshError)
    } finally {
        isRefreshing = false
    }
}

export default handleAxiosResponseError
