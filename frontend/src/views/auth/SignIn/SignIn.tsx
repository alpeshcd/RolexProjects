import { Alert } from 'antd'
import RolexLogo from '@/components/template/RolexLogo'
import SignInForm from './components/SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({ disableSubmit }: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <div className="w-full">
            {/* Logo on small screens; the brand panel shows it on desktop */}
            <div className="mb-10 flex justify-center lg:hidden">
                <RolexLogo />
            </div>

            <div className="mb-8">
                <h2 className="text-[28px] leading-tight font-bold tracking-tight text-ink">
                    Welcome back
                </h2>
                <p className="mt-2 text-[14px] text-ink-3 font-normal">
                    Sign in to your Rolex Admin account to continue.
                </p>
            </div>

            {message && (
                <Alert
                    message={message}
                    type="error"
                    showIcon
                    className="mb-5 text-[13px]"
                    style={{ borderRadius: 10 }}
                />
            )}

            <SignInForm disableSubmit={disableSubmit} setMessage={setMessage} />

            <div className="mt-10 text-center text-[12px] text-ink-3 font-normal">
                Rolex Panel v1.0.7
            </div>
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
