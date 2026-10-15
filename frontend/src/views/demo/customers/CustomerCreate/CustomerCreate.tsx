import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import CustomerForm from '../CustomerForm'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbTrash } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import type { CustomerFormSchema } from '../CustomerForm'
import AxiosBase from '@/services/axios/AxiosBase'
import { useForm } from 'react-hook-form'
import { useToken } from '@/store/authStore'

const CustomerCreate = () => {
    const navigate = useNavigate()

    const [discardConfirmationOpen, setDiscardConfirmationOpen] =
        useState(false)
    const [isSubmiting, setIsSubmiting] = useState(false)
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm()
    const { profile } = useToken()
    const rolestore = profile?.role

    console.log(rolestore, 'rolestore')
    const handleFormSubmit = async (values: CustomerFormSchema) => {
        setIsSubmiting(true)
        console.log('dhyey', values)

        try {
            const response = await AxiosBase.post('/users/', values)

            toast.push(
                <Notification type="success">Customer created!</Notification>,
                { placement: 'top-center' },
            )
            navigate('/user/list')
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.push(
                <Notification type="danger">UserName Already Exit!.</Notification>,
                {
                    placement: 'top-center',
                },
            )
        } finally {
            setIsSubmiting(false)
        }
    }

    const handleConfirmDiscard = () => {
        setDiscardConfirmationOpen(true)
        toast.push(
            <Notification type="success">Customer discardd!</Notification>,
            {
                placement: 'top-center',
            },
        )
        navigate('/user/list')
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    return (
        <>
            <CustomerForm
                newCustomer
                //@ts-ignore
                defaultValues={{
                    first_name: '',
                    last_name: '',
                    email: '',
                    role: '',
                    password: '',
                    phone_number: '',
                }}
                onFormSubmit={handleFormSubmit}
            >
                <Container>
                    <div className="flex items-center justify-between px-8">
                        <span></span>
                        <div className="flex items-center">
                            <Button
                                className="ltr:mr-3 rtl:ml-3"
                                type="button"
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                }
                                icon={<TbTrash />}
                                onClick={handleDiscard}
                            >
                                Discard
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isSubmiting}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </Container>
            </CustomerForm>
            <ConfirmDialog
                isOpen={discardConfirmationOpen}
                type="danger"
                title="Discard changes"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDiscard}
            >
                <p>
                    Are you sure you want discard this? This action can&apos;t
                    be undo.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default CustomerCreate
