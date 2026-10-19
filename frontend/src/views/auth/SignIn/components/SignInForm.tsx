import { useState } from 'react'
import { Form, Input, Button, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useAuth } from '@/auth'
import classNames from '@/utils/classNames'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

type SignInFormValues = {
    username: string
    password: string
    rememberMe?: boolean
}

const SignInForm = (props: SignInFormProps) => {
    const { disableSubmit = false, className, setMessage, passwordHint } = props
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { signIn } = useAuth()

    const onFinish = async (values: SignInFormValues) => {
        if (!disableSubmit) {
            setSubmitting(true)
            setMessage?.('')

            const result = await signIn({
                username: values.username,
                password: values.password,
                userName: values.username,
                rememberMe: values.rememberMe ?? true,
            })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
            setSubmitting(false)
        }
    }

    return (
        <div className={classNames('auth-form', className)}>
            <Form
                layout="vertical"
                initialValues={{ rememberMe: true }}
                onFinish={onFinish}
                requiredMark={false}
            >
                <Form.Item
                    name="username"
                    label={<span className="text-[13px] font-semibold text-ink">Username</span>}
                    rules={[{ required: true, message: 'Please enter your username' }]}
                    style={{ marginBottom: 18 }}
                >
                    <Input
                        prefix={<UserOutlined className="text-ink-3 mr-1.5" />}
                        placeholder="Enter your username"
                        autoComplete="username"
                        size="large"
                        style={{ borderRadius: 10, height: 46, fontSize: 14 }}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span className="text-[13px] font-semibold text-ink">Password</span>}
                    rules={[{ required: true, message: 'Please enter your password' }]}
                    style={{ marginBottom: 16 }}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-ink-3 mr-1.5" />}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        size="large"
                        style={{ borderRadius: 10, height: 46, fontSize: 14 }}
                    />
                </Form.Item>

                <div className="flex items-center justify-between mb-6">
                    <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                        <Checkbox className="text-[13px] text-ink-2">Keep me signed in</Checkbox>
                    </Form.Item>
                    {passwordHint}
                </div>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isSubmitting}
                    size="large"
                    style={{
                        borderRadius: 10,
                        height: 46,
                        fontWeight: 600,
                        fontSize: 14,
                    }}
                >
                    {isSubmitting ? (
                        'Signing in...'
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            Sign in
                            <ArrowRightOutlined className="text-xs" />
                        </span>
                    )}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
