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
    HiOutlineSparkles,
    HiShieldCheck,
    HiOutlineKey,
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

const DEMO_ACCOUNTS = [
    {
        label: 'Super Master',
        username: 'Mastan99m',
        password: 'admin123',
        role: 'Rolex 2FA (OTP 123456)',
        is2FA: true,
    },
    {
        label: 'Admin',
        username: 'admin',
        password: 'admin123',
        role: 'Instant Login • No 2FA',
        is2FA: false,
    },
    {
        label: 'Demo Operator',
        username: 'demo',
        password: 'password123',
        role: 'Operator • No 2FA',
        is2FA: false,
    },
]

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [selectedDemo, setSelectedDemo] = useState<string>('Mastan99m')

    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            username: 'Mastan99m',
            password: 'admin123',
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

    const handleSelectDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
        setSelectedDemo(acc.username)
        setValue('username', acc.username, { shouldValidate: true })
        setValue('password', acc.password, { shouldValidate: true })
        setMessage?.('')
    }

    return (
        <div className={className}>
            {/* Quick Demo Test Account Picker (Sober & Compact) */}
            <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800/90 border border-slate-200/90 dark:border-gray-700/80">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <HiOutlineSparkles className="text-teal-600 dark:text-teal-400" /> Quick Account Test:
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold font-mono">
                        1-Click Fill
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                    {DEMO_ACCOUNTS.map((acc) => {
                        const isSelected = selectedDemo.toLowerCase() === acc.username.toLowerCase()
                        return (
                            <button
                                key={acc.username}
                                type="button"
                                onClick={() => handleSelectDemo(acc)}
                                className={classNames(
                                    'py-1.5 px-2 rounded-lg text-left text-xs transition-all border flex flex-col justify-between',
                                    isSelected
                                        ? 'bg-white dark:bg-gray-700 border-teal-600 dark:border-teal-400 shadow-sm ring-1 ring-teal-500/30'
                                        : 'bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/50 border-gray-200/80 dark:border-gray-700',
                                )}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-bold text-gray-800 dark:text-gray-100 font-mono text-[11px] truncate">
                                        {acc.username}
                                    </span>
                                    {acc.is2FA ? (
                                        <HiShieldCheck className="text-emerald-600 text-xs shrink-0" title="2FA" />
                                    ) : (
                                        <HiOutlineKey className="text-blue-500 text-[10px] shrink-0" />
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-400 truncate mt-0.5">
                                    {acc.label}
                                </span>
                            </button>
                        )
                    })}
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
                    className="!bg-[#175276] hover:!bg-[#12425f] active:!bg-[#0e334a] text-white font-bold shadow-md shadow-blue-900/15 transition-all !h-11 mt-3 text-sm tracking-wide"
                >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
