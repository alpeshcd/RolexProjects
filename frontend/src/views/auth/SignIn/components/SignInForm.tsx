import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Tag from '@/components/ui/Tag'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import {
    HiOutlineUser,
    HiOutlineLockClosed,
} from 'react-icons/hi'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

type SignInFormSchema = {
    username: string
    password: string
    rememberMe: boolean
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    username: z
        .string({ required_error: 'Please enter your username' })
        .min(1, { message: 'Please enter your username' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
    rememberMe: z.boolean().optional(),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            username: '',
            password: '',
            rememberMe: true,
        },
        resolver: zodResolver(validationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
        const { username, password, rememberMe } = values

        if (!disableSubmit) {
            setSubmitting(true)
            setMessage?.('')

            const result = await signIn({
                username,
                password,
                userName: username,
                rememberMe,
            })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>

            <Form onSubmit={handleSubmit(onSignIn)} className="space-y-3.5">
                <FormItem
                    label="Username"
                    invalid={Boolean(errors.username)}
                    errorMessage={errors.username?.message}
                    className="mb-2.5"
                >
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <Input
                                size="md"
                                type="text"
                                placeholder="Username"
                                autoComplete="username"
                                prefix={<HiOutlineUser className="text-base text-gray-400 ml-0.5" />}
                                className="!bg-slate-50/70 focus:!bg-white dark:!bg-gray-900/60 dark:focus:!bg-gray-900 font-medium"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className="mb-2.5"
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                size="md"
                                placeholder="Password"
                                autoComplete="current-password"
                                prefix={<HiOutlineLockClosed className="text-base text-gray-400 ml-0.5" />}
                                className="!bg-slate-50/70 focus:!bg-white dark:!bg-gray-900/60 dark:focus:!bg-gray-900 font-medium"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <div className="flex items-center justify-between pt-0.5 pb-1">
                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Checkbox
                                checked={value}
                                onChange={(val) => onChange(val)}
                                className="text-xs text-gray-600 dark:text-gray-400 select-none"
                            >
                                Remember me
                            </Checkbox>
                        )}
                    />
                    <Tag className="bg-slate-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-semibold border-none">
                        JWT Token
                    </Tag>
                </div>

                {passwordHint}

                <Button
                    block
                    size="lg"
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    className="!bg-[#175276] hover:!bg-[#12425f] active:!bg-[#0e334a] text-white font-bold shadow-md shadow-blue-900/15 transition-all !h-11 mt-3 text-sm tracking-wide"
                >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
