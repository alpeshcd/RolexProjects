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

export async function apiSignIn(data: SignInCredential): Promise<SignInResponse> {
    const username = (data.username || data.userName || data.email || '').trim()
    const password = data.password

    const response = await AxiosBase.post<SignInResponse>(endpointConfig.signIn, {
        username,
        password,
    })
    return response.data
}

export async function apiVerify2FA(data: { temp_token: string; otp_code: string }): Promise<SignInResponse> {
    const response = await AxiosBase.post<SignInResponse>(endpointConfig.verify2fa, data)
    return response.data
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

export async function apiGetUsers(params?: Record<string, any>): Promise<User[]> {
    const response = await AxiosBase.get<User[]>('/api/v1/users', { params })
    return response.data
}

export async function apiCreateClientFromForm(data: {
    master: string
    referral_code?: string
    username: string
    password: string
    mobile?: string
}): Promise<User> {
    const response = await AxiosBase.post<User>('/api/v1/users/client', data)
    return response.data
}

export async function apiCreateUser(data: {
    username: string
    password: string
    full_name?: string
    email?: string
    role?: string
    balance?: number
    upline_share?: number
    upline?: string
    is_2fa_enabled?: boolean
}): Promise<User> {
    const response = await AxiosBase.post<User>('/api/v1/users', data)
    return response.data
}

export async function apiUpdateUserBalance(
    userId: number | string,
    data: { amount: number; operation: 'deposit' | 'withdraw' }
): Promise<User> {
    const response = await AxiosBase.put<User>(`/api/v1/users/${userId}/balance`, data)
    return response.data
}

export async function apiGetStatsSummary(): Promise<{
    total_clients: number
    total_balance: number
    total_upline_share: number
    active_clients: number
}> {
    const response = await AxiosBase.get('/api/v1/users/stats/summary')
    return response.data
}

export interface DashboardStatsData {
    new_clients: number
    total_ftd: number
    total_ftd_count: number
    total_deposits: number
    total_deposits_count: number
    approved_deposits: number
    approved_deposits_count: number
    rejected_deposits: number
    rejected_deposits_count: number
    total_withdrawals: number
    total_withdrawals_count: number
    pending_withdrawals: number
    pending_withdrawals_count: number
    approved_withdrawals: number
    approved_withdrawals_count: number
    rejected_withdrawals: number
    rejected_withdrawals_count: number
}

export async function apiGetDashboardStats(): Promise<DashboardStatsData> {
    const response = await AxiosBase.get<DashboardStatsData>('/api/v1/dashboard/stats')
    return response.data
}
