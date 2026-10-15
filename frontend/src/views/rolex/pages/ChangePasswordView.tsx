import { useState } from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiChangePassword } from '@/services/StatementsService'
import {
    HiLockClosed,
    HiEye,
    HiEyeOff,
    HiShieldCheck,
    HiCheckCircle,
    HiExclamationCircle,
    HiKey,
} from 'react-icons/hi'
import { MdSecurity, MdPassword } from 'react-icons/md'

const ChangePasswordView = () => {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otpCode, setOtpCode] = useState('')

    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)

    // Calculate password strength
    const calculateStrength = (pwd: string) => {
        let score = 0
        if (pwd.length >= 6) score += 25
        if (pwd.length >= 8) score += 25
        if (/[A-Z]/.test(pwd)) score += 25
        if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25
        return score
    }

    const strength = calculateStrength(newPassword)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!oldPassword.trim()) {
            toast.push(
                <Notification title="Missing Password" type="warning">
                    Please enter your current administrative password.
                </Notification>
            )
            return
        }

        if (newPassword !== confirmPassword) {
            toast.push(
                <Notification title="Mismatch" type="danger">
                    New password and confirmation do not match.
                </Notification>
            )
            return
        }

        if (newPassword.length < 6) {
            toast.push(
                <Notification title="Weak Password" type="warning">
                    Password must be at least 6 characters long.
                </Notification>
            )
            return
        }

        setLoading(true)
        try {
            const res = await apiChangePassword({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
                otp_code: otpCode.trim() || undefined,
            })
            toast.push(
                <Notification title="Success" type="success">
                    {res.message || 'Password changed successfully!'}
                </Notification>
            )
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setOtpCode('')
        } catch (err: any) {
            toast.push(
                <Notification title="Update Failed" type="danger">
                    {err?.response?.data?.detail || 'Failed to update password.'}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 pb-12 max-w-4xl mx-auto">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                    <span>Rolex Security Center</span>
                    <span>•</span>
                    <span>Credential Management</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <MdSecurity className="text-emerald-400 text-3xl" />
                    <span>CHANGE ADMINISTRATIVE PASSWORD</span>
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                    Ensure your Rolex exchange administrative account uses strong, rotating authentication credentials.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Card */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Current Password <span className="text-rose-500">*</span>:
                            </label>
                            <div className="relative">
                                <input
                                    type={showOld ? 'text' : 'password'}
                                    placeholder="Enter current password..."
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOld(!showOld)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showOld ? <HiEyeOff /> : <HiEye />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                New Password <span className="text-rose-500">*</span>:
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Enter new strong password..."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showNew ? <HiEyeOff /> : <HiEye />}
                                </button>
                            </div>

                            {/* Strength Meter */}
                            {newPassword && (
                                <div className="mt-2 space-y-1">
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${
                                                strength <= 25
                                                    ? 'bg-rose-500 w-1/4'
                                                    : strength <= 50
                                                    ? 'bg-amber-500 w-2/4'
                                                    : strength <= 75
                                                    ? 'bg-blue-500 w-3/4'
                                                    : 'bg-emerald-500 w-full'
                                            }`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-slate-400">Password Strength:</span>
                                        <span
                                            className={
                                                strength <= 25
                                                    ? 'text-rose-500'
                                                    : strength <= 50
                                                    ? 'text-amber-500'
                                                    : strength <= 75
                                                    ? 'text-blue-500'
                                                    : 'text-emerald-500'
                                            }
                                        >
                                            {strength <= 25
                                                ? 'Weak'
                                                : strength <= 50
                                                ? 'Fair'
                                                : strength <= 75
                                                ? 'Good'
                                                : 'Excellent'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Confirm New Password <span className="text-rose-500">*</span>:
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Re-type new password..."
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirm ? <HiEyeOff /> : <HiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Optional 2FA PIN */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                2FA Authenticator PIN (Optional):
                            </label>
                            <input
                                type="text"
                                placeholder="6-digit code from Google Authenticator"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                maxLength={6}
                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tracking-widest text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            />
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
                            >
                                <HiKey className="text-base" />
                                <span>{loading ? 'Updating Credentials...' : 'Update Password'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Guidelines Sidebar */}
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                            <HiShieldCheck className="text-lg text-emerald-500" />
                            <span>Security Recommendations</span>
                        </h4>
                        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <HiCheckCircle className="text-emerald-500 text-sm mt-0.5 flex-shrink-0" />
                                <span>Minimum 8 alphanumeric characters.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <HiCheckCircle className="text-emerald-500 text-sm mt-0.5 flex-shrink-0" />
                                <span>Include at least one uppercase letter (A-Z).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <HiCheckCircle className="text-emerald-500 text-sm mt-0.5 flex-shrink-0" />
                                <span>Include at least one number and special symbol.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <HiCheckCircle className="text-emerald-500 text-sm mt-0.5 flex-shrink-0" />
                                <span>Never reuse exchange credentials across other portals.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                            Rolex SuperMaster Account
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            Logged in as <strong className="font-mono">MASTAN99M</strong>. Two-Factor Authentication is actively protecting this session.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePasswordView
