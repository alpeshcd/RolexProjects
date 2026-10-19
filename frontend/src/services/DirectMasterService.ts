import ApiService from './ApiService'
import type {
    DirectMaster,
    CreateDirectMasterPayload,
    Party,
    CreatePartyPayload,
} from '@/@types/directMaster'

export async function apiGetDirectMasters(
    params?: Record<string, any>
): Promise<DirectMaster[]> {
    return ApiService.fetchDataWithAxios<DirectMaster[]>({
        url: '/api/v1/direct-masters',
        method: 'get',
        params,
    })
}

export async function apiCreateDirectMaster(
    data: CreateDirectMasterPayload
): Promise<DirectMaster> {
    return ApiService.fetchDataWithAxios<DirectMaster, CreateDirectMasterPayload>({
        url: '/api/v1/direct-masters',
        method: 'post',
        data,
    })
}

export async function apiUpdateDirectMaster(
    masterId: number,
    data: Partial<CreateDirectMasterPayload>
): Promise<DirectMaster> {
    return ApiService.fetchDataWithAxios<DirectMaster, Partial<CreateDirectMasterPayload>>({
        url: `/api/v1/direct-masters/${masterId}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteDirectMaster(
    masterId: number
): Promise<{ message: string }> {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `/api/v1/direct-masters/${masterId}`,
        method: 'delete',
    })
}

export async function apiGetParties(type?: string): Promise<Party[]> {
    return ApiService.fetchDataWithAxios<Party[]>({
        url: '/api/v1/direct-masters/parties',
        method: 'get',
        params: type ? { type } : undefined,
    })
}

export async function apiCreateParty(data: CreatePartyPayload): Promise<Party> {
    return ApiService.fetchDataWithAxios<Party, CreatePartyPayload>({
        url: '/api/v1/direct-masters/parties',
        method: 'post',
        data,
    })
}
