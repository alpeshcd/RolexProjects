import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Tag from '@/components/ui/Tag'
import { FormItem } from '@/components/ui/Form'
import { useAuth } from '@/auth'
import { HiOutlineRefresh, HiShieldCheck } from 'react-icons/hi'
import { RiLockPasswordLine } from 'react-icons/ri'

const Verify2FA = () => {
    const navigate = useNavigate()
    const { verify2FA } = useAuth()

    const [otpCode, setOtpCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [secondsLeft, setSecondsLeft] = useState(30)

    const targetUser =
        (typeof window !== 'undefined' &&
            localStorage.getItem('temp_2fa_user')) ||
        'Verification'

    // 30-second Authenticator OTP refresh countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev <= 1 ? 30 : prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const handleSubmit = async (e?: FormEvent) => {
        if (e) e.preventDefault()

        const cleanCode = otpCode.trim()
        if (!cleanCode) {
            setError('Please enter the 6-digit OTP code from your Authenticator app.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await verify2FA(cleanCode)
            if (res.status === 'failed') {
                setError(res.message || 'Invalid OTP code')
            }
        } catch (err: any) {
            setError(
                err?.message ||
                    'Invalid OTP code. Please enter the current code from your Authenticator app.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 w-full p-4 sm:p-6 bg-slate-50/70 dark:bg-gray-900 min-h-[calc(100vh-64px)] flex flex-col justify-between">
            <div>
                {/* Header Breadcrumbs Row - Exactly matching user screenshot */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-black tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                            VERIFY
                        </h1>
                        <Tag className="bg-teal-50 border-teal-200 text-teal-700 font-bold text-[10px]">
                            2FA ACTIVE
                        </Tag>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        <span className="text-gray-400">Home</span>
                        <span className="mx-1.5 text-gray-400">/</span>
                        <span className="text-teal-700 dark:text-teal-400 font-semibold">Verify</span>
                    </div>
                </div>

                {/* Centered Verify 2FA Card - Modern & Sober */}
                <div className="w-full flex justify-center py-6 sm:py-10">
                    <Card
                        className="w-full max-w-[560px] bg-white dark:bg-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-gray-700/80 rounded-2xl overflow-hidden"
                        bodyClass="p-0"
                    >
                        {/* Card Header matching screenshot title */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HiShieldCheck className="text-teal-600 text-lg" />
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                    Verify 2FA
                                </h3>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400">
                                {targetUser}
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 sm:p-8">
                            {/* Explanatory Text matching screenshot */}
                            <div className="text-center mb-6">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                                    Please enter the <strong className="text-gray-900 dark:text-white font-bold">OTP</strong> generated on your Authenticator App.
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                    Ensure you submit the current one because it refreshes every 30 seconds.
                                </p>

                                {/* Live 30s Countdown Pill */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-slate-100 dark:bg-gray-700/60 text-slate-600 dark:text-gray-300 text-xs font-medium border border-slate-200/80 dark:border-gray-600/60">
                                    <HiOutlineRefresh
                                        className="text-teal-600 dark:text-teal-400 animate-spin text-xs"
                                        style={{ animationDuration: '3s' }}
                                    />
                                    <span>Code refreshes in:</span>
                                    <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                                        {secondsLeft}s
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <Alert showIcon className="mb-5 text-xs" type="danger">
                                    {error}
                                </Alert>
                            )}

                            {/* Verification Form */}
                            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
                                <FormItem
                                    label="One Time Password:"
                                    className="mb-3 text-center"
                                >
                                    <Input
                                        size="lg"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        autoFocus
                                        value={otpCode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '')
                                            setOtpCode(val)
                                            if (val.length === 6) {
                                                setError(null)
                                            }
                                        }}
                                        placeholder="Enter 6-digit OTP"
                                        prefix={
                                            <RiLockPasswordLine className="text-lg text-teal-600 dark:text-teal-400 ml-1" />
                                        }
                                        className="text-center font-mono tracking-widest text-lg font-bold !bg-slate-50 focus:!bg-white dark:!bg-gray-900/80"
                                    />
                                </FormItem>


                                {/* Login Action Button matching screenshot */}
                                <Button
                                    block
                                    size="lg"
                                    variant="solid"
                                    type="submit"
                                    loading={loading}
                                    className="!bg-[#008080] hover:!bg-[#006e6e] active:!bg-[#005a5a] text-white font-bold shadow-md shadow-teal-700/20 transition-all !h-11 text-sm tracking-wide"
                                >
                                    {loading ? 'Verifying OTP...' : 'Login'}
                                </Button>
                            </form>
                        </div>

                        {/* Footer info bar */}
                        <div className="px-6 py-3 bg-slate-50/70 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between text-[11px] text-gray-400">
                            <span>Rolex Security Protocol</span>
                            <button
                                type="button"
                                onClick={() => navigate('/sign-in')}
                                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Verify2FA
