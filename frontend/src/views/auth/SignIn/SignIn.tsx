import RolexLogo from '@/components/template/RolexLogo'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import SignInForm from './components/SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { MdSecurity } from 'react-icons/md'

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({ disableSubmit }: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <div className="w-full flex flex-col items-center">
            {/* Top Logo Branding Matching Screenshot with Modern Elegance */}
            <div className="mb-6 text-center">
                <RolexLogo className="mx-auto" showSubtitle />
            </div>

            {/* Centered Login Card */}
            <Card
                className="w-full max-w-[420px] bg-white dark:bg-gray-800 shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200/80 dark:border-gray-700/80 rounded-2xl overflow-hidden transition-all"
                bodyClass="p-6 sm:p-7"
            >
                <div className="mb-5 text-center">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Sign in to start your session
                    </p>
                </div>

                {message && (
                    <Alert showIcon className="mb-4 text-xs" type="danger">
                        <span className="break-all">{message}</span>
                    </Alert>
                )}

                <SignInForm
                    disableSubmit={disableSubmit}
                    setMessage={setMessage}
                />

                <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                        <MdSecurity className="text-teal-600 dark:text-teal-400 text-xs" /> 256-Bit SSL
                    </span>
                    <span>Rolex Exchange System</span>
                </div>
            </Card>
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
