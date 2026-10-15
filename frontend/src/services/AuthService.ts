import ApiService from './ApiService'
import AxiosBase from './axios/AxiosBase'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
    User,
} from '@/@types/auth'

// Local mock users for fallback if backend server is not running
const LOCAL_USERS: Record<string, {
    password: string
    user: User
    requires_2fa: boolean
}> = {
    mastan99m: {
        password: 'admin123',
        requires_2fa: true,
        user: {
            id: 1,
            username: 'MASTAN99M',
            userName: 'MASTAN99M',
            full_name: 'Mastan Admin',
            email: 'admin@rolexpanel.win',
            role: 'supermaster',
            authority: ['admin'],
            balance: 143418.0,
            upline_share: 25589.0,
            upline: 'MASTAN365',
            is_2fa_enabled: true,
        },
    },
    admin: {
        password: 'admin123',
        requires_2fa: false,
        user: {
            id: 2,
            username: 'admin',
            userName: 'admin',
            full_name: 'System Administrator',
            email: 'admin@ecme.com',
            role: 'admin',
            authority: ['admin'],
            balance: 500000.0,
            upline_share: 50000.0,
            upline: 'DIRECT',
            is_2fa_enabled: false,
        },
    },
    demo: {
        password: 'password123',
        requires_2fa: false,
        user: {
            id: 3,
            username: 'demo',
            userName: 'demo',
            full_name: 'Demo Operator',
            email: 'demo@rolexpanel.win',
            role: 'operator',
            authority: ['user'],
            balance: 25000.0,
            upline_share: 1000.0,
            upline: 'MASTAN99M',
            is_2fa_enabled: false,
        },
    },
}

export async function apiSignIn(data: SignInCredential): Promise<SignInResponse> {
    const username = (data.username || data.userName || data.email || '').trim()
    const password = data.password

    try {
        const response = await AxiosBase.post<SignInResponse>(endpointConfig.signIn, {
            username,
            password,
        })
        return response.data
    } catch (error: any) {
        // If backend returned a specific HTTP error (e.g. 401 Invalid Credentials), throw it
        if (error?.response?.data) {
            throw error
        }

        // Backend unreachable - fallback to local simulation
        const key = username.toLowerCase()
        const localMock = LOCAL_USERS[key]
        if (localMock && localMock.password === password) {
            if (localMock.requires_2fa) {
                return {
                    requires_2fa: true,
                    temp_token: `local_temp_token_${key}`,
                    message: 'Please verify your 2FA OTP to complete login.',
                }
            }
            return {
                requires_2fa: false,
                access_token: `local_access_token_${key}_${Date.now()}`,
                refresh_token: `local_refresh_token_${key}_${Date.now()}`,
                token_type: 'bearer',
                user: localMock.user,
                message: 'Local login successful (Offline mode)',
            }
        }

        throw error
    }
}

export async function apiVerify2FA(data: { temp_token: string; otp_code: string }): Promise<SignInResponse> {
    try {
        const response = await AxiosBase.post<SignInResponse>(endpointConfig.verify2fa, data)
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            throw error
        }

        // Fallback for local offline mode (test OTP 123456 or length 6)
        if (data.otp_code === '123456' || data.otp_code.trim().length === 6) {
            return {
                requires_2fa: false,
                access_token: `local_access_token_mastan99m_${Date.now()}`,
                refresh_token: `local_refresh_token_mastan99m_${Date.now()}`,
                token_type: 'bearer',
                user: LOCAL_USERS['mastan99m'].user,
                message: '2FA verification successful (Offline mode)',
            }
        }

        throw error
    }
}

export async function apiRefreshToken(refreshToken: string): Promise<SignInResponse> {
    const response = await AxiosBase.post<SignInResponse>(endpointConfig.refreshToken, {
        refresh_token: refreshToken,
    })
    return response.data
}

export async function apiGetMe<T = User>(): Promise<T> {
    const response = await AxiosBase.get<T>(endpointConfig.me)
    return response.data
}

export async function apiSignOut(): Promise<{ message: string }> {
    try {
        const response = await AxiosBase.post<{ message: string }>(endpointConfig.signOut)
        return response.data
    } catch {
        return { message: 'Logged out' }
    }
}

export async function apiSignUp(data: SignUpCredential): Promise<SignUpResponse> {
    return ApiService.fetchDataWithAxios<SignUpResponse>({
        url: endpointConfig.signUp,
        method: 'post',
        data,
    })
}

export async function apiForgotPassword<T>(data: ForgotPassword): Promise<T> {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: ResetPassword): Promise<T> {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

export async function apiGetSettingsProfile<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/users/profile/',
        method: 'get',
    })
}

export async function apiGetSettingsNotification<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/setting/notification',
        method: 'get',
    })
}

export async function apiGetSettingsBilling<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/setting/billing',
        method: 'get',
    })
}

export async function apiGetSettingsIntergration<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/setting/intergration',
        method: 'get',
    })
}

export async function apiGetRolesPermissionsUsers<
    T,
    U extends Record<string, unknown>,
>(params: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/rbac/users',
        method: 'get',
        params,
    })
}

export async function apiGetRolesPermissionsRoles<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/rbac/roles',
        method: 'get',
    })
}

export async function apiGetPricingPlans<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/pricing',
        method: 'get',
    })
}
