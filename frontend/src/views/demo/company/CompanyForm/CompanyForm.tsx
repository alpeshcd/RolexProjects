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
import { Notification, toast } from '@/components/ui'

type CustomerFormProps = {
    onFormSubmit: (values: CustomerFormSchema) => void
    defaultValues?: CustomerFormSchema
    newCustomer?: boolean
} & CommonProps

const validationSchema: ZodType = z.object({
    company_name: z.string().min(1, { message: 'Company Name is required' }),
    city: z.string().min(1, { message: 'City  is required' }),
    address: z.string().min(1, { message: 'Address is required' }),
    phone_number: z.string().min(1, { message: 'Number is required' }),
    email: z
        .string()
        .min(1, { message: 'Email is required' })
        .email({ message: 'Please provide a valid email address' }),
    website: z
        .string()
        .min(1, { message: 'Website is required' })
        .url({ message: 'Please provide a valid website URL' }),
})

const CompanyForm = (props: CustomerFormProps) => {
    const {
        onFormSubmit,
        defaultValues = {},
        newCustomer = false,
        children,
    } = props
    const schema = validationSchema

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<CustomerFormSchema>({
        defaultValues: {
            ...defaultValues,
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        if (!isEmpty(defaultValues)) {
            reset(defaultValues)
        }
    }, [JSON.stringify(defaultValues)])

    const [selectedSubRoles, setSelectedSubRoles] = useState<string[]>([])

    const onSubmit = (values: CustomerFormSchema) => {
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
                            subUser={defaultValues?.role} // Pass sub_user from defaultValues
                            newCustomer={newCustomer}
                            setSelectedSubRoles={setSelectedSubRoles} // Pass it down as a prop
                        />
                    </div>
                    {/* <div className="md:w-[370px] gap-4 flex flex-col">
                        <ProfileImageSection
                            control={control}
                            errors={errors}
                        />
                    </div> */}
                </div>
            </Container>
            <BottomStickyBar>{children}</BottomStickyBar>
        </Form>
    )
}

export default CompanyForm
