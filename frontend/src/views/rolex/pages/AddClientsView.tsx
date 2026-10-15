import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreateClientFromForm } from '@/services/AuthService'
import { apiGetPortals } from '@/services/GlobalSearchService'
import {
    HiUserAdd,
    HiLockClosed,
    HiUser,
    HiTag,
    HiGlobeAlt,
    HiEye,
    HiEyeOff,
    HiArrowLeft,
    HiCheckCircle,
    HiShieldCheck,
} from 'react-icons/hi'

const DEFAULT_MASTERS = [
    { label: 'Mastan777(mastan247.club)', value: 'Mastan777(mastan247.club)', site: 'Mastan247' },
    { label: 'Mastan365m(mastan365.com)', value: 'Mastan365m(mastan365.com)', site: 'Mastan365' },
    { label: 'Mastan99m(mastan99.com)', value: 'Mastan99m(mastan99.com)', site: 'Mastan99' },
    { label: 'Mastanreddymas(mastanreddy.com)', value: 'Mastanreddymas(mastanreddy.com)', site: 'Mastanredd' },
]

const AddClientsView = () => {
    const navigate = useNavigate()
    const [masterList, setMasterList] = useState<{ label: string; value: string; site: string }[]>(DEFAULT_MASTERS)
    const [selectedMaster, setSelectedMaster] = useState<string>(DEFAULT_MASTERS[0].value)
    const [referralCode, setReferralCode] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)

    useEffect(() => {
        const loadPortals = async () => {
            try {
                const portals = await apiGetPortals()
                if (portals && portals.length > 0) {
                    setMasterList(
                        portals.map((p) => ({
                            label: p.domain_title,
                            value: p.domain_title,
                            site: p.domain_key,
                        }))
                    )
                    setSelectedMaster(portals[0].domain_title)
                }
            } catch (err) {
                // Keep default
            }
        }
        loadPortals()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim() || !password.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    Username and Password are required.
                </Notification>
            )
            return
        }

        setSubmitting(true)
        try {
            const client = await apiCreateClientFromForm({
                master: selectedMaster,
                referral_code: referralCode.trim() || undefined,
                username: username.trim(),
                password: password.trim(),
            })

            toast.push(
                <Notification type="success" title="Client Created Successfully">
                    Client <strong>{client.username}</strong> registered under{' '}
                    <strong>{client.site || client.master}</strong>!
                </Notification>
            )

            // Seamlessly route to Clients list
            navigate('/clients')
        } catch (err: any) {
            const errMsg = err?.response?.data?.detail || 'Failed to create client'
            toast.push(
                <Notification type="danger" title="Error">
                    {errMsg}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-16">
            {/* Top Modern Header / Breadcrumbs */}
            <div className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-sm transition-colors"
                            title="Back to client list"
                        >
                            <HiArrowLeft />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-6 bg-teal-600 rounded-full inline-block"></span>
                                <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight uppercase">
                                    ADD NEW CLIENT
                                </h1>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 pl-4.5 font-medium">
                                Provision credentials and assign to an exchange master agent
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Link to="/home" className="hover:text-teal-700 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link to="/clients" className="hover:text-teal-700 transition-colors">
                            Clients
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800 font-bold">Add</span>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {/* Add Clients Modern Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
                    {/* Header Strip */}
                    <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg text-teal-200 backdrop-blur-xs">
                                <HiUserAdd />
                            </div>
                            <div>
                                <h2 className="font-bold text-sm md:text-base tracking-wide">
                                    Client Registration Form
                                </h2>
                                <span className="text-xs text-teal-200/90 block">
                                    Fields with asterisk (*) are required
                                </span>
                            </div>
                        </div>
                        <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block border border-white/20">
                            FastAPI + SQLite Live Sync
                        </span>
                    </div>

                    {/* Quick Master Portal Chips */}
                    <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/70">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            Quick Select Master Portal:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {masterList.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setSelectedMaster(m.value)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-left truncate flex items-center gap-1.5 border ${
                                        selectedMaster === m.value
                                            ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-2 ring-teal-500/20'
                                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                >
                                    <HiGlobeAlt className={`text-sm shrink-0 ${selectedMaster === m.value ? 'text-teal-200' : 'text-slate-400'}`} />
                                    <span className="truncate">{m.label.split('(')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Master Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Master Portal *
                                </label>
                                <div className="relative">
                                    <HiGlobeAlt className="absolute left-3.5 top-3 text-slate-400 text-base pointer-events-none" />
                                    <select
                                        value={selectedMaster}
                                        onChange={(e) => setSelectedMaster(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                    >
                                        {masterList.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    The betting exchange engine that powers this client's portal.
                                </span>
                            </div>

                            {/* Referral Code Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Referral Code
                                </label>
                                <div className="relative">
                                    <HiTag className="absolute left-3.5 top-3 text-slate-400 text-base pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="e.g. ROLEX100 (Optional)"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-medium uppercase"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Sub-agent or marketing promo tracking referral code.
                                </span>
                            </div>

                            {/* Username Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Username *
                                </label>
                                <div className="relative">
                                    <HiUser className="absolute left-3.5 top-3 text-slate-400 text-base pointer-events-none" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. ROLEX_PLAYER99"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-bold uppercase"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Unique login username used for mobile app and web access.
                                </span>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <HiLockClosed className="absolute left-3.5 top-3 text-slate-400 text-base pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-mono font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <HiEyeOff className="text-base" /> : <HiEye className="text-base" />}
                                    </button>
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Hashed securely with bcrypt before saving to the database.
                                </span>
                            </div>
                        </div>

                        {/* Security Notice Box */}
                        <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 flex items-center gap-3 text-xs text-teal-900">
                            <HiShieldCheck className="text-teal-700 text-2xl shrink-0" />
                            <div>
                                <span className="font-bold block">Instant Account Activation</span>
                                <span className="text-teal-800 text-[11px]">
                                    Newly added clients are automatically tagged with status <strong>ACTIVE</strong> and assigned a sequential exchange client ID.
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/clients')}
                                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs text-slate-700 font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 active:scale-98 text-white text-xs font-bold px-8 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                <HiCheckCircle className="text-base" />
                                <span>{submitting ? 'Creating Client...' : 'Create Client Account'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddClientsView
