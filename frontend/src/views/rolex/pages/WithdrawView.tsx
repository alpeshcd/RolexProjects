import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import {
    apiGetWithdrawals,
    apiCreateWithdrawal,
    apiApproveWithdrawal,
    apiRejectWithdrawal,
    apiCancelWithdrawal,
} from '@/services/WithdrawalsService'
import type { Withdrawal } from '@/@types/withdrawal'
import {
    HiSearch,
    HiRefresh,
    HiCheck,
    HiX,
    HiBan,
    HiOutlineDocumentText,
    HiCreditCard,
    HiCash,
    HiOutlineClock,
    HiCheckCircle,
    HiXCircle,
    HiLightningBolt,
    HiFilter,
    HiDuplicate,
    HiOutlinePlusCircle,
    HiOfficeBuilding,
} from 'react-icons/hi'
import { MdAccountBalance, MdCheckCircle, MdCancel, MdPayments } from 'react-icons/md'

type TabType = 'pending' | 'history'

const WithdrawView = () => {
    const location = useLocation()

    // Determine initial active tab based on route pathname
    const getInitialTab = (): TabType => {
        const path = location.pathname.toLowerCase()
        if (path.includes('history')) return 'history'
        return 'pending'
    }

    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab())

    // Withdrawals state
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(true)

    const queryUser = new URLSearchParams(location.search).get('user') || new URLSearchParams(location.search).get('username') || ''

    // Filter state for Pending Queue (Screenshot 1)
    const [pendingUserFilter, setPendingUserFilter] = useState<string>(queryUser)
    const [pendingStatusFilter, setPendingStatusFilter] = useState<string>('Pending')
    const [pendingTypeFilter, setPendingTypeFilter] = useState<string>('Client')

    // Filter state for Withdraw History (Screenshots 2 & 3)
    const [histDomainFilter, setHistDomainFilter] = useState<string>('')
    const [histStatusFilter, setHistStatusFilter] = useState<string>('')
    const [histTypeFilter, setHistTypeFilter] = useState<string>('')
    const [histUserFilter, setHistUserFilter] = useState<string>(queryUser)
    const [histUtrFilter, setHistUtrFilter] = useState<string>('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    // Modal States
    const [approveModalItem, setApproveModalItem] = useState<Withdrawal | null>(null)
    const [approvalUtr, setApprovalUtr] = useState<string>('')
    const [isApproving, setIsApproving] = useState<boolean>(false)

    const [rejectModalItem, setRejectModalItem] = useState<Withdrawal | null>(null)
    const [rejectReason, setRejectReason] = useState<string>('Account details mismatch / Bank server failure')
    const [isRejecting, setIsRejecting] = useState<boolean>(false)

    const [selectedDetailWithdrawal, setSelectedDetailWithdrawal] = useState<Withdrawal | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
    const [newUsername, setNewUsername] = useState<string>('')
    const [newSite, setNewSite] = useState<string>('Mastan365')
    const [newAmount, setNewAmount] = useState<string>('')
    const [newAccountName, setNewAccountName] = useState<string>('')
    const [newAccountNo, setNewAccountNo] = useState<string>('')
    const [newIfsc, setNewIfsc] = useState<string>('')
    const [newBankName, setNewBankName] = useState<string>('')
    const [isCreating, setIsCreating] = useState<boolean>(false)

    // Sync tab when URL changes
    useEffect(() => {
        setActiveTab(getInitialTab())
    }, [location.pathname])

    // Fetch withdrawals from FastAPI
    const fetchWithdrawals = async () => {
        setLoadingWithdrawals(true)
        try {
            const data = await apiGetWithdrawals()
            setWithdrawals(data)
        } catch (err: any) {
            console.error('Failed to load withdrawals', err)
            toast.push(
                <Notification title="Data Sync Error" type="danger">
                    Failed to sync withdrawals from server.
                </Notification>
            )
        } finally {
            setLoadingWithdrawals(false)
        }
    }

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    // Copy to clipboard helper
    const handleCopy = (text: string, label: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.push(
            <Notification title="Copied" type="success" duration={2000}>
                {label} copied to clipboard
            </Notification>
        )
    }

    // Approve handler with UTR number
    const handleApproveConfirm = async () => {
        if (!approveModalItem) return
        if (!approvalUtr.trim()) {
            toast.push(
                <Notification title="Missing UTR" type="warning">
                    Please provide the bank transfer UTR number before confirming payout.
                </Notification>
            )
            return
        }

        setIsApproving(true)
        try {
            const updated = await apiApproveWithdrawal(approveModalItem.id, {
                utr_number: approvalUtr.trim(),
            })
            setWithdrawals((prev) =>
                prev.map((w) => (w.id === updated.id ? updated : w))
            )
            toast.push(
                <Notification title="Payout Approved!" type="success">
                    Withdrawal #{updated.withdrawal_id} approved. Client balance and dashboard KPIs updated!
                </Notification>
            )
            setApproveModalItem(null)
            setApprovalUtr('')
        } catch (err: any) {
            toast.push(
                <Notification title="Approval Error" type="danger">
                    {err?.response?.data?.detail || 'Failed to approve withdrawal.'}
                </Notification>
            )
        } finally {
            setIsApproving(false)
        }
    }

    // Reject handler with reason
    const handleRejectConfirm = async () => {
        if (!rejectModalItem) return

        setIsRejecting(true)
        try {
            const updated = await apiRejectWithdrawal(rejectModalItem.id, {
                reason: rejectReason.trim(),
            })
            setWithdrawals((prev) =>
                prev.map((w) => (w.id === updated.id ? updated : w))
            )
            toast.push(
                <Notification title="Withdrawal Rejected" type="info">
                    Withdrawal #{updated.withdrawal_id} has been rejected.
                </Notification>
            )
            setRejectModalItem(null)
        } catch (err: any) {
            toast.push(
                <Notification title="Rejection Error" type="danger">
                    {err?.response?.data?.detail || 'Failed to reject withdrawal.'}
                </Notification>
            )
        } finally {
            setIsRejecting(false)
        }
    }

    // Cancel handler
    const handleCancel = async (item: Withdrawal) => {
        if (!window.confirm(`Are you sure you want to cancel withdrawal #${item.withdrawal_id}?`)) {
            return
        }

        try {
            const updated = await apiCancelWithdrawal(item.id)
            setWithdrawals((prev) =>
                prev.map((w) => (w.id === updated.id ? updated : w))
            )
            toast.push(
                <Notification title="Withdrawal Canceled" type="info">
                    Withdrawal #{updated.withdrawal_id} marked as canceled.
                </Notification>
            )
        } catch (err: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to cancel withdrawal.
                </Notification>
            )
        }
    }

    // Create custom test withdrawal
    const handleCreateWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUsername.trim() || !newAmount.trim() || !newAccountNo.trim()) {
            toast.push(
                <Notification title="Required Fields" type="warning">
                    Please provide username, amount, and account number.
                </Notification>
            )
            return
        }

        const amt = parseFloat(newAmount)
        if (isNaN(amt) || amt <= 0) {
            toast.push(
                <Notification title="Invalid Amount" type="warning">
                    Amount must be greater than 0.
                </Notification>
            )
            return
        }

        setIsCreating(true)
        try {
            const created = await apiCreateWithdrawal({
                username: newUsername.trim(),
                site: newSite,
                amount: amt,
                account_name: newAccountName.trim() || newUsername.trim(),
                account_no: newAccountNo.trim(),
                ifsc_code: newIfsc.trim().toUpperCase() || 'SBIN0001890',
                bank_name: newBankName.trim() || 'State Bank of India',
                type: 'Client',
            })
            setWithdrawals((prev) => [created, ...prev])
            toast.push(
                <Notification title="Withdrawal Created" type="success">
                    Payout request #{created.withdrawal_id} created in Pending queue!
                </Notification>
            )
            setIsCreateModalOpen(false)
            setNewUsername('')
            setNewAmount('')
            setNewAccountName('')
            setNewAccountNo('')
            setNewIfsc('')
            setNewBankName('')
        } catch (err: any) {
            toast.push(
                <Notification title="Request Failed" type="danger">
                    {err?.response?.data?.detail || 'Failed to submit withdrawal request.'}
                </Notification>
            )
        } finally {
            setIsCreating(false)
        }
    }

    // Filtered lists
    const pendingWithdrawals = withdrawals.filter((w) => {
        if (pendingStatusFilter && pendingStatusFilter.toLowerCase() !== 'all') {
            if (w.status.toLowerCase() !== pendingStatusFilter.toLowerCase()) return false
        }
        if (pendingTypeFilter && pendingTypeFilter.toLowerCase() !== 'all') {
            if (w.type.toLowerCase() !== pendingTypeFilter.toLowerCase()) return false
        }
        if (pendingUserFilter.trim()) {
            if (!w.username.toLowerCase().includes(pendingUserFilter.toLowerCase().trim()))
                return false
        }
        return true
    })

    const historyWithdrawals = withdrawals.filter((w) => {
        if (histDomainFilter && histDomainFilter !== 'Select domain' && histDomainFilter !== 'All') {
            const matchDomain = (w.domain || '').toLowerCase().includes(histDomainFilter.toLowerCase())
            const matchSite = (w.site || '').toLowerCase().includes(histDomainFilter.toLowerCase())
            if (!matchDomain && !matchSite) return false
        }
        if (histStatusFilter && histStatusFilter !== 'Select status' && histStatusFilter !== 'All') {
            if (w.status.toLowerCase() !== histStatusFilter.toLowerCase()) return false
        }
        if (histTypeFilter && histTypeFilter !== 'Select type' && histTypeFilter !== 'All') {
            if (w.type.toLowerCase() !== histTypeFilter.toLowerCase()) return false
        }
        if (histUserFilter.trim()) {
            if (!w.username.toLowerCase().includes(histUserFilter.toLowerCase().trim())) return false
        }
        if (histUtrFilter.trim()) {
            if (!(w.utr_number || '').toLowerCase().includes(histUtrFilter.toLowerCase().trim()))
                return false
        }
        return true
    })

    // KPI Calculations
    const totalVolume = withdrawals.reduce((acc, curr) => acc + (curr.amount || 0), 0)
    const approvedVolume = withdrawals
        .filter((w) => w.status === 'Approved')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0)
    const pendingCount = withdrawals.filter((w) => w.status === 'Pending').length
    const pendingVolume = withdrawals
        .filter((w) => w.status === 'Pending')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0)
    const approvedCount = withdrawals.filter((w) => w.status === 'Approved').length
    const rejectedCount = withdrawals.filter((w) => w.status === 'Rejected').length
    const successRate = withdrawals.length > 0 ? Math.round((approvedCount / withdrawals.length) * 100) : 0

    return (
        <div className="space-y-6 pb-12">
            {/* Top Breadcrumb & Luxury Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                        <span>Rolex Financial Suite</span>
                        <span>•</span>
                        <span>Payout Operations</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <MdPayments className="text-emerald-400 text-3xl" />
                        <span>Withdrawal & Banking Settlement</span>
                    </h1>
                    <p className="text-xs text-slate-300 mt-1">
                        Real-time client payout verification, UTR issuance, and multi-bank settlement ledger.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                    >
                        <HiOutlinePlusCircle className="text-lg" />
                        <span>New Withdrawal</span>
                    </button>
                    <button
                        type="button"
                        onClick={fetchWithdrawals}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
                        title="Reload Withdrawals"
                    >
                        <HiRefresh className={`text-lg ${loadingWithdrawals ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Pending Payouts
                        </div>
                        <div className="text-2xl font-black text-amber-500 mt-1 flex items-baseline gap-1">
                            <span>₹{pendingVolume.toLocaleString('en-IN')}</span>
                            <span className="text-xs font-bold text-slate-400">({pendingCount})</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl font-bold">
                        <HiOutlineClock />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Total Settled
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-baseline gap-1">
                            <span>₹{approvedVolume.toLocaleString('en-IN')}</span>
                            <span className="text-xs font-bold text-slate-400">({approvedCount})</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl font-bold">
                        <HiCheckCircle />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Rejected / Blocked
                        </div>
                        <div className="text-2xl font-black text-rose-500 mt-1">
                            {rejectedCount} <span className="text-xs font-normal text-slate-400">requests</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl font-bold">
                        <HiXCircle />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Settlement Rate
                        </div>
                        <div className="text-2xl font-black text-[#008080] dark:text-teal-400 mt-1">
                            {successRate}%
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-[#008080] flex items-center justify-center text-2xl font-bold">
                        <HiLightningBolt />
                    </div>
                </div>
            </div>

            {/* Elevated Tab Navigation Strip */}
            <div className="flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 p-1.5 rounded-xl shadow-sm gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'pending'
                            ? 'bg-[#008080] text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/40'
                    }`}
                >
                    <HiOutlineClock className="text-base" />
                    <span>Pending Withdrawals Queue</span>
                    {pendingCount > 0 && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-900">
                            {pendingCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'history'
                            ? 'bg-[#008080] text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/40'
                    }`}
                >
                    <HiOutlineDocumentText className="text-base" />
                    <span>Withdraw History</span>
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {withdrawals.length}
                    </span>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: PENDING WITHDRAWALS (Screenshot 1) */}
            {/* ========================================================================= */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {/* Filter Card matching Screenshot 1 */}
                    <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Username:
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by client username..."
                                        value={pendingUserFilter}
                                        onChange={(e) => setPendingUserFilter(e.target.value)}
                                        className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    />
                                    <HiSearch className="absolute left-3 top-3 text-slate-400 text-base" />
                                </div>
                            </div>

                            <div className="w-48">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Status:
                                </label>
                                <select
                                    value={pendingStatusFilter}
                                    onChange={(e) => setPendingStatusFilter(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Canceled">Canceled</option>
                                </select>
                            </div>

                            <div className="w-48">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Type:
                                </label>
                                <select
                                    value={pendingTypeFilter}
                                    onChange={(e) => setPendingTypeFilter(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                >
                                    <option value="All">All Types</option>
                                    <option value="Client">Client</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={fetchWithdrawals}
                                className="px-6 py-2.5 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-2 transition"
                            >
                                <HiRefresh className={`text-base ${loadingWithdrawals ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Pending Table */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                                <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="py-3 px-3">NO</th>
                                        <th className="py-3 px-3">ID</th>
                                        <th className="py-3 px-3">SITE</th>
                                        <th className="py-3 px-3">USERNAME</th>
                                        <th className="py-3 px-3 min-w-[240px]">DESTINATION ACCOUNT</th>
                                        <th className="py-3 px-3">AMOUNT</th>
                                        <th className="py-3 px-3">TYPE</th>
                                        <th className="py-3 px-3">STATUS</th>
                                        <th className="py-3 px-3 text-center min-w-[180px]">ACTION</th>
                                        <th className="py-3 px-3">DATE</th>
                                        <th className="py-3 px-3">APPROVED AT</th>
                                        <th className="py-3 px-3">REJECTED AT</th>
                                        <th className="py-3 px-3">CANCELED AT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {pendingWithdrawals.length === 0 ? (
                                        <tr>
                                            <td colSpan={13} className="py-12 text-center text-slate-400 font-semibold">
                                                No Data Available In Table
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingWithdrawals.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                                            >
                                                <td className="py-3.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-mono font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                                                        {item.withdrawal_id}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-teal-600 dark:text-teal-400">
                                                        {item.site}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 font-extrabold text-slate-900 dark:text-white">
                                                    {item.username}
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-1">
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <MdAccountBalance className="text-teal-600" />
                                                            <span>{item.account_name || 'N/A'}</span>
                                                        </div>
                                                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                                            <span>A/C: {item.account_no || '-'}</span>
                                                            {item.account_no && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(item.account_no || '', 'Account No')}
                                                                    className="text-slate-400 hover:text-teal-600 p-0.5"
                                                                    title="Copy A/C No"
                                                                >
                                                                    <HiDuplicate className="text-xs" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-slate-400 flex items-center justify-between">
                                                            <span>IFSC: {item.ifsc_code || '-'}</span>
                                                            {item.ifsc_code && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(item.ifsc_code || '', 'IFSC')}
                                                                    className="text-slate-400 hover:text-teal-600 p-0.5"
                                                                    title="Copy IFSC"
                                                                >
                                                                    <HiDuplicate className="text-xs" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                                        ₹{item.amount.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    {item.status === 'Approved' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                                                            Approved
                                                        </span>
                                                    ) : item.status === 'Rejected' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700">
                                                            Rejected
                                                        </span>
                                                    ) : item.status === 'Canceled' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                            Canceled
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 animate-pulse">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-3 text-center">
                                                    {item.status === 'Pending' ? (
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setApproveModalItem(item)
                                                                    setApprovalUtr('')
                                                                }}
                                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm transition"
                                                                title="Approve and enter transfer UTR"
                                                            >
                                                                <HiCheck className="text-sm" />
                                                                <span>Approve</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectModalItem(item)}
                                                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm transition"
                                                                title="Reject payout request"
                                                            >
                                                                <HiX className="text-sm" />
                                                                <span>Reject</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancel(item)}
                                                                className="p-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-xs transition"
                                                                title="Cancel request"
                                                            >
                                                                <HiBan className="text-sm" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedDetailWithdrawal(item)}
                                                            className="px-3 py-1 bg-[#008080] hover:bg-[#006e6e] text-white rounded text-[11px] font-bold shadow-sm"
                                                        >
                                                            View Details
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-3 text-[11px] text-slate-500">{item.date_str || '-'}</td>
                                                <td className="py-3.5 px-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                    {item.approved_at_str || '-'}
                                                </td>
                                                <td className="py-3.5 px-3 text-[11px] text-rose-500 font-medium">
                                                    {item.rejected_at_str || '-'}
                                                </td>
                                                <td className="py-3.5 px-3 text-[11px] text-slate-400">
                                                    {item.canceled_at_str || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: WITHDRAW HISTORY (Screenshots 2 & 3) */}
            {/* ========================================================================= */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Advanced Search & Filter Bar matching Screenshots 2 & 3 */}
                    <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                    Domain:
                                </label>
                                <select
                                    value={histDomainFilter}
                                    onChange={(e) => setHistDomainFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                >
                                    <option value="Select domain">Select domain</option>
                                    <option value="All">All Domains</option>
                                    <option value="mastan247.com">mastan247.com (MASTAN 247)</option>
                                    <option value="mastan365.com">mastan365.com (MASTAN365)</option>
                                    <option value="mastan99.com">mastan99.com (MASTAN99)</option>
                                    <option value="mastanreddy.com">mastanreddy.com (MASTANREDDY)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                    Status:
                                </label>
                                <select
                                    value={histStatusFilter}
                                    onChange={(e) => setHistStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                >
                                    <option value="Select status">Select status</option>
                                    <option value="All">All Statuses</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                    Type:
                                </label>
                                <select
                                    value={histTypeFilter}
                                    onChange={(e) => setHistTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                >
                                    <option value="Select type">Select type</option>
                                    <option value="All">All Types</option>
                                    <option value="Client">Client</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                    Username:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={histUserFilter}
                                    onChange={(e) => setHistUserFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                    UTR Number:
                                </label>
                                <input
                                    type="text"
                                    placeholder="UTR Number"
                                    value={histUtrFilter}
                                    onChange={(e) => setHistUtrFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Start Date:
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        End Date:
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={fetchWithdrawals}
                                className="px-8 py-2.5 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-2 transition"
                            >
                                <HiSearch className="text-base" />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                                <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="py-3 px-3">NO</th>
                                        <th className="py-3 px-3">ID</th>
                                        <th className="py-3 px-3">SITE</th>
                                        <th className="py-3 px-3">USERNAME</th>
                                        <th className="py-3 px-3">MASTER</th>
                                        <th className="py-3 px-3 min-w-[240px]">ACCOUNT</th>
                                        <th className="py-3 px-3">AMOUNT</th>
                                        <th className="py-3 px-3">TYPE</th>
                                        <th className="py-3 px-3">UTR NUMBER</th>
                                        <th className="py-3 px-3">STATUS</th>
                                        <th className="py-3 px-3 text-center">ACTION</th>
                                        <th className="py-3 px-3">DATE</th>
                                        <th className="py-3 px-3">APPROVED AT</th>
                                        <th className="py-3 px-3">REJECTED AT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {historyWithdrawals.length === 0 ? (
                                        <tr>
                                            <td colSpan={14} className="py-12 text-center text-slate-400 font-semibold">
                                                No Matching Historical Records Found
                                            </td>
                                        </tr>
                                    ) : (
                                        historyWithdrawals.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                                            >
                                                <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                                                <td className="py-3 px-3">
                                                    <span className="font-mono font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                                                        {item.withdrawal_id}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-teal-600 dark:text-teal-400">
                                                        {item.site}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                                                    {item.username}
                                                </td>
                                                <td className="py-3 px-3 font-medium text-slate-500">
                                                    {item.master}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-1">
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                            <span>A/C Name : {item.account_name || 'N/A'}</span>
                                                        </div>
                                                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                                            <span>A/C No : {item.account_no || '-'}</span>
                                                            {item.account_no && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(item.account_no || '', 'Account No')}
                                                                    className="text-slate-400 hover:text-teal-600 p-0.5"
                                                                    title="Copy A/C No"
                                                                >
                                                                    <HiDuplicate className="text-xs" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-slate-400 flex items-center justify-between">
                                                            <span>IFSC Code : {item.ifsc_code || '-'}</span>
                                                            {item.ifsc_code && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(item.ifsc_code || '', 'IFSC')}
                                                                    className="text-slate-400 hover:text-teal-600 p-0.5"
                                                                    title="Copy IFSC"
                                                                >
                                                                    <HiDuplicate className="text-xs" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                                        ₹{item.amount.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {item.utr_number ? (
                                                        <div className="flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px] border border-emerald-200 dark:border-emerald-800">
                                                            <span>{item.utr_number}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(item.utr_number || '', 'UTR Number')}
                                                                className="text-emerald-500 hover:text-emerald-700 p-0.5"
                                                                title="Copy UTR"
                                                            >
                                                                <HiDuplicate className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 font-mono">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3">
                                                    {item.status === 'Approved' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                                                            Approved
                                                        </span>
                                                    ) : item.status === 'Rejected' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700">
                                                            Rejected
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedDetailWithdrawal(item)}
                                                        className="px-2.5 py-1 bg-[#008080] hover:bg-[#006e6e] text-white rounded text-[11px] font-bold shadow-sm"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                                <td className="py-3 px-3 text-[11px] text-slate-500">{item.date_str || '-'}</td>
                                                <td className="py-3 px-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                    {item.approved_at_str || '-'}
                                                </td>
                                                <td className="py-3 px-3 text-[11px] text-rose-500 font-medium">
                                                    {item.rejected_at_str || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* APPROVAL MODAL: Prompt for Transfer UTR */}
            {/* ========================================================================= */}
            <Dialog
                isOpen={Boolean(approveModalItem)}
                onClose={() => setApproveModalItem(null)}
                onRequestClose={() => setApproveModalItem(null)}
                width={520}
            >
                {approveModalItem && (
                    <div className="space-y-5 p-2">
                        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                                <HiCheckCircle />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Approve & Settle Payout
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Withdrawal ID #{approveModalItem.withdrawal_id} • {approveModalItem.username}
                                </p>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Amount to Transfer:</span>
                                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                                    ₹{approveModalItem.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">A/C Holder Name:</span>
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {approveModalItem.account_name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Bank Account Number:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">
                                    {approveModalItem.account_no}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">IFSC Code:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">
                                    {approveModalItem.ifsc_code}
                                </span>
                            </div>
                        </div>

                        {/* UTR Input Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Enter Bank Transfer UTR / Ref Number <span className="text-rose-500">*</span>:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 665428117649"
                                value={approvalUtr}
                                onChange={(e) => setApprovalUtr(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Upon approval, client balance is debited and dashboard total payouts are updated in real-time.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setApproveModalItem(null)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApproveConfirm}
                                disabled={isApproving}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-1.5"
                            >
                                {isApproving ? 'Approving...' : 'Confirm & Complete Payout'}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ========================================================================= */}
            {/* REJECTION MODAL: Select Reason */}
            {/* ========================================================================= */}
            <Dialog
                isOpen={Boolean(rejectModalItem)}
                onClose={() => setRejectModalItem(null)}
                onRequestClose={() => setRejectModalItem(null)}
                width={500}
            >
                {rejectModalItem && (
                    <div className="space-y-4 p-2">
                        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-2xl font-bold">
                                <HiXCircle />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Reject Withdrawal
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Withdrawal ID #{rejectModalItem.withdrawal_id} • Amount: ₹{rejectModalItem.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Rejection Reason:
                            </label>
                            <select
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white mb-2"
                            >
                                <option value="Account details mismatch / Bank server failure">
                                    Account details mismatch / Bank server failure
                                </option>
                                <option value="Incorrect IFSC Code or Branch details">
                                    Incorrect IFSC Code or Branch details
                                </option>
                                <option value="Daily withdrawal volume limit exceeded">
                                    Daily withdrawal volume limit exceeded
                                </option>
                                <option value="Account verification pending">
                                    Account verification pending
                                </option>
                                <option value="Client requested cancellation">
                                    Client requested cancellation
                                </option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setRejectModalItem(null)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg uppercase tracking-wider"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectConfirm}
                                disabled={isRejecting}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow"
                            >
                                {isRejecting ? 'Rejecting...' : 'Reject Withdrawal'}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ========================================================================= */}
            {/* DETAIL MODAL: Detailed Payout Card */}
            {/* ========================================================================= */}
            <Dialog
                isOpen={Boolean(selectedDetailWithdrawal)}
                onClose={() => setSelectedDetailWithdrawal(null)}
                onRequestClose={() => setSelectedDetailWithdrawal(null)}
                width={540}
            >
                {selectedDetailWithdrawal && (
                    <div className="space-y-4 p-2">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                            <div className="flex items-center gap-2">
                                <MdPayments className="text-2xl text-[#008080]" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Settlement Voucher #{selectedDetailWithdrawal.withdrawal_id}
                                </h3>
                            </div>
                            <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                    selectedDetailWithdrawal.status === 'Approved'
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                        : 'bg-rose-100 text-rose-700 border border-rose-300'
                                }`}
                            >
                                {selectedDetailWithdrawal.status}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">Player Username:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedDetailWithdrawal.username}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">Site / Portal:</span>
                                <span className="font-bold text-teal-600">{selectedDetailWithdrawal.site}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">Disbursed Amount:</span>
                                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                                    ₹{selectedDetailWithdrawal.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">A/C Holder Name:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedDetailWithdrawal.account_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">Account Number:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedDetailWithdrawal.account_no}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">Bank IFSC Code:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedDetailWithdrawal.ifsc_code}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">Bank Transfer UTR:</span>
                                <span className="font-mono font-bold text-emerald-600">
                                    {selectedDetailWithdrawal.utr_number || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                <span className="text-slate-500">Requested Date:</span>
                                <span className="text-slate-700 dark:text-slate-300">{selectedDetailWithdrawal.date_str || '-'}</span>
                            </div>
                            {selectedDetailWithdrawal.approved_at_str && (
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                    <span className="text-slate-500">Approved Timestamp:</span>
                                    <span className="text-emerald-600 font-medium">{selectedDetailWithdrawal.approved_at_str}</span>
                                </div>
                            )}
                            {selectedDetailWithdrawal.rejected_at_str && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Rejected Timestamp:</span>
                                    <span className="text-rose-500 font-medium">{selectedDetailWithdrawal.rejected_at_str}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setSelectedDetailWithdrawal(null)}
                                className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                            >
                                Close Voucher
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ========================================================================= */}
            {/* NEW WITHDRAWAL REQUEST MODAL */}
            {/* ========================================================================= */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onRequestClose={() => setIsCreateModalOpen(false)}
                width={560}
            >
                <form onSubmit={handleCreateWithdrawal} className="space-y-4 p-2">
                    <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-2xl font-bold">
                            <HiOutlinePlusCircle />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Create New Client Withdrawal
                            </h3>
                            <p className="text-xs text-slate-500">
                                Submit a new payout request for testing settlement workflow.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Client Username <span className="text-rose-500">*</span>:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. KAASH26"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Portal / Site:
                            </label>
                            <select
                                value={newSite}
                                onChange={(e) => setNewSite(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                            >
                                <option value="Mastan 247">Mastan 247</option>
                                <option value="Mastan365">Mastan365</option>
                                <option value="Mastan99">Mastan99</option>
                                <option value="Mastanredd">Mastanredd</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                            Withdrawal Amount (₹) <span className="text-rose-500">*</span>:
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 5000"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Account Holder Name:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Kashyap J"
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Bank Name:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. State Bank of India"
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                Account Number <span className="text-rose-500">*</span>:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 020100050306026"
                                value={newAccountNo}
                                onChange={(e) => setNewAccountNo(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                IFSC Code:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. SBIN0001890"
                                value={newIfsc}
                                onChange={(e) => setNewIfsc(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono uppercase text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-1.5"
                        >
                            {isCreating ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </Dialog>
        </div>
    )
}

export default WithdrawView
