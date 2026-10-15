import { useMemo, useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Input from '@/components/ui/Input'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import type { ControlProps, OptionProps } from 'react-select'
import sleep from '@/utils/sleep'
import useSWR from 'swr'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { HiOutlineUser } from 'react-icons/hi'
import { TbPlus } from 'react-icons/tb'
import type { ZodType } from 'zod'
import type { GetSettingsProfileResponse } from '../types'
import { apiGetSettingsProfile } from '@/services/AuthService'
import AxiosBase from '@/services/axios/AxiosBase'
import { Notification, toast } from '@/components/ui'
import isEqual from 'lodash/isEqual'

type ProfileSchema = {
    first_name: string
    username: string
    last_name: string
    email: string
    phone_number: string
}

const { Control } = components

const validationSchema: ZodType<ProfileSchema> = z.object({
    first_name: z.string().min(1, { message: 'First name required' }),
    username: z.string().min(1, { message: 'User name required' }),

    last_name: z.string().min(1, { message: 'User name required' }),

    email: z
        .string()
        .min(1, { message: 'Email required' })
        .email({ message: 'Invalid email' }),
    phone_number: z
        .string()
        .min(1, { message: 'Please input your mobile number' }),
})

const SettingsProfile = () => {

    const [originalValues, setOriginalValues] = useState<ProfileSchema | null>(null);
    // Track if form has changes
    const [hasChanges, setHasChanges] = useState(false);
    const { data, mutate } = useSWR(
        '/api/users/profile/',
        () => apiGetSettingsProfile<GetSettingsProfileResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    const beforeUpload = (files: FileList | null) => {
        let valid: string | boolean = true

        const allowedFileType = ['image/jpeg', 'image/png']
        if (files) {
            for (const file of files) {
                if (!allowedFileType.includes(file.type)) {
                    valid = 'Please upload a .jpeg or .png file!'
                }
            }
        }

        return valid
    }

    const {
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
        control,
    } = useForm<ProfileSchema>({
        resolver: zodResolver(validationSchema),
    })

    const formValues = watch();

    // Check for changes whenever form values update
    useEffect(() => {
        if (originalValues && formValues) {
            const formHasChanges = !isEqual(originalValues, formValues);
            setHasChanges(formHasChanges);
        }
    }, [formValues, originalValues]);

    useEffect(() => {
        if (data) {
            //@ts-ignore
            reset(data?.data)
            setOriginalValues(data.data);
            // Initially no changes
            setHasChanges(false);
        }
    }, [data])

    const onSubmit = async (values: ProfileSchema) => {
        try {
            const response = await AxiosBase.patch(
                '/users/update-profile/',
                values,
            )
            if (data) {
                //@ts-ignore
                mutate({ ...data, data: { ...data.data, ...values } }, false)
            }
             // Update original values to match current values
             setOriginalValues(values);
             // Reset hasChanges since we've saved
             setHasChanges(false);
            toast.push(
                <Notification type="success">
                    Profile updated successfully!
                </Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            console.error('Error updating profile:', error)

            // Show error notification
            toast.push(
                <Notification type="danger">
                    Failed to update profile. Please try again.
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    return (
        <>
            <h4 className="mb-8">Personal information</h4>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                    <Controller
                        //@ts-ignore
                        name="img"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-4">
                                <Avatar
                                    size={90}
                                    className="border-4 border-white bg-gray-100 text-gray-300 shadow-lg"
                                    icon={<HiOutlineUser />}
                                    src={field.value}
                                />
                                <div className="flex items-center gap-2">
                                    <Upload
                                        showList={false}
                                        uploadLimit={1}
                                        beforeUpload={beforeUpload}
                                        onChange={(files) => {
                                            if (files.length > 0) {
                                                field.onChange(
                                                    URL.createObjectURL(
                                                        files[0],
                                                    ),
                                                )
                                            }
                                        }}
                                    >
                                        <Button
                                            variant="solid"
                                            size="sm"
                                            type="button"
                                            icon={<TbPlus />}
                                        >
                                            Upload Image
                                        </Button>
                                    </Upload>
                                    <Button
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                            field.onChange('')
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                        label="First name"
                        invalid={Boolean(errors.first_name)}
                        errorMessage={errors.first_name?.message}
                    >
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="First Name"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Last name"
                        invalid={Boolean(errors.last_name)}
                        errorMessage={errors.last_name?.message}
                    >
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Last Name"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <FormItem
                    label="User name"
                    invalid={Boolean(errors.username)}
                    errorMessage={errors.username?.message}
                >
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="UserName"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                autoComplete="off"
                                placeholder="Email"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex items-end gap-4 w-full mb-6">
                    <FormItem
                        label="Phone Number"
                        className="w-full"
                        invalid={Boolean(errors.phone_number)}
                        errorMessage={errors.phone_number?.message}
                    >
                        <Controller
                            name="phone_number"
                            control={control}
                            render={({ field }) => (
                                <NumericInput
                                    autoComplete="off"
                                    placeholder="Phone Number"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                        disabled={!hasChanges} // Disable button if no changes

                    >
                        Save
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default SettingsProfile
