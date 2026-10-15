import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useCustomerList from '../hooks/useCustomerList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbEye, TbTrash } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Customer } from '../types'
import type { TableQueries } from '@/@types/common'
import { Switcher, Tag, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import AxiosBase from '@/services/axios/AxiosBase'
import classNames from 'classnames'
import Notification from '@/components/ui/Notification'
import { apiDelete } from '@/services/CustomersService'

const apiSetup = import.meta.env.VITE_APP_API_URL

const campaignStatus: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-200' },
    deactivated: { label: 'Deactivated', className: 'bg-red-200' },
}

const ActionColumn = ({
    onEdit,
    onDelete,
}: {
    onEdit: () => void
    onDelete: () => void
}) => {
    return (
        <div className="flex items-center gap-3">
            <Tooltip title="Edit">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
            </Tooltip>
            <Tooltip title="Delete">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onDelete}
                >
                    <TbTrash color="red" />
                </div>
            </Tooltip>
        </div>
    )
}

const CustomerListTable = () => {
    const navigate = useNavigate()
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [userToToggle, setUserToToggle] = useState<{
        userId: string
        isActive: boolean
    } | null>(null)

    const {
        customerList,
        customerListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllCustomer,
        setSelectedCustomer,
        selectedCustomer,
        mutate,
    } = useCustomerList()

    const [deleteCustomerOpen, setDeleteCustomerOpen] = useState(false)
    const [deleteCustomerId, setDeleteCustomerId] = useState(0)

    const handleEdit = (customer: Customer) => {
        navigate(`/user/user-edit/${customer.id}`)
    }

    const openDeletePopup = (customer: Customer) => {
        setDeleteCustomerOpen(true)
        setDeleteCustomerId(Number(customer.id))
    }

    const columns: ColumnDef<Customer>[] = useMemo(
        () => [
            {
                header: 'First Name',
                accessorKey: 'first_name',
            },

            {
                header: 'Last Name',
                accessorKey: 'last_name',
            },
            {
                header: 'Phone Number',
                accessorKey: 'phone_number',
            },

            {
                header: 'Role',
                accessorKey: 'role',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="font-medium heading-text">
                            {row.role}
                        </div>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'is_active',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {/* Status and toggle */}
                        {row.original.is_active ? (
                            <>
                                <Tag
                                    className={classNames(
                                        campaignStatus.active.className,
                                    )}
                                >
                                    {campaignStatus.active.label}
                                </Tag>
                            </>
                        ) : (
                            <>
                                <Tag
                                    className={classNames(
                                        campaignStatus.deactivated.className,
                                    )}
                                >
                                    {campaignStatus.deactivated.label}
                                </Tag>
                            </>
                        )}
                    </div>
                ),
            },

            {
                header: 'Action',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onDelete={() => openDeletePopup(props.row.original)}
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedCustomer.length > 0) {
            setSelectAllCustomer([])
        }
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        handleSetTableData(newTableData)

        // Fetch data for the selected page size (perPage)
        if (value === 25 || value === 50 || value === 100) {
            setTableData({ ...newTableData, pageIndex: 1, pageSize: value })
        } else {
            setTableData(newTableData)
        }
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        handleSetTableData(newTableData)
    }

    const handleRowSelect = (checked: boolean, row: Customer) => {
        setSelectedCustomer(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<Customer>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllCustomer(originalRows)
        } else {
            setSelectAllCustomer([])
        }
    }

    const handleDelete = async () => {
        try {
            const response = await apiDelete<{ message: string }>({
                url: `/users/${deleteCustomerId}/`,
            })
            toast.push(
                <Notification type="success">User Deleted!</Notification>,
                { placement: 'top-center' },
            )
            mutate()
        } catch (err) {
            console.error('Error deleting user:', err)

            toast.push(
                <Notification type="danger">
                    Failed to delete user. Please try again.
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setDeleteCustomerOpen(false)
        }
    }

    return (
        <>
            <DataTable
                // selectable
                columns={columns}
                data={customerList}
                noData={!isLoading && customerList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isLoading}
                pagingData={{
                    total: customerListTotal,
                    pageIndex: tableData.pageIndex as number,
                    pageSize: tableData.pageSize as number,
                }}
                checkboxChecked={(row) =>
                    selectedCustomer.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />

            <ConfirmDialog
                isOpen={deleteCustomerOpen}
                type="info"
                title={`Confirm Deletion`}
                onClose={() => {
                    setDeleteCustomerOpen(false)
                    setDeleteCustomerId(0)
                }}
                onRequestClose={() => {
                    setDeleteCustomerOpen(false)
                    setDeleteCustomerId(0)
                }}
                onCancel={() => {
                    setDeleteCustomerOpen(false)
                    setDeleteCustomerId(0)
                }}
                onConfirm={handleDelete}
            >
                <p>Are you sure you want to delete this Customer?</p>
            </ConfirmDialog>
        </>
    )
}

export default CustomerListTable
