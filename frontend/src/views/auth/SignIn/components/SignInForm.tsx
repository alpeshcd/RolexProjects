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
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineSparkles, HiShieldCheck, HiOutlineKey } from 'react-icons/hi'

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
        label: 'Admin (Instant)',
        username: 'admin',
        password: 'admin123',
        role: 'Direct Login • No 2FA',
        badgeColor: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
    {
        label: 'Super Master (2FA)',
        username: 'MASTAN99M',
        password: 'admin123',
        role: 'Rolex Panel • OTP 123456',
        badgeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    {
        label: 'Demo Operator',
        username: 'demo',
        password: 'password123',
        role: 'Operator • No 2FA',
        badgeColor: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
]

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [selectedDemo, setSelectedDemo] = useState<string>('admin')

    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            username: 'admin',
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
            {/* Quick-Select Demo Accounts Widget */}
            <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-gray-800/80 border border-slate-200/80 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <HiOutlineSparkles className="text-teal-600" /> Click to Test Local Account:
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold font-mono">1-Click Auto Fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {DEMO_ACCOUNTS.map((acc) => {
                        const isSelected = selectedDemo === acc.username
                        return (
                            <button
                                key={acc.username}
                                type="button"
                                onClick={() => handleSelectDemo(acc)}
                                className={classNames(
                                    'p-2 rounded-lg text-left text-xs transition-all border flex flex-col justify-between',
                                    isSelected
                                        ? 'bg-white dark:bg-gray-700 border-teal-500 shadow-sm ring-1 ring-teal-500'
                                        : 'bg-transparent hover:bg-white/60 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700',
                                )}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-bold text-gray-800 dark:text-gray-100 font-mono text-[11px]">
                                        {acc.username}
                                    </span>
                                    {acc.username === 'MASTAN99M' ? (
                                        <HiShieldCheck className="text-emerald-600 text-sm" title="2FA Enabled" />
                                    ) : (
                                        <HiOutlineKey className="text-blue-500 text-xs" />
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-500 truncate mt-0.5">
                                    {acc.role}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <Form onSubmit={handleSubmit(onSignIn)} className="space-y-4">
                <FormItem
                    label="Username / ID"
                    invalid={Boolean(errors.username)}
                    errorMessage={errors.username?.message}
                    className="mb-3"
                >
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder="Enter Username (e.g. admin or MASTAN99M)"
                                autoComplete="username"
                                prefix={<HiOutlineUser className="text-lg text-teal-600 ml-1" />}
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className="mb-3"
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                placeholder="Enter Password"
                                autoComplete="current-password"
                                prefix={<HiOutlineLockClosed className="text-lg text-teal-600 ml-1" />}
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <div className="flex items-center justify-between py-1">
                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Checkbox
                                checked={value}
                                onChange={(val) => onChange(val)}
                                className="text-xs text-gray-600 dark:text-gray-400"
                            >
                                Remember me (Auto Token Refresh)
                            </Checkbox>
                        )}
                    />
                    <Tag className="bg-teal-50 border-teal-200 text-teal-700 text-[10px] font-bold">
                        JWT + Refresh Ready
                    </Tag>
                </div>

                {passwordHint}

                <Button
                    block
                    size="lg"
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    className="!bg-gradient-to-r !from-teal-600 !to-cyan-600 hover:!from-teal-700 hover:!to-cyan-700 text-white font-bold shadow-md shadow-teal-600/20 transition-all mt-4"
                >
                    {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
