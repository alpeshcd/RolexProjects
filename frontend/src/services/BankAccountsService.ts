import ApiService from './ApiService'
import type { BankAccount, CreateAccountPayload } from '@/@types/account'

export async function apiGetAccounts(params?: Record<string, any>): Promise<BankAccount[]> {
    return ApiService.fetchDataWithAxios<BankAccount[]>({
        url: '/api/v1/accounts',
        method: 'get',
        params,
    })
}

export async function apiUploadQrImage(file: File): Promise<{ url: string }> {
    const data = new FormData()
    data.append('file', file)
    return ApiService.fetchDataWithAxios<{ url: string }, FormData>({
        url: '/api/v1/accounts/qr-upload',
        method: 'post',
        data,
    })
}

export async function apiGetAccountUsers(): Promise<string[]> {
    return ApiService.fetchDataWithAxios<string[]>({
        url: '/api/v1/accounts/users',
        method: 'get',
    })
}

export async function apiGetActiveAccounts(): Promise<BankAccount[]> {
    return ApiService.fetchDataWithAxios<BankAccount[]>({
        url: '/api/v1/accounts/active',
        method: 'get',
    })
}

export async function apiCreateAccount(data: CreateAccountPayload): Promise<BankAccount> {
    return ApiService.fetchDataWithAxios<BankAccount, CreateAccountPayload>({
        url: '/api/v1/accounts',
        method: 'post',
        data,
    })
}

export async function apiUpdateAccount(
    accountId: number,
    data: Partial<BankAccount>
): Promise<BankAccount> {
    return ApiService.fetchDataWithAxios<BankAccount, Partial<BankAccount>>({
        url: `/api/v1/accounts/${accountId}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteAccount(accountId: number): Promise<{ message: string }> {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `/api/v1/accounts/${accountId}`,
        method: 'delete',
    })
}
