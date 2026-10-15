import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import {
    apiGetDeposits,
    apiCreateDeposit,
    apiApproveDeposit,
    apiRejectDeposit,
    apiGetUTRs,
    apiCreateUTR,
    apiRemoveUTR,
} from '@/services/DepositsService'
import { apiGetActiveAccounts } from '@/services/BankAccountsService'
import type { Deposit, UTREntry } from '@/@types/deposit'
import type { BankAccount } from '@/@types/account'
import {
    HiSearch,
    HiRefresh,
    HiCheck,
    HiX,
    HiTrash,
    HiOutlineDocumentText,
    HiCreditCard,
    HiCash,
    HiOutlinePhotograph,
    HiOutlineClock,
    HiCheckCircle,
    HiXCircle,
    HiLightningBolt,
    HiFilter,
} from 'react-icons/hi'
import { MdAccountBalance, MdCheckCircle, MdCancel, MdReceiptLong } from 'react-icons/md'

type TabType = 'pending' | 'history' | 'utr-entry' | 'utr-pending' | 'utr-removed'

const DepositView = () => {
    const location = useLocation()
    const navigate = useNavigate()

    // Determine initial active tab based on route pathname
    const getInitialTab = (): TabType => {
        const path = location.pathname.toLowerCase()
        if (path.includes('history')) return 'history'
        if (path.includes('utr-entry') || path.includes('entry')) return 'utr-entry'
        if (path.includes('utr-pending') || path.includes('pending')) return 'utr-pending'
        if (path.includes('utr-removed') || path.includes('removed')) return 'utr-removed'
        return 'pending'
    }

    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab())

    // Deposits state
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [loadingDeposits, setLoadingDeposits] = useState<boolean>(true)

    // Active Bank/UPI Accounts for dropdown
    const [accounts, setAccounts] = useState<BankAccount[]>([])

    // Quick UTR Box state (Screenshot 1 top row)
    const [quickUtr, setQuickUtr] = useState<string>('')
    const [quickAccount, setQuickAccount] = useState<string>('')
    const [quickAmount, setQuickAmount] = useState<string>('')
    const [isSubmittingQuick, setIsSubmittingQuick] = useState<boolean>(false)

    const queryUser = new URLSearchParams(location.search).get('user') || new URLSearchParams(location.search).get('username') || ''

    // Filter state for Pending Deposits (Screenshot 1 row 2)
    const [pendingUtrFilter, setPendingUtrFilter] = useState<string>('')
    const [pendingUserFilter, setPendingUserFilter] = useState<string>(queryUser)
    const [pendingAccountFilter, setPendingAccountFilter] = useState<string>('')
    const [pendingStatusFilter, setPendingStatusFilter] = useState<string>('Pending')
    const [pendingTypeFilter, setPendingTypeFilter] = useState<string>('Client')

    // Filter state for Deposit History (Screenshot 2)
    const [histDomainFilter, setHistDomainFilter] = useState<string>('')
    const [histStatusFilter, setHistStatusFilter] = useState<string>('')
    const [histTypeFilter, setHistTypeFilter] = useState<string>('')
    const [histUserFilter, setHistUserFilter] = useState<string>(queryUser)
    const [histUtrFilter, setHistUtrFilter] = useState<string>('')
    const [histStartDate, setHistStartDate] = useState<string>('')
    const [histEndDate, setHistEndDate] = useState<string>('')

    // UTR Entries State (Screenshots 3, 4, 5)
    const [utrs, setUtrs] = useState<UTREntry[]>([])
    const [loadingUtrs, setLoadingUtrs] = useState<boolean>(false)
    const [newUtrNumber, setNewUtrNumber] = useState<string>('')
    const [newUtrAccount, setNewUtrAccount] = useState<string>('')
    const [newUtrAmount, setNewUtrAmount] = useState<string>('')
    const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false)

    // Removed UTR filter (Screenshot 5)
    const [removedUtrSearch, setRemovedUtrSearch] = useState<string>('')

    // Proof Modal State
    const [selectedProofDeposit, setSelectedProofDeposit] = useState<Deposit | null>(null)

    // Load active bank accounts for select boxes
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const accs = await apiGetActiveAccounts()
                setAccounts(accs)
                if (accs.length > 0) {
                    setQuickAccount(accs[0].name + ' : ' + accs[0].account_number)
                    setNewUtrAccount(accs[0].name + ' : ' + accs[0].account_number)
                }
            } catch (e) {
                // Ignore
            }
        }
        loadAccounts()
    }, [])

    // Load deposits based on active tab
    const fetchDepositsList = async (statusParam?: string) => {
        setLoadingDeposits(true)
        try {
            const data = await apiGetDeposits({
                status: statusParam,
                username: activeTab === 'pending' ? pendingUserFilter : histUserFilter || undefined,
                utr_number: activeTab === 'pending' ? pendingUtrFilter : histUtrFilter || undefined,
                domain: activeTab === 'history' ? histDomainFilter || undefined : undefined,
                type: activeTab === 'pending' ? (pendingTypeFilter !== 'All' ? pendingTypeFilter : undefined) : histTypeFilter || undefined,
            })
            setDeposits(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch deposits
                </Notification>
            )
        } finally {
            setLoadingDeposits(false)
        }
    }

    // Load UTRs
    const fetchUtrsList = async (status: string, search?: string) => {
        setLoadingUtrs(true)
        try {
            const data = await apiGetUTRs({
                status: status,
                utr_number: search || undefined,
            })
            setUtrs(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to load UTR list
                </Notification>
            )
        } finally {
            setLoadingUtrs(false)
        }
    }

    // Effect on tab change
    useEffect(() => {
        if (activeTab === 'pending') {
            fetchDepositsList('Pending')
        } else if (activeTab === 'history') {
            fetchDepositsList(histStatusFilter || undefined)
        } else if (activeTab === 'utr-pending') {
            fetchUtrsList('PENDING')
        } else if (activeTab === 'utr-removed') {
            fetchUtrsList('REMOVED', removedUtrSearch)
        }
    }, [activeTab])

    // Quick UTR Submit (Screenshot 1 top row)
    const handleQuickSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!quickUtr.trim() || !quickAmount.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    UTR Number and Amount are required.
                </Notification>
            )
            return
        }

        setIsSubmittingQuick(true)
        try {
            await apiCreateUTR({
                utr_number: quickUtr.trim(),
                account_name: quickAccount || 'Default Gateway',
                amount: parseFloat(quickAmount) || 0,
            })

            toast.push(
                <Notification type="success" title="UTR Verified & Logged">
                    UTR <strong>{quickUtr.trim()}</strong> for ₹{quickAmount} recorded successfully!
                </Notification>
            )

            setQuickUtr('')
            setQuickAmount('')
            fetchDepositsList('Pending')
        } catch (err: any) {
            toast.push(
                <Notification type="danger" title="Submission Failed">
                    {err?.response?.data?.detail || 'Failed to submit UTR'}
                </Notification>
            )
        } finally {
            setIsSubmittingQuick(false)
        }
    }

    // Approve Deposit
    const handleApprove = async (dep: Deposit) => {
        try {
            const updated = await apiApproveDeposit(dep.id)
            setDeposits((prev) => prev.map((d) => (d.id === dep.id ? updated : d)))
            toast.push(
                <Notification type="success" title="Deposit Approved">
                    ₹{dep.amount.toLocaleString()} credited to <strong>{dep.username}</strong>!
                </Notification>
            )
            // If in pending tab, remove from view
            if (activeTab === 'pending') {
                setDeposits((prev) => prev.filter((d) => d.id !== dep.id))
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Approval Failed">
                    Could not approve deposit.
                </Notification>
            )
        }
    }

    // Reject Deposit
    const handleReject = async (dep: Deposit) => {
        try {
            const updated = await apiRejectDeposit(dep.id)
            setDeposits((prev) => prev.map((d) => (d.id === dep.id ? updated : d)))
            toast.push(
                <Notification type="warning" title="Deposit Rejected">
                    Deposit #{dep.deposit_id} of ₹{dep.amount.toLocaleString()} marked Rejected.
                </Notification>
            )
            if (activeTab === 'pending') {
                setDeposits((prev) => prev.filter((d) => d.id !== dep.id))
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Rejection Failed">
                    Could not reject deposit.
                </Notification>
            )
        }
    }

    // Submit UTR Entry Form (Screenshot 3)
    const handleUtrEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUtrNumber.trim() || !newUtrAmount.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    UTR Number and Amount are required
                </Notification>
            )
            return
        }

        setIsSubmittingUtr(true)
        try {
            await apiCreateUTR({
                utr_number: newUtrNumber.trim(),
                account_name: newUtrAccount || 'Standard Bank Gateway',
                amount: parseFloat(newUtrAmount) || 0,
            })

            toast.push(
                <Notification type="success" title="UTR Logged">
                    UTR Entry #{newUtrNumber.trim()} added to pending queue!
                </Notification>
            )

            setNewUtrNumber('')
            setNewUtrAmount('')
            setActiveTab('utr-pending')
        } catch (err: any) {
            toast.push(
                <Notification type="danger" title="Error">
                    {err?.response?.data?.detail || 'Failed to add UTR'}
                </Notification>
            )
        } finally {
            setIsSubmittingUtr(false)
        }
    }

    // Delete / Remove Pending UTR (Screenshot 4 Trash icon)
    const handleRemoveUtr = async (utrId: number) => {
        try {
            await apiRemoveUTR(utrId)
            setUtrs((prev) => prev.filter((u) => u.id !== utrId))
            toast.push(
                <Notification type="success" title="UTR Removed">
                    Entry moved to Removed UTR list.
                </Notification>
            )
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to remove UTR
                </Notification>
            )
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-16">
            {/* Top Modern Header */}
            <div className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-6 bg-teal-600 rounded-full inline-block"></span>
                            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight uppercase">
                                DEPOSIT & UTR MANAGEMENT
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 pl-4.5 font-medium">
                            Real-time bank deposits, client transaction verification, and automated UTR reconciliations
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1.5 mr-2">
                            <Link to="/home" className="hover:text-teal-700 transition-colors">
                                Home
                            </Link>
                            <span>/</span>
                            <span className="text-slate-700 font-semibold">
                                {activeTab === 'history'
                                    ? 'Deposit History'
                                    : activeTab === 'utr-entry'
                                    ? 'UTR Entry'
                                    : activeTab === 'utr-pending'
                                    ? 'UTR Pending'
                                    : activeTab === 'utr-removed'
                                    ? 'Removed UTRs'
                                    : 'Deposit List'}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (activeTab === 'pending' || activeTab === 'history') {
                                    fetchDepositsList(activeTab === 'pending' ? 'Pending' : undefined)
                                } else {
                                    fetchUtrsList(activeTab === 'utr-pending' ? 'PENDING' : 'REMOVED')
                                }
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-sm transition-all"
                            title="Refresh records"
                        >
                            <HiRefresh className="text-base" />
                        </button>
                    </div>
                </div>

                {/* Sub-Navigation Tabs Strip */}
                <div className="flex items-center gap-2 overflow-x-auto mt-4 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'pending'
                                ? 'bg-teal-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        <HiCreditCard className="text-sm" />
                        <span>Pending Deposits</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'history'
                                ? 'bg-teal-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        <MdReceiptLong className="text-sm" />
                        <span>Deposit History</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('utr-entry')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'utr-entry'
                                ? 'bg-teal-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        <HiLightningBolt className="text-sm" />
                        <span>UTR Entry</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('utr-pending')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'utr-pending'
                                ? 'bg-teal-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        <HiOutlineClock className="text-sm" />
                        <span>UTR Pending List</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('utr-removed')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'utr-removed'
                                ? 'bg-teal-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        <HiTrash className="text-sm" />
                        <span>Removed UTR List</span>
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-5">
                {/* -------------------- TAB 1: PENDING DEPOSITS & QUICK UTR (SCREENSHOT 1) -------------------- */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {/* Quick UTR Box (Screenshot 1 Row 1) */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs">
                            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-2.5">
                                Instant UTR Verification Entry:
                            </span>
                            <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-4">
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        UTR Number:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter UTR number"
                                        value={quickUtr}
                                        onChange={(e) => setQuickUtr(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                                    />
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Account:
                                    </label>
                                    <select
                                        value={quickAccount}
                                        onChange={(e) => setQuickAccount(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                                    >
                                        <option value="">Select account</option>
                                        {accounts.map((a) => (
                                            <option key={a.id} value={`${a.name} : ${a.account_number}`}>
                                                {a.name} ({a.type} - {a.account_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Amount:
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="₹ Amount"
                                        value={quickAmount}
                                        onChange={(e) => setQuickAmount(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmittingQuick}
                                        className="w-full bg-[#008080] hover:bg-[#006e6e] active:scale-98 text-white font-bold text-xs py-2 px-4 rounded-lg uppercase tracking-wider transition-all shadow-xs disabled:opacity-70"
                                    >
                                        {isSubmittingQuick ? 'SUBMITTING...' : 'SUBMIT'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Search Filter Bar (Screenshot 1 Row 2) */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    fetchDepositsList(pendingStatusFilter !== 'All' ? pendingStatusFilter : undefined)
                                }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
                            >
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        UTR Number:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Filter by UTR"
                                        value={pendingUtrFilter}
                                        onChange={(e) => setPendingUtrFilter(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Username:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Filter by username"
                                        value={pendingUserFilter}
                                        onChange={(e) => setPendingUserFilter(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Account:
                                    </label>
                                    <select
                                        value={pendingAccountFilter}
                                        onChange={(e) => setPendingAccountFilter(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                    >
                                        <option value="">Select account</option>
                                        {accounts.map((a) => (
                                            <option key={a.id} value={a.name}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Status:
                                    </label>
                                    <select
                                        value={pendingStatusFilter}
                                        onChange={(e) => setPendingStatusFilter(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="All">All</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Type:
                                    </label>
                                    <select
                                        value={pendingTypeFilter}
                                        onChange={(e) => setPendingTypeFilter(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                    >
                                        <option value="Client">Client</option>
                                        <option value="Manual">Manual</option>
                                        <option value="All">All</option>
                                    </select>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#008080] hover:bg-[#006e6e] text-white font-bold text-xs py-2 px-4 rounded-lg uppercase tracking-wider transition-all shadow-xs"
                                    >
                                        REFRESH
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Pending Table */}
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                            <th className="py-3 px-3 w-10 text-center">NO ▲</th>
                                            <th className="py-3 px-3">ID</th>
                                            <th className="py-3 px-3">SITE</th>
                                            <th className="py-3 px-3">USERNAME</th>
                                            <th className="py-3 px-3">ACCOUNT</th>
                                            <th className="py-3 px-3 text-right">AMOUNT</th>
                                            <th className="py-3 px-3">UTR NUMBER</th>
                                            <th className="py-3 px-3 text-center">TYPE</th>
                                            <th className="py-3 px-3 text-center">STATUS</th>
                                            <th className="py-3 px-3 text-center">ACTION</th>
                                            <th className="py-3 px-3">DATE</th>
                                            <th className="py-3 px-3">APPROVED AT</th>
                                            <th className="py-3 px-3">REJECTED AT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {loadingDeposits ? (
                                            <tr>
                                                <td colSpan={13} className="py-10 text-center text-slate-500 font-medium">
                                                    Loading pending deposits...
                                                </td>
                                            </tr>
                                        ) : deposits.length === 0 ? (
                                            <tr>
                                                <td colSpan={13} className="py-12 text-center text-slate-500 font-medium">
                                                    No Data Available In Table
                                                </td>
                                            </tr>
                                        ) : (
                                            deposits.map((dep, index) => (
                                                <tr key={dep.id || index} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                                                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{dep.deposit_id}</td>
                                                    <td className="py-2.5 px-3 font-semibold text-teal-800">{dep.site}</td>
                                                    <td className="py-2.5 px-3 font-bold text-slate-900">{dep.username}</td>
                                                    <td className="py-2.5 px-3 text-slate-600">{dep.account_name || 'BharatPe UPI'}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">₹{dep.amount.toLocaleString()}</td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-800 font-medium">{dep.utr_number}</td>
                                                    <td className="py-2.5 px-3 text-center">{dep.type}</td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                            {dep.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(dep)}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded transition-colors"
                                                                title="Approve & Credit Client"
                                                            >
                                                                <HiCheck className="text-sm" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReject(dep)}
                                                                className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded transition-colors"
                                                                title="Reject Deposit"
                                                            >
                                                                <HiX className="text-sm" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{dep.date_str || '—'}</td>
                                                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{dep.approved_at_str || '—'}</td>
                                                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{dep.rejected_at_str || '—'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* -------------------- TAB 2: DEPOSIT HISTORY (SCREENSHOT 2) -------------------- */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {/* Search Filters Card (Screenshot 2) */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    fetchDepositsList(histStatusFilter || undefined)
                                }}
                                className="space-y-3"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Domain:
                                        </label>
                                        <select
                                            value={histDomainFilter}
                                            onChange={(e) => setHistDomainFilter(e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                        >
                                            <option value="">Select domain</option>
                                            <option value="Mastan99">Mastan99</option>
                                            <option value="Mastan365">Mastan365</option>
                                            <option value="Mastanredd">Mastanredd</option>
                                            <option value="Mastan247">Mastan247</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Status:
                                        </label>
                                        <select
                                            value={histStatusFilter}
                                            onChange={(e) => setHistStatusFilter(e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                        >
                                            <option value="">Select status</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Type:
                                        </label>
                                        <select
                                            value={histTypeFilter}
                                            onChange={(e) => setHistTypeFilter(e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                        >
                                            <option value="">Select type</option>
                                            <option value="Client">Client</option>
                                            <option value="Manual">Manual</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Username:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter username"
                                            value={histUserFilter}
                                            onChange={(e) => setHistUserFilter(e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            UTR Number:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter UTR number"
                                            value={histUtrFilter}
                                            onChange={(e) => setHistUtrFilter(e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Start Date:
                                        </label>
                                        <input
                                            type="date"
                                            value={histStartDate}
                                            onChange={(e) => setHistStartDate(e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            End Date:
                                        </label>
                                        <input
                                            type="date"
                                            value={histEndDate}
                                            onChange={(e) => setHistEndDate(e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                        />
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className="w-full bg-[#008080] hover:bg-[#006e6e] text-white font-bold text-xs py-2 px-4 rounded-lg uppercase tracking-wider transition-all shadow-xs"
                                        >
                                            SEARCH
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Deposit History Table (Screenshot 2) */}
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                            <th className="py-2.5 px-3 w-10 text-center">NO ▲</th>
                                            <th className="py-2.5 px-3">ID</th>
                                            <th className="py-2.5 px-3">SITE</th>
                                            <th className="py-2.5 px-3">USERNAME</th>
                                            <th className="py-2.5 px-3">MASTER</th>
                                            <th className="py-2.5 px-3">ADDED BY</th>
                                            <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                            <th className="py-2.5 px-3 text-center">TYPE</th>
                                            <th className="py-2.5 px-3">UTR NUMBER</th>
                                            <th className="py-2.5 px-3 text-center">STATUS</th>
                                            <th className="py-2.5 px-3 text-center">ACTION</th>
                                            <th className="py-2.5 px-3">DATE</th>
                                            <th className="py-2.5 px-3">APPROVED AT</th>
                                            <th className="py-2.5 px-3">REJECTED AT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {loadingDeposits ? (
                                            <tr>
                                                <td colSpan={14} className="py-12 text-center text-slate-500 font-medium">
                                                    Loading deposit records...
                                                </td>
                                            </tr>
                                        ) : deposits.length === 0 ? (
                                            <tr>
                                                <td colSpan={14} className="py-12 text-center text-slate-500 font-medium">
                                                    No Data Available In Table
                                                </td>
                                            </tr>
                                        ) : (
                                            deposits.map((dep, index) => (
                                                <tr key={dep.id || index} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">{dep.deposit_id}</td>
                                                    <td className="py-2.5 px-3 font-semibold text-slate-800">{dep.site}</td>
                                                    <td className="py-2.5 px-3 font-bold text-slate-900">{dep.username}</td>
                                                    <td className="py-2.5 px-3 text-slate-600">{dep.master}</td>
                                                    <td className="py-2.5 px-3 text-slate-600">{dep.added_by}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                                        ₹{dep.amount.toLocaleString()}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-medium text-slate-600">{dep.type}</td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-800">{dep.utr_number}</td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                dep.status === 'Approved'
                                                                    ? 'bg-[#28a745] text-white'
                                                                    : 'bg-[#dc3545] text-white'
                                                            }`}
                                                        >
                                                            {dep.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        {/* Blue Proof Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedProofDeposit(dep)}
                                                            className="bg-[#17a2b8] hover:bg-[#138496] active:scale-95 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center gap-1 shadow-2xs mx-auto"
                                                        >
                                                            <HiOutlinePhotograph className="text-xs" />
                                                            <span>Proof</span>
                                                        </button>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{dep.date_str || '—'}</td>
                                                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{dep.approved_at_str || '-'}</td>
                                                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{dep.rejected_at_str || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* -------------------- TAB 3: UTR ENTRY FORM (SCREENSHOT 3) -------------------- */}
                {activeTab === 'utr-entry' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 px-6 py-4 text-white">
                                <h2 className="font-bold text-sm md:text-base tracking-wide uppercase flex items-center gap-2">
                                    <HiLightningBolt className="text-teal-300 text-lg" />
                                    <span>UTR Entry</span>
                                </h2>
                                <span className="text-xs text-teal-200/90 block mt-0.5">
                                    Pre-register banking payment transaction receipts for instant client matching
                                </span>
                            </div>

                            <form onSubmit={handleUtrEntrySubmit} className="p-6 md:p-8 space-y-5 bg-[#f9fafb]">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        UTR Number: *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter UTR Number"
                                        value={newUtrNumber}
                                        onChange={(e) => setNewUtrNumber(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Account: *
                                        </label>
                                        <select
                                            value={newUtrAccount}
                                            onChange={(e) => setNewUtrAccount(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                        >
                                            {accounts.map((a) => (
                                                <option key={a.id} value={`${a.name} : ${a.account_number}`}>
                                                    {a.name} : {a.account_number}
                                                </option>
                                            ))}
                                            {accounts.length === 0 && (
                                                <option value="ANSARI MOHMMADSAHID : BHARATPE2N0T0W8J0Y32706@Unitype">
                                                    ANSARI MOHMMADSAHID : BHARATPE2N0T0W8J0Y32706@Unitype
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Amount (₹): *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            step="50"
                                            placeholder="Enter Amount"
                                            value={newUtrAmount}
                                            onChange={(e) => setNewUtrAmount(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                        />
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmittingUtr}
                                        className="bg-[#008080] hover:bg-[#006e6e] text-white font-bold text-xs px-8 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md disabled:opacity-70"
                                    >
                                        {isSubmittingUtr ? 'Adding...' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* -------------------- TAB 4: UTR PENDING LIST (SCREENSHOT 4) -------------------- */}
                {activeTab === 'utr-pending' && (
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                                UTR PENDING LIST
                            </h3>
                            <button
                                type="button"
                                onClick={() => setActiveTab('utr-entry')}
                                className="bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider"
                            >
                                + Add UTR
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                        <th className="py-2.5 px-3 w-10 text-center">NO ▲</th>
                                        <th className="py-2.5 px-3">ID</th>
                                        <th className="py-2.5 px-3">MASTER</th>
                                        <th className="py-2.5 px-3">ADDED BY</th>
                                        <th className="py-2.5 px-3">ACCOUNT</th>
                                        <th className="py-2.5 px-3">UTR NUMBER</th>
                                        <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                        <th className="py-2.5 px-3 text-center">STATUS</th>
                                        <th className="py-2.5 px-3">DATE</th>
                                        <th className="py-2.5 px-3 text-center">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {loadingUtrs ? (
                                        <tr>
                                            <td colSpan={10} className="py-10 text-center text-slate-500 font-medium">
                                                Loading pending UTRs...
                                            </td>
                                        </tr>
                                    ) : utrs.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                                                No Pending UTRs Found
                                            </td>
                                        </tr>
                                    ) : (
                                        utrs.map((utr, index) => (
                                            <tr key={utr.id || index} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                                                <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{utr.utr_id}</td>
                                                <td className="py-2.5 px-3 font-semibold text-slate-800">{utr.master}</td>
                                                <td className="py-2.5 px-3 text-slate-600">{utr.added_by}</td>
                                                <td className="py-2.5 px-3 font-medium text-slate-800">{utr.account_name}</td>
                                                <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">{utr.utr_number}</td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{utr.amount.toFixed(2)}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="bg-[#ffc107] text-slate-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {utr.status}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{utr.date_str || '—'}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {/* Red Trash Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveUtr(utr.id)}
                                                        className="bg-[#dc3545] hover:bg-[#c82333] active:scale-95 text-white p-1.5 rounded transition-all shadow-2xs"
                                                        title="Remove UTR from Pending"
                                                    >
                                                        <HiTrash className="text-xs" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* -------------------- TAB 5: REMOVED UTR LIST (SCREENSHOT 5) -------------------- */}
                {activeTab === 'utr-removed' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    fetchUtrsList('REMOVED', removedUtrSearch)
                                }}
                                className="flex flex-col sm:flex-row items-end gap-3 max-w-lg"
                            >
                                <div className="flex-1 w-full">
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        UTR Number:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="UTR Number"
                                        value={removedUtrSearch}
                                        onChange={(e) => setRemovedUtrSearch(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#008080] hover:bg-[#006e6e] text-white font-bold text-xs py-2 px-6 rounded-lg uppercase tracking-wider transition-all"
                                >
                                    SEARCH
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                            <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                            <th className="py-2.5 px-3">ID</th>
                                            <th className="py-2.5 px-3">REMOVED BY</th>
                                            <th className="py-2.5 px-3">MASTER</th>
                                            <th className="py-2.5 px-3">UTR NUMBER</th>
                                            <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                            <th className="py-2.5 px-3">DATE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {utrs.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                                                    No Data Found
                                                </td>
                                            </tr>
                                        ) : (
                                            utrs.map((u, index) => (
                                                <tr key={u.id || index} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>
                                                    <td className="py-2.5 px-3 font-mono font-semibold">{u.utr_id}</td>
                                                    <td className="py-2.5 px-3 font-semibold text-rose-700">{u.removed_by || 'MASTAN99M'}</td>
                                                    <td className="py-2.5 px-3 text-slate-600">{u.master}</td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-800">{u.utr_number}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold">₹{u.amount.toFixed(2)}</td>
                                                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{u.date_str || '—'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Proof Receipt Modal */}
            <Dialog
                isOpen={!!selectedProofDeposit}
                onClose={() => setSelectedProofDeposit(null)}
                onRequestClose={() => setSelectedProofDeposit(null)}
                width={480}
            >
                {selectedProofDeposit && (
                    <div className="p-5 text-center">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                            <h3 className="text-base font-bold text-slate-800 uppercase flex items-center gap-2">
                                <HiOutlinePhotograph className="text-teal-600 text-lg" />
                                <span>Deposit Payment Proof</span>
                            </h3>
                        </div>

                        {/* Transaction Receipt Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mb-4 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Deposit ID:</span>
                                <span className="font-mono font-bold text-slate-800">#{selectedProofDeposit.deposit_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Client:</span>
                                <span className="font-bold text-teal-800">{selectedProofDeposit.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Amount:</span>
                                <span className="font-extrabold text-emerald-700 text-sm">₹{selectedProofDeposit.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">UTR / Ref:</span>
                                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{selectedProofDeposit.utr_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Status:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedProofDeposit.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {selectedProofDeposit.status}
                                </span>
                            </div>
                        </div>

                        {/* Payment Slip Simulation / Display */}
                        <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-2xs mb-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl mb-2">
                                <HiCheckCircle />
                            </div>
                            <span className="font-black text-slate-800 text-base block">UPI Transfer Successful</span>
                            <span className="text-xs text-slate-400 block mt-1">Ref ID: {selectedProofDeposit.utr_number}</span>
                            <span className="text-lg font-bold text-slate-900 block mt-2">₹{selectedProofDeposit.amount.toLocaleString()}.00</span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setSelectedProofDeposit(null)}
                                className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                            >
                                Close Proof
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default DepositView
