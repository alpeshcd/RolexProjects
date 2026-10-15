import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import { apiGetUsers } from '@/services/AuthService'
import { apiGetPortals } from '@/services/GlobalSearchService'
import type { User } from '@/@types/auth'
import type { DomainPortal } from '@/@types/globalSearch'
import {
    HiSearch,
    HiRefresh,
    HiUserAdd,
    HiDocumentReport,
    HiCreditCard,
    HiCash,
    HiFilter,
    HiUsers,
    HiCheckCircle,
    HiOutlineClock,
    HiCalendar,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi'
import { MdAccountBalanceWallet } from 'react-icons/md'

const ClientsView = () => {
    const navigate = useNavigate()

    // Data state
    const [clients, setClients] = useState<User[]>([])
    const [portals, setPortals] = useState<DomainPortal[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Filter bar state
    const [selectedDomain, setSelectedDomain] = useState<string>('')
    const [usernameFilter, setUsernameFilter] = useState<string>('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [selectedSource, setSelectedSource] = useState<string>('')
    const [depositCountFilter, setDepositCountFilter] = useState<string>('')

    // Action Modals State
    const [actionModalType, setActionModalType] = useState<'statement' | 'deposit' | 'withdraw' | null>(null)
    const [activeClient, setActiveClient] = useState<User | null>(null)

    // Load clients with current filter values
    const fetchClients = async (overrideParams?: Record<string, any>) => {
        setLoading(true)
        try {
            const params: Record<string, any> = overrideParams || {
                domain: selectedDomain || undefined,
                username: usernameFilter.trim() || undefined,
                source: selectedSource || undefined,
                deposit_count: depositCountFilter ? parseInt(depositCountFilter, 10) : undefined,
            }
            const data = await apiGetUsers(params)
            setClients(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch dynamic clients list
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    // Load initial portals for domain dropdown
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const portalData = await apiGetPortals()
                setPortals(portalData)
            } catch (e) {
                // Ignore
            }
            fetchClients()
        }
        loadInitialData()
    }, [])

    // Search filter submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchClients()
    }

    // Reset filters
    const handleReset = () => {
        setSelectedDomain('')
        setUsernameFilter('')
        setStartDate('')
        setEndDate('')
        setSelectedSource('')
        setDepositCountFilter('')
        fetchClients({})
    }

    // Open Action Modal
    const handleOpenAction = (type: 'statement' | 'deposit' | 'withdraw', client: User) => {
        setActiveClient(client)
        setActionModalType(type)
    }

    // Compute KPI metrics for summary badges
    const totalClientsCount = clients.length
    const activeClientsCount = clients.filter((c) => c.is_active !== false).length
    const totalBalanceSum = clients.reduce((acc, c) => acc + (c.balance || 0), 0)
    const signupClientsCount = clients.filter((c) => c.source?.toLowerCase() === 'signup').length

    // Helper for site badge color
    const getSiteBadgeStyle = (site?: string | null) => {
        const s = (site || '').toLowerCase()
        if (s.includes('365')) {
            return 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }
        if (s.includes('99')) {
            return 'bg-amber-50 text-amber-800 border-amber-200'
        }
        if (s.includes('247')) {
            return 'bg-rose-50 text-rose-800 border-rose-200'
        }
        return 'bg-teal-50 text-teal-800 border-teal-200'
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-16">
            {/* Top Modern Header / Action Bar */}
            <div className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-6 bg-teal-600 rounded-full inline-block"></span>
                            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight uppercase">
                                CLIENT DIRECTORY
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 pl-4.5 font-medium">
                            Real-time exchange accounts, player master mapping, and transaction history
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Breadcrumbs */}
                        <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1.5 mr-2">
                            <Link to="/home" className="hover:text-teal-700 transition-colors">
                                Home
                            </Link>
                            <span>/</span>
                            <span className="text-slate-700 font-semibold">Clients</span>
                        </div>

                        {/* Quick Refresh */}
                        <button
                            type="button"
                            onClick={() => fetchClients()}
                            title="Refresh clients list"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-sm transition-all shadow-2xs"
                        >
                            <HiRefresh className={`text-base ${loading ? 'animate-spin text-teal-600' : ''}`} />
                        </button>

                        {/* Add Client Premium Button */}
                        <Link
                            to="/clients/add"
                            className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 active:scale-98 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider transition-all shadow-sm"
                        >
                            <HiUserAdd className="text-base" />
                            <span>Add New Client</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center text-lg">
                            <HiUsers />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Total Clients
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                                {totalClientsCount}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                            <HiCheckCircle />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Active Players
                            </span>
                            <span className="text-sm font-bold text-emerald-700">
                                {activeClientsCount}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-cyan-100 text-cyan-700 flex items-center justify-center text-lg">
                            <HiFilter />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Web Signups
                            </span>
                            <span className="text-sm font-bold text-cyan-800">
                                {signupClientsCount}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
                            <MdAccountBalanceWallet />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Client Balances
                            </span>
                            <span className="text-sm font-bold text-amber-800">
                                ₹{totalBalanceSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-5">
                {/* Modern Filter Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider">
                        <HiFilter className="text-teal-600 text-base" />
                        <span>Filter & Search Records</span>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Row 1: Domain | Username | Start Date | End Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Domain
                                </label>
                                <select
                                    value={selectedDomain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                                >
                                    <option value="">Select domain</option>
                                    {portals.map((p) => (
                                        <option key={p.id} value={p.domain_url}>
                                            {p.domain_title}
                                        </option>
                                    ))}
                                    {portals.length === 0 && (
                                        <>
                                            <option value="mastan247.club">Mastan777(mastan247.club)</option>
                                            <option value="mastan365.com">Mastan365m(mastan365.com)</option>
                                            <option value="mastan99.com">Mastan99m(mastan99.com)</option>
                                            <option value="mastanreddy.com">Mastanreddymas(mastanreddy.com)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Username
                                </label>
                                <div className="relative">
                                    <HiSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search by username..."
                                        value={usernameFilter}
                                        onChange={(e) => setUsernameFilter(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Row 2: Source | Deposit Count | SEARCH | RESET */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Source
                                </label>
                                <select
                                    value={selectedSource}
                                    onChange={(e) => setSelectedSource(e.target.value)}
                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                                >
                                    <option value="">Select source</option>
                                    <option value="Signup">Signup</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Deposit Count
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter deposit count..."
                                    value={depositCountFilter}
                                    onChange={(e) => setDepositCountFilter(e.target.value)}
                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#008080] hover:bg-[#006e6e] active:scale-98 text-white font-bold text-xs py-2 px-4 rounded-lg uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-70"
                                >
                                    <HiSearch className="text-sm" />
                                    <span>SEARCH</span>
                                </button>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg uppercase tracking-wider transition-all border border-slate-200/80 flex items-center justify-center gap-1.5"
                                >
                                    <HiRefresh className="text-sm" />
                                    <span>RESET</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Clients Table Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-3 px-3.5 w-12 text-center">NO ▲</th>
                                    <th className="py-3 px-3.5">ID</th>
                                    <th className="py-3 px-3.5">USERNAME</th>
                                    <th className="py-3 px-3.5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-slate-400">♦</span>
                                            <span>MASTER</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3.5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-slate-400">♦</span>
                                            <span>MOBILE</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3.5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-slate-400">♦</span>
                                            <span>SITE</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-[9px] text-slate-400">♦</span>
                                            <span>DEPOSIT COUNT</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-[9px] text-slate-400">♦</span>
                                            <span>SOURCE</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3.5 text-center">STATUS</th>
                                    <th className="py-3 px-3.5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-slate-400">♦</span>
                                            <span>CREATED ON</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3.5 text-center min-w-[320px]">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-[9px] text-slate-400">♦</span>
                                            <span>ACTION</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-normal">
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading clients directory...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                                            No Data Available In Table
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client, index) => (
                                        <tr
                                            key={client.id || index}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="py-3 px-3.5 text-center text-slate-500 font-semibold text-[11px]">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-3.5 font-mono text-slate-700 font-semibold text-[11px]">
                                                {client.client_id || 2619000 + (client.id as number)}
                                            </td>
                                            <td className="py-3 px-3.5 font-bold text-slate-900 tracking-tight">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                        {(client.username || 'U').substring(0, 2).toUpperCase()}
                                                    </span>
                                                    <span>{client.username}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 font-medium text-slate-700">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                                                    {client.master || 'MASTAN99M'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px]">
                                                {client.mobile || '-'}
                                            </td>
                                            <td className="py-3 px-3.5">
                                                <span
                                                    className={`px-2 py-0.5 rounded border text-[11px] font-bold tracking-tight inline-block ${getSiteBadgeStyle(
                                                        client.site
                                                    )}`}
                                                >
                                                    {client.site || 'Mastan99'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 font-bold text-[11px] text-slate-700">
                                                    {client.deposit_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 text-center font-medium text-slate-700">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                        client.source?.toLowerCase() === 'signup'
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {client.source || 'Manual'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    {client.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                                                {client.created_on || client.created_at || '—'}
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                                    {/* RED Pill: A/C STATEMENT */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAction('statement', client)}
                                                        className="bg-[#dc3545] hover:bg-[#c82333] active:scale-95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all shadow-2xs hover:shadow-xs flex items-center gap-1"
                                                    >
                                                        <HiDocumentReport className="text-xs" />
                                                        <span>A/C STATEMENT</span>
                                                    </button>

                                                    {/* TEAL Pill: DEPOSIT HISTORY */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAction('deposit', client)}
                                                        className="bg-[#17a2b8] hover:bg-[#138496] active:scale-95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all shadow-2xs hover:shadow-xs flex items-center gap-1"
                                                    >
                                                        <HiCreditCard className="text-xs" />
                                                        <span>DEPOSIT HISTORY</span>
                                                    </button>

                                                    {/* GOLD/YELLOW Pill: WITHDRAW HISTORY */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAction('withdraw', client)}
                                                        className="bg-[#ffc107] hover:bg-[#e0a800] active:scale-95 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all shadow-2xs hover:shadow-xs flex items-center gap-1"
                                                    >
                                                        <HiCash className="text-xs" />
                                                        <span>WITHDRAW HISTORY</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer info */}
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing <strong>1</strong> to <strong>{clients.length}</strong> of <strong>{clients.length}</strong> entries</span>
                        <span className="font-medium text-slate-400">Rolex Exchange Live Database</span>
                    </div>
                </div>
            </div>

            {/* Quick Action Modal: Statement / Deposit / Withdraw Connected View */}
            <Dialog
                isOpen={!!actionModalType}
                onClose={() => setActionModalType(null)}
                onRequestClose={() => setActionModalType(null)}
                width={540}
            >
                {activeClient && actionModalType && (
                    <div className="p-5 md:p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                            <h3 className="text-base font-bold text-slate-800 uppercase flex items-center gap-2">
                                {actionModalType === 'statement' && (
                                    <>
                                        <HiDocumentReport className="text-rose-600 text-lg" />
                                        <span>Client A/C Statement</span>
                                    </>
                                )}
                                {actionModalType === 'deposit' && (
                                    <>
                                        <HiCreditCard className="text-teal-600 text-lg" />
                                        <span>Client Deposit History</span>
                                    </>
                                )}
                                {actionModalType === 'withdraw' && (
                                    <>
                                        <HiCash className="text-amber-500 text-lg" />
                                        <span>Client Withdraw History</span>
                                    </>
                                )}
                            </h3>
                        </div>

                        {/* Client Summary Strip */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-4 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Username:</span>
                                <span className="font-extrabold text-slate-900 text-sm">{activeClient.username}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Client ID & Portal:</span>
                                <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                    #{activeClient.client_id || 2619000 + (activeClient.id as number)} ({activeClient.site})
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Current Balance:</span>
                                <span className="font-bold text-emerald-700 text-sm">
                                    ₹{(activeClient.balance || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Deposit Count:</span>
                                <span className="font-bold text-slate-800">{activeClient.deposit_count || 0}</span>
                            </div>
                        </div>

                        {/* Module Context */}
                        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 mb-5 leading-relaxed">
                            {actionModalType === 'statement' && (
                                <p>
                                    Viewing live statement ledger records for client <strong>{activeClient.username}</strong>. All credit/debit entries and balance turns are synchronized.
                                </p>
                            )}
                            {actionModalType === 'deposit' && (
                                <p>
                                    Client has completed <strong>{activeClient.deposit_count || 0}</strong> deposits. You can check UTR receipts, approved amounts, and bank transaction slips.
                                </p>
                            )}
                            {actionModalType === 'withdraw' && (
                                <p>
                                    Viewing withdrawal payout history and pending verification for client <strong>{activeClient.username}</strong>.
                                </p>
                            )}
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setActionModalType(null)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const targetRoute =
                                        actionModalType === 'statement'
                                            ? `/statement?user=${activeClient.username}`
                                            : actionModalType === 'deposit'
                                            ? `/deposits/history?user=${activeClient.username}`
                                            : `/withdrawals/history?user=${activeClient.username}`
                                    setActionModalType(null)
                                    navigate(targetRoute)
                                }}
                                className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
                            >
                                <span>Open Full {actionModalType.toUpperCase()} Page →</span>
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default ClientsView
