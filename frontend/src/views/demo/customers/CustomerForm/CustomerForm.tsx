import { useEffect, useState } from 'react'
import { Form } from '@/components/ui/Form'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import OverviewSection from './OverviewSection'

import isEmpty from 'lodash/isEmpty'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { CustomerFormSchema } from './types'
import { useToken } from '@/store/authStore'

type CustomerFormProps = {
    onFormSubmit: (values: CustomerFormSchema) => void
    defaultValues?: CustomerFormSchema
    newCustomer?: boolean
} & CommonProps

const validationSchema: ZodType = z.object({
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    username: z.string().min(1, { message: 'User Name is required' }),
    phone_number: z.string().min(1, { message: 'Number is required' }),
    // company: z.number().optional(),

    email: z
        .string()
        .min(1, { message: 'Email is required' })
        .email({ message: 'Please provide a valid email address' }),
    role: z.string().min(1, { message: 'Role is required' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .regex(/[A-Z]/, {
            message: 'Password must contain at least one uppercase letter',
        })
        .regex(/[a-z]/, {
            message: 'Password must contain at least one lowercase letter',
        })
        .regex(/[0-9]/, {
            message: 'Password must contain at least one number',
        })
        .min(1, { message: 'Password is required' })
        .optional(),
})

const CustomerForm = (props: CustomerFormProps) => {
    const {
        onFormSubmit,
        defaultValues = {},
        newCustomer = false,
        children,
    } = props
    console.log('DHYEY')
    const { profile } = useToken()
    console.log(profile.company, 'companyid')
    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<CustomerFormSchema>({
        defaultValues: {
            ...defaultValues,
        },
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (!isEmpty(defaultValues)) {
            reset(defaultValues)
        }
    }, [JSON.stringify(defaultValues)])

    const [selectedSubRoles, setSelectedSubRoles] = useState<string[]>([])

    const onSubmit = (values: CustomerFormSchema) => {
        values.company = profile?.company

        onFormSubmit?.(values)
    }

    return (
        <Form
            className="flex w-full h-full"
            containerClassName="flex flex-col w-full justify-between"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Container>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="gap-4 flex flex-col flex-auto">
                        <OverviewSection
                            selectedSubRoles={selectedSubRoles}
                            control={control}
                            errors={errors}
                            //@ts-ignore

                            subrole={defaultValues?.sub_user}
                            //@ts-ignore
                            newCustomer={newCustomer}
                            setSelectedSubRoles={setSelectedSubRoles}
                        />
                    </div>
                </div>
            </Container>
            <BottomStickyBar>{children}</BottomStickyBar>
        </Form>
    )
}

export default CustomerForm
