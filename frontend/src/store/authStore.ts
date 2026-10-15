import cookiesStorage from '@/utils/cookiesStorage'
import appConfig from '@/configs/app.config'
import {
    TOKEN_NAME_IN_STORAGE,
    REFRESH_TOKEN_NAME_IN_STORAGE,
    USER_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/@types/auth'

type Session = {
    signedIn: boolean
}

type AuthState = {
    session: Session
    user: User
}

type AuthAction = {
    setSessionSignedIn: (payload: boolean) => void
    setUser: (payload: User) => void
}

const getPersistStorage = () => {
    if (appConfig.accessTokenPersistStrategy === 'localStorage') {
        return localStorage
    }

    if (appConfig.accessTokenPersistStrategy === 'sessionStorage') {
        return sessionStorage
    }

    return cookiesStorage
}

const initialState: AuthState = {
    session: {
        signedIn: false,
    },
    user: {
        avatar: '',
        userName: '',
        email: '',
        authority: [],
    },
}

export const useSessionUser = create<AuthState & AuthAction>()(
    persist(
        (set) => ({
            ...initialState,
            setSessionSignedIn: (payload) =>
                set((state) => ({
                    session: {
                        ...state.session,
                        signedIn: payload,
                    },
                })),
            setUser: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        ...payload,
                    },
                })),
        }),
        { name: 'sessionUser', storage: createJSONStorage(() => localStorage) },
    ),
)

export const useToken = () => {
    const storage = getPersistStorage()

    const getProfile = (): User | null => {
        try {
            const profileStr = storage.getItem(USER_NAME_IN_STORAGE)
            return profileStr ? JSON.parse(profileStr) : null
        } catch {
            return null
        }
    }

    const setToken = (token: string) => {
        if (token) {
            storage.setItem(TOKEN_NAME_IN_STORAGE, token)
        } else {
            storage.removeItem(TOKEN_NAME_IN_STORAGE)
        }
    }

    const setRefreshToken = (refreshToken: string) => {
        if (refreshToken) {
            storage.setItem(REFRESH_TOKEN_NAME_IN_STORAGE, refreshToken)
        } else {
            storage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)
        }
    }

    const setTokens = (tokens: { accessToken: string; refreshToken?: string }) => {
        if (tokens.accessToken) {
            storage.setItem(TOKEN_NAME_IN_STORAGE, tokens.accessToken)
        }
        if (tokens.refreshToken) {
            storage.setItem(REFRESH_TOKEN_NAME_IN_STORAGE, tokens.refreshToken)
        }
    }

    const clearTokens = () => {
        storage.removeItem(TOKEN_NAME_IN_STORAGE)
        storage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)
        storage.removeItem(USER_NAME_IN_STORAGE)
        storage.removeItem('temp_2fa_token')
    }

    return {
        token: storage.getItem(TOKEN_NAME_IN_STORAGE),
        refreshToken: storage.getItem(REFRESH_TOKEN_NAME_IN_STORAGE),
        setToken,
        setRefreshToken,
        setTokens,
        clearTokens,
        profile: getProfile(),
    }
}
