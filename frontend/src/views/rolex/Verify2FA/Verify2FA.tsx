import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Input } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import RolexLogo from '@/components/template/RolexLogo'
import { useAuth } from '@/auth'
import { HiShieldCheck } from 'react-icons/hi'

const Verify2FA = () => {
    const navigate = useNavigate()
    const { verify2FA } = useAuth()

    const [otpCode, setOtpCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [secondsLeft, setSecondsLeft] = useState(30)

    const targetUser =
        (typeof window !== 'undefined' && localStorage.getItem('temp_2fa_user')) || ''

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
        <div className="w-full max-w-[420px] mx-auto">
            {/* Logo on small screens; the brand panel shows it on desktop */}
            <div className="mb-10 flex justify-center lg:hidden">
                <RolexLogo />
            </div>

            <div className="mb-8">
                <span className="icon-chip h-11 w-11 mb-5">
                    <HiShieldCheck className="text-2xl" />
                </span>
                <h2 className="text-[28px] leading-tight font-bold tracking-tight text-ink">
                    Two-step verification
                </h2>
                <p className="mt-2 text-[14px] text-ink-3 font-normal">
                    Enter the 6-digit code from your Authenticator app
                    {targetUser ? (
                        <>
                            {' '}for <strong className="font-semibold text-ink-2">{targetUser}</strong>
                        </>
                    ) : null}
                    .
                </p>
            </div>

            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="mb-5 text-[13px]"
                    style={{ borderRadius: 10 }}
                />
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="flex items-center justify-between mb-2">
                    <label htmlFor="otp-code" className="text-[13px] font-semibold text-ink">
                        Verification code
                    </label>
                    <span className="text-[12px] text-ink-3 font-normal">
                        Refreshes in{' '}
                        <span className="font-mono font-semibold text-primary">{secondsLeft}s</span>
                    </span>
                </div>
                <Input
                    id="otp-code"
                    size="large"
                    inputMode="numeric"
                    autoComplete="one-time-code"
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
                    placeholder="••••••"
                    className="text-center font-mono font-semibold"
                    style={{ borderRadius: 10, height: 52, fontSize: 22, letterSpacing: '0.5em' }}
                />

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    className="mt-6"
                    style={{ borderRadius: 10, height: 46, fontWeight: 600, fontSize: 14 }}
                >
                    {loading ? (
                        'Verifying...'
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            Verify &amp; sign in
                            <ArrowRightOutlined className="text-xs" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={() => navigate('/sign-in')}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-primary transition-colors"
                >
                    <ArrowLeftOutlined className="text-[11px]" />
                    Back to sign in
                </button>
            </div>
        </div>
    )
}

export default Verify2FA
