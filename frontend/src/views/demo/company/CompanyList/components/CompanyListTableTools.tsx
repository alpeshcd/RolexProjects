import useCustomerList from '../hooks/useCustomerList'

import cloneDeep from 'lodash/cloneDeep'
import CompanyListSearch from './CompanyListSearch'

const CompanyListTableTools = () => {
    const { tableData, setTableData } = useCustomerList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        if (typeof val === 'string' && val.length > 1) {
            setTableData(newTableData)
        }

        if (typeof val === 'string' && val.length === 0) {
            setTableData(newTableData)
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CompanyListSearch onInputChange={handleInputChange} setUsers={function (users: any[]): void {
                throw new Error('Function not implemented.')
            } } setNextPage={function (nextPage: string | null): void {
                throw new Error('Function not implemented.')
            } } setPrevPage={function (prevPage: string | null): void {
                throw new Error('Function not implemented.')
            } } setLoading={function (loading: boolean): void {
                throw new Error('Function not implemented.')
            } } />
            {/* <CustomerTableFilter /> */}
        </div>
    )
}

export default CompanyListTableTools
