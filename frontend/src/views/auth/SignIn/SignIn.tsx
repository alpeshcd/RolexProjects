import { Card, Alert, Typography } from 'antd'
import RolexLogo from '@/components/template/RolexLogo'
import SignInForm from './components/SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

const { Title, Text } = Typography

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({ disableSubmit }: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <div className="w-full flex flex-col items-center">
            {/* Top Logo */}
            <div className="mb-6 flex justify-center">
                <RolexLogo />
            </div>

            {/* Sober Ant Design Login Card */}
            <Card
                className="w-full max-w-[400px] !rounded-2xl border border-line"
                style={{ boxShadow: '0 1px 2px rgba(22, 32, 27, 0.04), 0 12px 32px -12px rgba(22, 32, 27, 0.12)' }}
                styles={{ body: { padding: '28px 32px' } }}
            >
                <div className="mb-6">
                    <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                        Welcome back
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        Sign in to continue to Rolex Admin
                    </Text>
                </div>

                {message && (
                    <Alert
                        message={message}
                        type="error"
                        showIcon
                        className="mb-4 text-xs"
                    />
                )}

                <SignInForm
                    disableSubmit={disableSubmit}
                    setMessage={setMessage}
                />

                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[11px] text-ink-3">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                        Secure SSL 256-Bit
                    </span>
                    <span>Rolex Panel v1.0.7</span>
                </div>
            </Card>
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn

