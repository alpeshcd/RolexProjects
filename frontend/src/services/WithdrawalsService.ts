import ApiService from './ApiService'
import type {
    Withdrawal,
    CreateWithdrawalPayload,
    ApproveWithdrawalPayload,
    RejectWithdrawalPayload,
} from '@/@types/withdrawal'

export async function apiGetWithdrawals(params?: Record<string, any>): Promise<Withdrawal[]> {
    return ApiService.fetchDataWithAxios<Withdrawal[]>({
        url: '/api/v1/withdrawals',
        method: 'get',
        params,
    })
}

export async function apiCreateWithdrawal(data: CreateWithdrawalPayload): Promise<Withdrawal> {
    return ApiService.fetchDataWithAxios<Withdrawal, CreateWithdrawalPayload>({
        url: '/api/v1/withdrawals',
        method: 'post',
        data,
    })
}

export async function apiApproveWithdrawal(
    withdrawalId: number,
    data: ApproveWithdrawalPayload
): Promise<Withdrawal> {
    return ApiService.fetchDataWithAxios<Withdrawal, ApproveWithdrawalPayload>({
        url: `/api/v1/withdrawals/${withdrawalId}/approve`,
        method: 'put',
        data,
    })
}

export async function apiRejectWithdrawal(
    withdrawalId: number,
    data: RejectWithdrawalPayload
): Promise<Withdrawal> {
    return ApiService.fetchDataWithAxios<Withdrawal, RejectWithdrawalPayload>({
        url: `/api/v1/withdrawals/${withdrawalId}/reject`,
        method: 'put',
        data,
    })
}

export async function apiCancelWithdrawal(withdrawalId: number): Promise<Withdrawal> {
    return ApiService.fetchDataWithAxios<Withdrawal>({
        url: `/api/v1/withdrawals/${withdrawalId}/cancel`,
        method: 'put',
    })
}
