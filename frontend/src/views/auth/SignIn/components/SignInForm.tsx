import { useState } from 'react'
import { Form, Input, Button, Checkbox, Space, Tag } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '@/auth'
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
    const [form] = Form.useForm<SignInFormValues>()
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

    const setQuickCredentials = (u: string, p: string) => {
        form.setFieldsValue({ username: u, password: p })
    }

    return (
        <div className={className}>
            <Form
                form={form}
                layout="vertical"
                initialValues={{ rememberMe: true }}
                onFinish={onFinish}
                requiredMark={false}
            >
                <Form.Item
                    name="username"
                    label={<span className="text-xs font-semibold text-ink-2">Username</span>}
                    rules={[{ required: true, message: 'Please enter your username' }]}
                    style={{ marginBottom: 14 }}
                >
                    <Input
                        prefix={<UserOutlined className="text-ink-3 text-xs mr-1" />}
                        placeholder="Enter username"
                        autoComplete="username"
                        size="large"
                        style={{ borderRadius: 8, fontSize: 13 }}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span className="text-xs font-semibold text-ink-2">Password</span>}
                    rules={[{ required: true, message: 'Please enter your password' }]}
                    style={{ marginBottom: 14 }}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-ink-3 text-xs mr-1" />}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        size="large"
                        style={{ borderRadius: 8, fontSize: 13 }}
                    />
                </Form.Item>

                <div className="flex items-center justify-between mb-4">
                    <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                        <Checkbox className="text-xs text-ink-2">Remember me</Checkbox>
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
                        borderRadius: 8,
                        height: 40,
                        fontWeight: 600,
                        fontSize: 13,
                    }}
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </Form>

            {/* Sober Subtle Quick Fill Tags */}
            <div className="mt-5 pt-4 border-t border-line text-center">
                <div className="text-[11px] text-ink-3 mb-2">
                    Quick Fill Test Credentials:
                </div>
                <Space size={6} wrap className="justify-center">
                    <Tag
                        className="cursor-pointer text-[11px] m-0 px-2 py-0.5 border border-line hover:border-primary hover:text-primary transition-colors"
                        onClick={() => setQuickCredentials('admin', 'admin123')}
                    >
                        Admin
                    </Tag>
                    <Tag
                        className="cursor-pointer text-[11px] m-0 px-2 py-0.5 border border-line hover:border-primary hover:text-primary transition-colors"
                        onClick={() => setQuickCredentials('MASTAN99M', 'admin123')}
                    >
                        Super Master
                    </Tag>
                    <Tag
                        className="cursor-pointer text-[11px] m-0 px-2 py-0.5 border border-line hover:border-primary hover:text-primary transition-colors"
                        onClick={() => setQuickCredentials('demo', 'password123')}
                    >
                        Operator
                    </Tag>
                </Space>
            </div>
        </div>
    )
}

export default SignInForm

