import ApiService from './ApiService'
import type { Deposit, CreateDepositPayload, UTREntry, CreateUTRPayload } from '@/@types/deposit'

export async function apiGetDeposits(params?: Record<string, any>): Promise<Deposit[]> {
    return ApiService.fetchDataWithAxios<Deposit[]>({
        url: '/api/v1/deposits',
        method: 'get',
        params,
    })
}

export async function apiCreateDeposit(data: CreateDepositPayload): Promise<Deposit> {
    return ApiService.fetchDataWithAxios<Deposit, CreateDepositPayload>({
        url: '/api/v1/deposits',
        method: 'post',
        data,
    })
}

export async function apiApproveDeposit(depositId: number): Promise<Deposit> {
    return ApiService.fetchDataWithAxios<Deposit>({
        url: `/api/v1/deposits/${depositId}/approve`,
        method: 'put',
    })
}

export async function apiRejectDeposit(depositId: number): Promise<Deposit> {
    return ApiService.fetchDataWithAxios<Deposit>({
        url: `/api/v1/deposits/${depositId}/reject`,
        method: 'put',
    })
}

export async function apiGetUTRs(params?: Record<string, any>): Promise<UTREntry[]> {
    return ApiService.fetchDataWithAxios<UTREntry[]>({
        url: '/api/v1/deposits/utrs',
        method: 'get',
        params,
    })
}

export async function apiCreateUTR(data: CreateUTRPayload): Promise<UTREntry> {
    return ApiService.fetchDataWithAxios<UTREntry, CreateUTRPayload>({
        url: '/api/v1/deposits/utrs',
        method: 'post',
        data,
    })
}

export async function apiRemoveUTR(utrId: number): Promise<UTREntry> {
    return ApiService.fetchDataWithAxios<UTREntry>({
        url: `/api/v1/deposits/utrs/${utrId}`,
        method: 'delete',
    })
}
