import useSWR from 'swr'
import { useCustomerListStore } from '../store/customerListStore'
import AxiosBase from '@/services/axios/AxiosBase'

export default function useCustomerList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedCustomer,
        setSelectedCustomer,
        setSelectAllCustomer,
        setFilterData,
    } = useCustomerListStore((state) => state)

    let params = {
        page: tableData.pageIndex,
        page_size: tableData.pageSize,
        search: tableData.query || undefined,
    }

    const fetchUrl = '/company/'

    // Fetch data using SWR
    const { data, error, isLoading, mutate } = useSWR(
        [fetchUrl, params],
        async ([url, params]: any) => {
            const response = await AxiosBase.get(url, { params })
            return response.data
        },
        {
            revalidateOnFocus: false,
        },
    )

    const customerList = data?.results?.data || []
    const customerListTotal = data?.count || 0

    if (error) {
        console.error('Error fetching data:', error)
    }

    return {
        customerList,
        customerListTotal,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        selectedCustomer,
        setSelectedCustomer,
        setSelectAllCustomer,
        setFilterData,
    }
}
