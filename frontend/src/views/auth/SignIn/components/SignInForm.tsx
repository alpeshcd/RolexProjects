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
        setValue,
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
            {/* Quick Fill Test Accounts */}
            <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    ⚡ Quick Login Credentials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            setValue('username', 'admin')
                            setValue('password', 'admin123')
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                        Admin (Direct)
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setValue('username', 'MASTAN99M')
                            setValue('password', 'admin123')
                        }}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                        Super Master (2FA)
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setValue('username', 'demo')
                            setValue('password', 'password123')
                        }}
                        className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                        Operator (demo)
                    </button>
                </div>
            </div>

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
                    className="!bg-gradient-to-r !from-emerald-600 !via-teal-600 !to-emerald-700 hover:!from-emerald-500 hover:!to-teal-500 active:!from-emerald-700 active:!to-teal-700 text-white font-black shadow-lg shadow-emerald-950/20 rounded-xl transition-all !h-11 mt-3 text-sm tracking-wider uppercase border-none"
                >
                    {isSubmitting ? 'Verifying Session...' : 'Sign In To Panel'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
