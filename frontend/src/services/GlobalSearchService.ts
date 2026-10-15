import ApiService from './ApiService'
import type { DomainPortal, GlobalSearchClient, CreateClientPayload } from '@/@types/globalSearch'

export async function apiGetPortals(): Promise<DomainPortal[]> {
    return ApiService.fetchDataWithAxios<DomainPortal[]>({
        url: '/api/v1/global-search/portals',
        method: 'get',
    })
}

export async function apiRefreshPortal(portalId: number): Promise<DomainPortal> {
    return ApiService.fetchDataWithAxios<DomainPortal>({
        url: `/api/v1/global-search/portals/${portalId}/refresh`,
        method: 'post',
    })
}

export async function apiSearchClients(params: { domain?: string; username?: string }): Promise<GlobalSearchClient[]> {
    return ApiService.fetchDataWithAxios<GlobalSearchClient[]>({
        url: '/api/v1/global-search',
        method: 'get',
        params,
    })
}

export async function apiCreatePortalClient(data: CreateClientPayload): Promise<GlobalSearchClient> {
    return ApiService.fetchDataWithAxios<GlobalSearchClient, CreateClientPayload>({
        url: '/api/v1/global-search/clients',
        method: 'post',
        data,
    })
}
