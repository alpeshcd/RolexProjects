import { useRolePermissionsStore } from '../store/rolePermissionsStore'
import useSWR from 'swr'
import type { GetRolesPermissionsUsersResponse } from '../types'
import type { TableQueries } from '@/@types/common'
import { apiGetRolesPermissionsUsers } from '@/services/AuthService'

export default function useRolePermissonsUsers() {
    const { tableData, filterData } = useRolePermissionsStore()

    const { data, isLoading, error, mutate } = useSWR(
        ['/api/rbac/user', { ...tableData, ...filterData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetRolesPermissionsUsers<
                GetRolesPermissionsUsersResponse,
                TableQueries
            >(params),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    const userList = data?.list || []

    const userListTotal = data?.total || 0

    return {
        userList,
        userListTotal,
        error,
        isLoading,
        mutate,
    }
}
