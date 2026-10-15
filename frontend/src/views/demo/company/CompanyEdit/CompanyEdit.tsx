import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import NoUserFound from '@/assets/svg/NoUserFound'
import { TbTrash, TbArrowNarrowLeft } from 'react-icons/tb'
import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import AxiosBase from '@/services/axios/AxiosBase'
import CompanyForm, { CustomerFormSchema } from '../CompanyForm'

const apiSetup = import.meta.env.VITE_APP_API_URL

const CompanyEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useSWR(
        [`/api/company/${id}`, { id }],
        async ([_, { id }]) => {
            const response = await AxiosBase.get(`/company/${id}/`)
            console.log(response.data, 'data')
            return response.data.data
        },
    )

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [isSubmiting, setIsSubmiting] = useState(false)

    const handleFormSubmit = async (values: any) => {
        setIsSubmiting(true)

        const payload: any = { ...values }

        try {
            const response = await AxiosBase.patch(`/company/${id}/`, payload)

            // Handle successful response
            if (response.status === 200) {
                toast.push(
                    <Notification type="success">Changes Saved!</Notification>,
                    {
                        placement: 'top-center',
                    },
                )
                navigate('/company/list')
            } else {
                toast.push(
                    <Notification>Failed to save changes.</Notification>,
                    {
                        placement: 'top-center',
                    },
                )
            }
        } catch (error) {
            toast.push(<Notification>An error occurred.</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsSubmiting(false)
        }
    }

    const getDefaultValues = () => {
        if (data) {
            const {
                company_name,
                email,
                website,
                city,
                address,
                phone_number,
            } = data
            return {
                company_name,
                email,
                website,
                city,
                address,
                phone_number,
            }
        }

        return {}
    }

    const handleConfirmDelete = async () => {
        try {
            const response = await AxiosBase.delete(
                `${apiSetup}api/company/${id}/`,
            )
                .then((res) => {
                    toast.push(
                        <Notification type="success">
                            Customer deleted!
                        </Notification>,
                        {
                            placement: 'top-center',
                        },
                    )
                    setDeleteConfirmationOpen(false)
                    navigate('/company')
                })
                .catch((err) => {
                    toast.push(
                        <Notification type="danger">
                            Failed to delete customer. Please try again.
                        </Notification>,
                        { placement: 'top-center' },
                    )
                })
        } catch (error) {
            console.error('Error deleting:', error)
        } finally {
            setDeleteConfirmationOpen(false)
        }
    }

    const handleDelete = () => {
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleBack = () => {
        history.back()
    }

    return (
        <>
            {!isLoading && !data && (
                <div className="h-full flex flex-col items-center justify-center">
                    <NoUserFound height={280} width={280} />
                    <h3 className="mt-8">No user found!</h3>
                </div>
            )}
            {!isLoading && data && (
                <>
                    <CompanyForm
                        defaultValues={
                            getDefaultValues() as unknown as CustomerFormSchema
                        }
                        newCustomer={false}
                        onFormSubmit={handleFormSubmit}
                    >
                        <Container>
                            <div className="flex items-center justify-between px-8">
                                <Button
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    variant="plain"
                                    icon={<TbArrowNarrowLeft />}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                                <div className="flex items-center">
                                    <Button
                                        className="ltr:mr-3 rtl:ml-3"
                                        type="button"
                                        customColorClass={() =>
                                            'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                        }
                                        icon={<TbTrash />}
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmiting}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </CompanyForm>
                    <ConfirmDialog
                        isOpen={deleteConfirmationOpen}
                        type="danger"
                        title="Remove customers"
                        onClose={handleCancel}
                        onRequestClose={handleCancel}
                        onCancel={handleCancel}
                        onConfirm={handleConfirmDelete}
                    >
                        <p>
                            Are you sure you want to remove this customer? This
                            action can&apos;t be undo.{' '}
                        </p>
                    </ConfirmDialog>
                </>
            )}
        </>
    )
}

export default CompanyEdit
