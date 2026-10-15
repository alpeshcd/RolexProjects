import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import {
    apiGetPortals,
    apiRefreshPortal,
    apiSearchClients,
    apiCreatePortalClient,
} from '@/services/GlobalSearchService'
import { apiUpdateUserBalance } from '@/services/AuthService'
import type { DomainPortal, GlobalSearchClient } from '@/@types/globalSearch'
import {
    HiSearch,
    HiOutlineRefresh,
    HiPlus,
    HiCheckCircle,
    HiOutlineCash,
    HiDotsVertical,
} from 'react-icons/hi'
import { MdAccountBalanceWallet, MdSearch } from 'react-icons/md'

const DOMAIN_OPTIONS = [
    { label: 'Select domain', value: '' },
    { label: 'Mastan777(mastan247.club)', value: 'mastan247.club' },
    { label: 'Mastan365m(mastan365.com)', value: 'mastan365.com' },
    { label: 'Mastan99m(mastan99.com)', value: 'mastan99.com' },
    { label: 'Mastanreddymas(mastanreddy.com)', value: 'mastanreddy.com' },
]

const GlobalSearchView = () => {
    const navigate = useNavigate()
    // Portals state
    const [portals, setPortals] = useState<DomainPortal[]>([])
    const [loadingPortals, setLoadingPortals] = useState<boolean>(true)
    const [refreshingId, setRefreshingId] = useState<number | null>(null)

    // Search filter state
    const [selectedDomain, setSelectedDomain] = useState<string>('')
    const [usernameInput, setUsernameInput] = useState<string>('')
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [searchResults, setSearchResults] = useState<GlobalSearchClient[]>([])

    // Add Client Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
    const [addDomain, setAddDomain] = useState<string>('mastan247.club')
    const [addUsername, setAddUsername] = useState<string>('')
    const [addFullName, setAddFullName] = useState<string>('')
    const [addPassword, setAddPassword] = useState<string>('')
    const [addBalance, setAddBalance] = useState<string>('5000')
    const [addUpline, setAddUpline] = useState<string>('MASTAN99M')
    const [isSubmittingAdd, setIsSubmittingAdd] = useState<boolean>(false)

    // Quick Balance Update Modal State
    const [isBalModalOpen, setIsBalModalOpen] = useState<boolean>(false)
    const [selectedClient, setSelectedClient] = useState<GlobalSearchClient | null>(null)
    const [balAmount, setBalAmount] = useState<string>('1000')
    const [balOperation, setBalOperation] = useState<'deposit' | 'withdraw'>('deposit')
    const [isSubmittingBal, setIsSubmittingBal] = useState<boolean>(false)

    // Load initial portal stats
    const fetchPortals = async () => {
        try {
            const data = await apiGetPortals()
            setPortals(data)
        } catch (err) {
            console.error('Error fetching portals:', err)
        } finally {
            setLoadingPortals(false)
        }
    }

    useEffect(() => {
        fetchPortals()
    }, [])

    // Refresh a single portal card
    const handleRefreshPortal = async (portalId: number) => {
        setRefreshingId(portalId)
        try {
            const updated = await apiRefreshPortal(portalId)
            setPortals((prev) =>
                prev.map((p) => (p.id === portalId ? updated : p))
            )
            toast.push(
                <Notification type="success" title="Portal Refreshed">
                    Live balance and wallet stats reloaded.
                </Notification>
            )
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Refresh Failed">
                    Could not refresh portal data.
                </Notification>
            )
        } finally {
            setRefreshingId(null)
        }
    }

    // Execute Global Search
    const handleSearch = async (e?: React.FormEvent, customDomain?: string) => {
        if (e) e.preventDefault()
        const domainToUse = customDomain !== undefined ? customDomain : selectedDomain
        
        setIsSearching(true)
        setHasSearched(true)
        try {
            const results = await apiSearchClients({
                domain: domainToUse || undefined,
                username: usernameInput.trim() || undefined,
            })
            setSearchResults(results)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Search Error">
                    Failed to query client database.
                </Notification>
            )
        } finally {
            setIsSearching(false)
        }
    }

    // Trigger Search from a specific domain card
    const handleCardSearchClick = (portal: DomainPortal) => {
        setSelectedDomain(portal.domain_url)
        handleSearch(undefined, portal.domain_url)
    }

    // Open Add Client modal with prefilled domain
    const handleOpenAddClient = (portal?: DomainPortal) => {
        if (portal) {
            setAddDomain(portal.domain_url)
        } else if (selectedDomain) {
            setAddDomain(selectedDomain)
        } else {
            setAddDomain('mastan247.club')
        }
        setAddUsername('')
        setAddFullName('')
        setAddPassword('')
        setAddBalance('5000')
        setIsAddModalOpen(true)
    }

    // Submit Add Client
    const handleSubmitAddClient = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addUsername.trim() || !addPassword.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    Username and Password are required.
                </Notification>
            )
            return
        }

        setIsSubmittingAdd(true)
        try {
            const created = await apiCreatePortalClient({
                domain: addDomain,
                username: addUsername.trim(),
                full_name: addFullName.trim() || addUsername.trim(),
                password: addPassword.trim(),
                balance: parseFloat(addBalance) || 0,
                upline: addUpline,
                upline_share: (parseFloat(addBalance) || 0) * 0.1,
            })

            toast.push(
                <Notification type="success" title="Client Created">
                    Client <strong>{created.username}</strong> successfully added under{' '}
                    <strong>{created.domain}</strong>!
                </Notification>
            )

            setIsAddModalOpen(false)
            // Reload portals and refresh search if domain matches
            fetchPortals()
            if (hasSearched) {
                handleSearch()
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.detail || 'Failed to create client'
            toast.push(
                <Notification type="danger" title="Error">
                    {errMsg}
                </Notification>
            )
        } finally {
            setIsSubmittingAdd(false)
        }
    }

    // Open Quick Balance Update modal
    const handleOpenBalModal = (client: GlobalSearchClient) => {
        setSelectedClient(client)
        setBalAmount('1000')
        setBalOperation('deposit')
        setIsBalModalOpen(true)
    }

    // Submit Quick Balance Update
    const handleSubmitBalanceUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClient) return
        const amt = parseFloat(balAmount)
        if (isNaN(amt) || amt <= 0) {
            toast.push(
                <Notification type="warning" title="Invalid Amount">
                    Please enter a valid positive amount.
                </Notification>
            )
            return
        }

        setIsSubmittingBal(true)
        try {
            await apiUpdateUserBalance(selectedClient.id, {
                amount: amt,
                operation: balOperation,
            })

            toast.push(
                <Notification type="success" title="Balance Updated">
                    Successfully {balOperation === 'deposit' ? 'credited' : 'debited'} ₹{amt.toLocaleString()}{' '}
                    to {selectedClient.username}
                </Notification>
            )

            setIsBalModalOpen(false)
            fetchPortals()
            handleSearch()
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Failed to update balance'
            toast.push(
                <Notification type="danger" title="Transaction Failed">
                    {msg}
                </Notification>
            )
        } finally {
            setIsSubmittingBal(false)
        }
    }

    // Helper to render branded logo badge for each card
    const renderPortalLogo = (portal: DomainPortal) => {
        const key = portal.domain_key.toLowerCase()

        if (key.includes('247')) {
            return (
                <div className="flex items-center justify-center gap-1">
                    <span className="text-white font-black italic tracking-tighter text-lg md:text-xl drop-shadow">
                        MASTAN
                    </span>
                    <span className="bg-[#cc0000] text-white px-1.5 py-0.5 rounded text-xs md:text-sm font-bold tracking-tight not-italic">
                        247
                    </span>
                </div>
            )
        }

        if (key.includes('365')) {
            return (
                <div className="text-center font-black tracking-tight text-lg md:text-xl text-[#d4ff00] drop-shadow-sm uppercase">
                    MASTAN365
                </div>
            )
        }

        if (key.includes('99')) {
            return (
                <div className="text-center font-black italic tracking-wide text-lg md:text-xl text-[#ffcc00] drop-shadow-sm uppercase">
                    MASTAN99
                </div>
            )
        }

        // Mastan Reddy Club
        return (
            <div className="text-center leading-tight">
                <span className="text-[#f7d794] font-serif font-black tracking-wider text-sm md:text-base uppercase block">
                    MASTANREDDY
                </span>
                <span className="text-[#f7d794]/80 text-[10px] tracking-widest uppercase font-sans">
                    CLUB
                </span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] pb-12">
            {/* Top Header / Breadcrumb Row */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                <h1 className="text-base md:text-lg font-bold text-gray-800 tracking-wide uppercase">
                    GLOBAL SEARCH
                </h1>
                <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <Link to="/home" className="hover:text-teal-700 transition-colors">
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-gray-700 font-semibold">Global search</span>
                </div>
            </div>

            <div className="p-4 md:p-6 space-y-5">
                {/* 4 Top Domain Portal Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {portals.map((portal) => (
                        <div
                            key={portal.id}
                            className="bg-[#008080] rounded shadow-md overflow-hidden flex flex-col justify-between border border-teal-600 transition-transform duration-150 hover:-translate-y-0.5"
                        >
                            {/* Card Top Banner with Brand Logo and Refresh Button */}
                            <div className="relative pt-3 pb-2 px-3 flex items-center justify-center min-h-[52px]">
                                {renderPortalLogo(portal)}

                                {/* Small White Refresh Button */}
                                <button
                                    type="button"
                                    onClick={() => handleRefreshPortal(portal.id)}
                                    title="Refresh live portal stats"
                                    className="absolute right-2.5 top-2.5 bg-white text-gray-700 hover:text-teal-700 hover:bg-gray-100 p-1 rounded text-xs shadow-xs transition-all active:scale-90"
                                >
                                    <HiOutlineRefresh
                                        className={`text-sm ${
                                            refreshingId === portal.id ? 'animate-spin text-teal-600' : ''
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Subheader Strip: e.g. MASTAN777(MASTAN247) */}
                            <div className="bg-[#007373] text-white text-[11px] md:text-xs font-bold text-center py-1 px-2 uppercase tracking-wide truncate border-t border-teal-500/30">
                                {portal.domain_title}
                            </div>

                            {/* 3-Column Stats Table with Crisp Borders */}
                            <div className="grid grid-cols-3 text-center border-t border-b border-white/20 divide-x divide-white/20 bg-[#008080]">
                                <div className="p-1.5 flex flex-col justify-center">
                                    <span className="text-[10px] text-white/80 font-semibold uppercase tracking-wider block">
                                        BALANCE
                                    </span>
                                    <span className="text-xs md:text-[13px] text-white font-bold tracking-tight block truncate mt-0.5">
                                        {portal.balance.toLocaleString('en-IN', {
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="p-1.5 flex flex-col justify-center">
                                    <span className="text-[10px] text-white/80 font-semibold uppercase tracking-wider block">
                                        PL
                                    </span>
                                    <span className="text-xs md:text-[13px] text-white font-bold tracking-tight block truncate mt-0.5">
                                        {portal.pl.toLocaleString('en-IN', {
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="p-1.5 flex flex-col justify-center">
                                    <span className="text-[10px] text-white/80 font-semibold uppercase tracking-wider block">
                                        CLIENT WALLET
                                    </span>
                                    <span className="text-xs md:text-[13px] text-white font-bold tracking-tight block truncate mt-0.5">
                                        {portal.client_wallet.toLocaleString('en-IN', {
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-2 space-y-1.5 bg-[#008080]">
                                <button
                                    type="button"
                                    onClick={() => handleOpenAddClient(portal)}
                                    className="w-full bg-[#006e6e] hover:bg-[#005f5f] active:bg-[#005050] text-white font-bold text-xs py-1.5 px-3 rounded-xs uppercase tracking-wider border border-white/30 transition-all text-center flex items-center justify-center gap-1"
                                >
                                    <HiPlus className="text-sm" /> ADD CLIENT
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCardSearchClick(portal)}
                                    className="w-full bg-[#006e6e] hover:bg-[#005f5f] active:bg-[#005050] text-white font-bold text-xs py-1.5 px-3 rounded-xs tracking-wider border border-white/30 transition-all text-center flex items-center justify-center gap-1.5"
                                >
                                    <HiSearch className="text-sm" /> Search
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter / Search Form Box */}
                <div className="bg-white rounded border border-gray-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        {/* Domain Dropdown */}
                        <div className="md:col-span-5">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Domain:
                            </label>
                            <select
                                value={selectedDomain}
                                onChange={(e) => setSelectedDomain(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                            >
                                <option value="">Select domain</option>
                                {portals.map((p) => (
                                    <option key={p.id} value={p.domain_url}>
                                        {p.domain_title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Username Input */}
                        <div className="md:col-span-5">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Username:
                            </label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                            />
                        </div>

                        {/* SEARCH Button */}
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="w-full bg-[#008080] hover:bg-[#006e6e] active:bg-[#005c5c] text-white font-bold text-sm py-2 px-4 rounded uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-70"
                            >
                                <HiSearch className="text-base" />
                                {isSearching ? 'SEARCHING...' : 'SEARCH'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Search Results Table */}
                <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-16 text-center">S.NO</th>
                                    <th className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <span>DOMAIN</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-4">USERNAME</th>
                                    <th className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="text-[10px] text-gray-400">♦</span>
                                            <span>BALANCE</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-[10px] text-gray-400">♦</span>
                                            <span>LAST UPDATED</span>
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-[10px] text-gray-400">♦</span>
                                            <span>ACTION</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {/* If no results or not searched yet */}
                                {searchResults.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-sm font-medium text-gray-500"
                                        >
                                            No Data Available In Table
                                        </td>
                                    </tr>
                                ) : (
                                    searchResults.map((client, index) => (
                                        <tr
                                            key={client.id}
                                            className="hover:bg-teal-50/40 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-center text-gray-500 font-medium text-xs">
                                                {client.s_no || index + 1}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Tag className="bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-xs px-2 py-0.5 rounded">
                                                    {client.domain_title || client.domain}
                                                </Tag>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-gray-800">
                                                {client.username}
                                                {client.full_name && client.full_name !== client.username && (
                                                    <span className="text-xs font-normal text-gray-500 block">
                                                        {client.full_name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-teal-700">
                                                ₹{client.balance.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="py-3 px-4 text-center text-xs text-gray-500">
                                                {client.last_updated || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenBalModal(client)}
                                                        className="bg-[#008080] hover:bg-[#006e6e] text-white text-[11px] font-semibold px-2 py-1 rounded transition-colors flex items-center gap-1 shadow-2xs"
                                                        title="Transfer Balance"
                                                    >
                                                        <HiOutlineCash className="text-xs" />
                                                        <span>Balance</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/statement?user=${client.username}`)}
                                                        className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase tracking-wider"
                                                        title="View Statement"
                                                    >
                                                        Statement
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/deposits/history?user=${client.username}`)}
                                                        className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase tracking-wider"
                                                        title="Deposit History"
                                                    >
                                                        Deposit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/withdrawals/history?user=${client.username}`)}
                                                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase tracking-wider"
                                                        title="Withdraw History"
                                                    >
                                                        Withdraw
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal: ADD CLIENT */}
            <Dialog
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onRequestClose={() => setIsAddModalOpen(false)}
                width={520}
            >
                <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                        <h3 className="text-lg font-bold text-teal-800 uppercase flex items-center gap-2">
                            <HiPlus className="text-teal-700" />
                            Add Client To Domain
                        </h3>
                    </div>

                    <form onSubmit={handleSubmitAddClient} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Target Domain *
                            </label>
                            <select
                                value={addDomain}
                                onChange={(e) => setAddDomain(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-teal-600 font-medium"
                            >
                                {portals.map((p) => (
                                    <option key={p.id} value={p.domain_url}>
                                        {p.domain_title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. ROLEX_USER77"
                                    value={addUsername}
                                    onChange={(e) => setAddUsername(e.target.value)}
                                    className="w-full uppercase border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-teal-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Full Name / Phone
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={addFullName}
                                    onChange={(e) => setAddFullName(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-teal-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter client password"
                                    value={addPassword}
                                    onChange={(e) => setAddPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-teal-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Initial Balance (₹)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={addBalance}
                                    onChange={(e) => setAddBalance(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-teal-600"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-2 border-t border-gray-200 mt-5">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingAdd}
                                className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white rounded text-sm font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5"
                            >
                                {isSubmittingAdd ? 'Saving...' : 'Create Client'}
                            </button>
                        </div>
                    </form>
                </div>
            </Dialog>

            {/* Modal: QUICK BALANCE TRANSFER / ADJUST */}
            <Dialog
                isOpen={isBalModalOpen}
                onClose={() => setIsBalModalOpen(false)}
                onRequestClose={() => setIsBalModalOpen(false)}
                width={460}
            >
                <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                        <h3 className="text-lg font-bold text-teal-800 uppercase flex items-center gap-2">
                            <MdAccountBalanceWallet className="text-teal-700" />
                            Client Balance Transfer
                        </h3>
                    </div>

                    {selectedClient && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Client:</span>
                                <span className="font-bold text-gray-800">{selectedClient.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Domain:</span>
                                <span className="font-semibold text-teal-700">{selectedClient.domain_title || selectedClient.domain}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Current Balance:</span>
                                <span className="font-bold text-green-700 text-sm">₹{selectedClient.balance.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmitBalanceUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Operation Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBalOperation('deposit')}
                                    className={`py-2 text-xs font-bold rounded uppercase tracking-wider border transition-colors ${
                                        balOperation === 'deposit'
                                            ? 'bg-teal-700 text-white border-teal-700'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    + Deposit / Credit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBalOperation('withdraw')}
                                    className={`py-2 text-xs font-bold rounded uppercase tracking-wider border transition-colors ${
                                        balOperation === 'withdraw'
                                            ? 'bg-red-700 text-white border-red-700'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    - Withdraw / Debit
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="100"
                                required
                                value={balAmount}
                                onChange={(e) => setBalAmount(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 font-bold focus:outline-none focus:border-teal-600"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-2 border-t border-gray-200 mt-5">
                            <button
                                type="button"
                                onClick={() => setIsBalModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingBal}
                                className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white rounded text-sm font-bold uppercase tracking-wider transition-colors shadow-xs"
                            >
                                {isSubmittingBal ? 'Processing...' : 'Confirm Transfer'}
                            </button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    )
}

export default GlobalSearchView
