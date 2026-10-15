import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import {
    apiGetAccounts,
    apiUpdateAccount,
    apiDeleteAccount,
} from '@/services/BankAccountsService'
import type { BankAccount } from '@/@types/account'
import {
    HiSearch,
    HiRefresh,
    HiPlus,
    HiQrcode,
    HiCheckCircle,
    HiXCircle,
    HiClipboardCopy,
    HiCreditCard,
    HiFilter,
    HiCash,
    HiOutlineOfficeBuilding,
    HiOutlineDuplicate,
} from 'react-icons/hi'
import { MdAccountBalance, MdQrCode2, MdCheck } from 'react-icons/md'

const AccountsView = () => {
    const navigate = useNavigate()

    // Data state
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Filter bar state
    const [userFilter, setUserFilter] = useState<string>('')
    const [nameFilter, setNameFilter] = useState<string>('')
    const [accountNumberFilter, setAccountNumberFilter] = useState<string>('')
    const [amountRangeFilter, setAmountRangeFilter] = useState<string>('Both')
    const [statusFilter, setStatusFilter] = useState<string>('All')

    // QR Modal State
    const [qrAccount, setQrAccount] = useState<BankAccount | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Load accounts
    const fetchAccounts = async (customParams?: Record<string, any>) => {
        setLoading(true)
        try {
            const params: Record<string, any> = customParams || {
                user: userFilter || undefined,
                name: nameFilter.trim() || undefined,
                account_number: accountNumberFilter.trim() || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            }
            const data = await apiGetAccounts(params)
            setAccounts(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch accounts list
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    // Search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchAccounts()
    }

    // Reset filters
    const handleReset = () => {
        setUserFilter('')
        setNameFilter('')
        setAccountNumberFilter('')
        setAmountRangeFilter('Both')
        setStatusFilter('All')
        fetchAccounts({})
    }

    // Toggle status (Active / Inactive)
    const handleToggleStatus = async (account: BankAccount) => {
        const newStatus = account.status === 'Active' ? 'Inactive' : 'Active'
        try {
            const updated = await apiUpdateAccount(account.id, {
                status: newStatus,
                is_active: newStatus === 'Active',
            })
            setAccounts((prev) =>
                prev.map((a) => (a.id === account.id ? updated : a))
            )
            toast.push(
                <Notification type="success" title="Status Updated">
                    Account <strong>{account.name}</strong> is now{' '}
                    <strong>{newStatus.toUpperCase()}</strong>!
                </Notification>
            )
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Update Failed">
                    Could not update account status.
                </Notification>
            )
        }
    }

    // Copy to clipboard
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        toast.push(
            <Notification type="success" title="Copied">
                Copied to clipboard: {text}
            </Notification>
        )
        setTimeout(() => setCopiedId(null), 2000)
    }

    // KPI Counters
    const totalAccounts = accounts.length
    const activeAccounts = accounts.filter((a) => a.status === 'Active').length
    const inactiveAccounts = accounts.filter((a) => a.status !== 'Active').length
    const upiAccountsCount = accounts.filter((a) => a.type === 'UPI').length

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-16">
            {/* Top Modern Header */}
            <div className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-6 bg-teal-600 rounded-full inline-block"></span>
                            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight uppercase">
                                BANK & PAYMENT ACCOUNTS
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 pl-4.5 font-medium">
                            Corporate bank accounts, UPI VPA channels, and deposit collection gateways
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1.5 mr-2">
                            <Link to="/home" className="hover:text-teal-700 transition-colors">
                                Home
                            </Link>
                            <span>/</span>
                            <span className="text-slate-700 font-semibold">Accounts</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchAccounts()}
                            title="Refresh accounts"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-sm transition-all"
                        >
                            <HiRefresh className={`text-base ${loading ? 'animate-spin text-teal-600' : ''}`} />
                        </button>

                        <Link
                            to="/accounts/create"
                            className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 active:scale-98 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider transition-all shadow-sm"
                        >
                            <HiPlus className="text-base" />
                            <span>Add Account</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center text-lg">
                            <MdAccountBalance />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Total Gateways
                            </span>
                            <span className="text-sm font-bold text-slate-800">{totalAccounts}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                            <HiCheckCircle />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Active Channels
                            </span>
                            <span className="text-sm font-bold text-emerald-700">{activeAccounts} Live</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-lg">
                            <HiXCircle />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Inactive Reserve
                            </span>
                            <span className="text-sm font-bold text-rose-700">{inactiveAccounts}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-cyan-100 text-cyan-700 flex items-center justify-center text-lg">
                            <MdQrCode2 />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                UPI VPAs
                            </span>
                            <span className="text-sm font-bold text-cyan-800">{upiAccountsCount} Channels</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-5">
                {/* Search & Filter Form (Screenshot 1 Layout) */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider">
                        <HiFilter className="text-teal-600 text-base" />
                        <span>Filter Gateways</span>
                    </div>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end">
                        {/* User Field */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                User:
                            </label>
                            <select
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                            >
                                <option value="">Select User</option>
                                <option value="MASTAN99M">MASTAN99M</option>
                            </select>
                        </div>

                        {/* A/C Name Field */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                A/C Name:
                            </label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                            />
                        </div>

                        {/* A/C Number Field */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                A/C Number:
                            </label>
                            <input
                                type="text"
                                placeholder="Enter number"
                                value={accountNumberFilter}
                                onChange={(e) => setAccountNumberFilter(e.target.value)}
                                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                            />
                        </div>

                        {/* Max Amount Range */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Max Amount Range:
                            </label>
                            <select
                                value={amountRangeFilter}
                                onChange={(e) => setAmountRangeFilter(e.target.value)}
                                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                            >
                                <option value="Both">Both</option>
                                <option value="10000">Up to 10,000</option>
                                <option value="20000">Up to 20,000</option>
                                <option value="40000">Up to 40,000</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Status:
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                            >
                                <option value="All">All</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        {/* SEARCH Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#008080] hover:bg-[#006e6e] active:scale-98 text-white font-bold text-xs py-2 px-4 rounded-lg uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <HiSearch className="text-sm" />
                                <span>SEARCH</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Accounts Table Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-3 px-3 w-10 text-center">NO</th>
                                    <th className="py-3 px-3">USER</th>
                                    <th className="py-3 px-3">NAME</th>
                                    <th className="py-3 px-3 text-center">TYPE</th>
                                    <th className="py-3 px-3">CATEGORY</th>
                                    <th className="py-3 px-3">A/C NO</th>
                                    <th className="py-3 px-3">IFSC CODE</th>
                                    <th className="py-3 px-3">BANK NAME</th>
                                    <th className="py-3 px-3 text-right">MIN AMOUNT</th>
                                    <th className="py-3 px-3 text-right">MAX AMOUNT</th>
                                    <th className="py-3 px-3 text-center">MAX DEPOSIT</th>
                                    <th className="py-3 px-3 text-center">FOR</th>
                                    <th className="py-3 px-3 text-center">STATUS</th>
                                    <th className="py-3 px-3">LAST UPDATE</th>
                                    <th className="py-3 px-3 text-center">QR</th>
                                    <th className="py-3 px-3 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td colSpan={16} className="py-12 text-center text-slate-500 font-medium">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading banking accounts...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : accounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={16} className="py-12 text-center text-slate-500 font-medium">
                                            No Data Available In Table
                                        </td>
                                    </tr>
                                ) : (
                                    accounts.map((acc, index) => (
                                        <tr
                                            key={acc.id || index}
                                            className="hover:bg-slate-50/70 transition-colors"
                                        >
                                            <td className="py-2.5 px-3 text-center text-slate-500 font-semibold text-[11px]">
                                                {index + 1}
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                                                {acc.user || 'MASTAN99M'}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-slate-900 tracking-tight whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{acc.name}</span>
                                                    <span className="w-2 h-2 rounded-full bg-teal-500 inline-block shrink-0"></span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="bg-slate-100 text-slate-700 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                                                    {acc.type || 'UPI'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                                                {acc.category || 'No Category'}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-[11px] text-teal-800 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                                        {acc.account_number}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(acc.account_number, `ac-${acc.id}`)}
                                                        className="text-slate-400 hover:text-teal-700 p-1 rounded transition-colors"
                                                        title="Copy Account Number / UPI ID"
                                                    >
                                                        {copiedId === `ac-${acc.id}` ? (
                                                            <MdCheck className="text-emerald-600 text-xs" />
                                                        ) : (
                                                            <HiOutlineDuplicate className="text-xs" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                                                {acc.ifsc_code || '-'}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-700 font-medium text-[11px]">
                                                {acc.bank_name || '-'}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                                                {acc.min_amount.toFixed(4)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                                {acc.max_amount.toFixed(4)}
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-slate-600 font-medium text-[11px]">
                                                {acc.max_deposit || 'Both'}
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-semibold text-teal-800">
                                                {acc.account_for || 'Deposit'}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(acc)}
                                                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
                                                        acc.status === 'Active'
                                                            ? 'bg-[#28a745] hover:bg-[#218838] text-white'
                                                            : 'bg-[#dc3545] hover:bg-[#c82333] text-white'
                                                    }`}
                                                    title="Click to toggle status"
                                                >
                                                    {acc.status}
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                                                {acc.last_update_str || acc.last_update || '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                {/* Blue QR Pill Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setQrAccount(acc)}
                                                    className="bg-[#17a2b8] hover:bg-[#138496] active:scale-95 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center gap-1 shadow-2xs mx-auto"
                                                >
                                                    <HiQrcode className="text-xs" />
                                                    <span>QR</span>
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                <span className="text-[11px] text-slate-500">
                                                    {acc.last_update_str || '11-10-2026 12:23:23 AM'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing <strong>1</strong> to <strong>{accounts.length}</strong> of <strong>{accounts.length}</strong> entries</span>
                        <span className="font-semibold text-teal-700">Rolex Payment Gateway Management</span>
                    </div>
                </div>
            </div>

            {/* QR Code Modal Dialog */}
            <Dialog
                isOpen={!!qrAccount}
                onClose={() => setQrAccount(null)}
                onRequestClose={() => setQrAccount(null)}
                width={420}
            >
                {qrAccount && (
                    <div className="p-6 text-center">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                            <h3 className="text-base font-bold text-slate-800 uppercase flex items-center gap-2">
                                <MdQrCode2 className="text-teal-600 text-xl" />
                                <span>UPI Payment QR Code</span>
                            </h3>
                        </div>

                        {/* QR Box Container */}
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm inline-block mx-auto mb-4">
                            {/* Generates a live QR code via QR Server API for exact UPI payload */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(
                                    qrAccount.account_number
                                )}&pn=${encodeURIComponent(qrAccount.name)}&cu=INR`}
                                alt="UPI QR Code"
                                className="w-48 h-48 mx-auto"
                            />
                        </div>

                        <div className="space-y-1 mb-5">
                            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">
                                Beneficiary Name
                            </span>
                            <span className="font-bold text-slate-900 text-sm block">
                                {qrAccount.name}
                            </span>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="bg-slate-100 px-3 py-1 rounded text-xs font-mono font-semibold text-teal-800 border border-slate-200">
                                    {qrAccount.account_number}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(qrAccount.account_number, 'modal-upi')}
                                    className="bg-teal-50 text-teal-700 hover:bg-teal-100 p-1.5 rounded transition-colors"
                                    title="Copy UPI ID"
                                >
                                    <HiClipboardCopy className="text-sm" />
                                </button>
                            </div>
                            <span className="text-[11px] text-slate-400 block pt-1">
                                Min: ₹{qrAccount.min_amount} | Max: ₹{qrAccount.max_amount}
                            </span>
                        </div>

                        <div className="flex justify-center gap-2 pt-2 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setQrAccount(null)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCopy(qrAccount.account_number, 'modal-upi')}
                                className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm transition-all"
                            >
                                Copy UPI ID
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default AccountsView
