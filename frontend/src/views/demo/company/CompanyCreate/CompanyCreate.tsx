import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbTrash } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import AxiosBase from '@/services/axios/AxiosBase'
import { useForm } from 'react-hook-form'
import CompanyForm, { CustomerFormSchema } from '../CompanyForm'

const CompanyCreate = () => {
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

    const handleFormSubmit = async (values: CustomerFormSchema) => {
        setIsSubmiting(true)

        try {
            const payload = {
                ...values,
                //@ts-ignore
            }

            console.log(payload, 'final payload')

            const response = await AxiosBase.post('/company/', payload)

            toast.push(
                <Notification type="success">Company created!</Notification>,
                { placement: 'top-center' },
            )
            navigate('/company/list')
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.push(
                <Notification type="danger">
                    company email  already exist.
                </Notification>,
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
            <Notification type="success">
                Customer discard!
            </Notification>,
            {
                placement: 'top-center',
            },
        )
        navigate('/company/list')
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    return (
        <>
            <CompanyForm
                newCustomer
                //@ts-ignore
                defaultValues={{
                    company_name: '',
                    address: '',
                    city: '',
                    website: '',
                    email: '',
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
            </CompanyForm>
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

export default CompanyCreate
