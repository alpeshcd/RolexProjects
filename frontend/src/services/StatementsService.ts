import ApiService from './ApiService'
import type { StatementItem, SiteStatRow, ChangePasswordPayload } from '@/@types/statement'

export async function apiGetAccountStatements(params?: Record<string, any>): Promise<StatementItem[]> {
    return ApiService.fetchDataWithAxios<StatementItem[]>({
        url: '/api/v1/statements',
        method: 'get',
        params,
    })
}

export async function apiGetSiteStats(params?: Record<string, any>): Promise<SiteStatRow[]> {
    return ApiService.fetchDataWithAxios<SiteStatRow[]>({
        url: '/api/v1/statements/site-stats',
        method: 'get',
        params,
    })
}

export async function apiChangePassword(data: ChangePasswordPayload): Promise<{ message: string }> {
    return ApiService.fetchDataWithAxios<{ message: string }, ChangePasswordPayload>({
        url: '/api/v1/statements/change-password',
        method: 'post',
        data,
    })
}
