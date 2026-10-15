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

            {/* Centered Luxury Glassmorphic Login Card */}
            <Card
                className="w-full max-w-[440px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl shadow-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300"
                bodyClass="p-7 sm:p-8"
            >
                <div className="mb-6 text-center">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        Sign In To Exchange
                    </h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Enter your credentials to access operations & ledger
                    </p>
                </div>

                {message && (
                    <Alert showIcon className="mb-5 text-xs rounded-xl" type="danger">
                        <span className="break-all font-medium">{message}</span>
                    </Alert>
                )}

                <SignInForm
                    disableSubmit={disableSubmit}
                    setMessage={setMessage}
                />

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <MdSecurity className="text-emerald-600 dark:text-emerald-400 text-sm" /> 256-Bit SSL Enforced
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
