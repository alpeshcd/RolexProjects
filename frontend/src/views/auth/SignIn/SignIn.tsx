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

export const SignInBase = ({
    disableSubmit,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <div className="w-full">
            <Card
                className="shadow-2xl border-gray-200/80 dark:border-gray-700 rounded-2xl overflow-hidden"
                bodyClass="p-6 sm:p-8"
            >
                <div className="mb-6 text-center">
                    <RolexLogo className="mx-auto" />
                    <div className="flex justify-center mt-2">
                        <Tag className="bg-emerald-50 border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <MdSecurity className="text-xs" /> Secure Exchange Portal
                        </Tag>
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <h3 className="mb-1 text-lg font-black text-gray-800 dark:text-gray-100">
                        Administrator Access
                    </h3>
                    <p className="text-xs text-gray-500">
                        Sign in with your master credentials to manage exchange markets
                    </p>
                </div>

                {message && (
                    <Alert showIcon className="mb-5 text-xs" type="danger">
                        <span className="break-all">{message}</span>
                    </Alert>
                )}

                <SignInForm
                    disableSubmit={disableSubmit}
                    setMessage={setMessage}
                />

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-[11px] text-gray-400">
                    Rolex Exchange System • 256-Bit SSL Encrypted
                </div>
            </Card>
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
