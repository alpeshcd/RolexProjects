import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import { apiGetDashboardStats, apiGetMe, type DashboardStatsData } from '@/services/AuthService'
import {
    MdPerson,
    MdAccountBalanceWallet,
    MdAccountBalance,
    MdPayments,
    MdSearch,
} from 'react-icons/md'
import { HiOutlineCash, HiArrowCircleRight } from 'react-icons/hi'
import { RiMoneyDollarBoxLine } from 'react-icons/ri'

const Home = () => {
    const navigate = useNavigate()
    const setUser = useSessionUser((state) => state.setUser)

    const [stats, setStats] = useState<DashboardStatsData>({
        new_clients: 12,
        total_ftd: 0,
        total_ftd_count: 0,
        total_deposits: 76720,
        total_deposits_count: 59,
        approved_deposits: 59120,
        approved_deposits_count: 37,
        rejected_deposits: 17600,
        rejected_deposits_count: 22,
        total_withdrawals: 182810,
        total_withdrawals_count: 24,
        pending_withdrawals: 7000,
        pending_withdrawals_count: 1,
        approved_withdrawals: 147283,
        approved_withdrawals_count: 17,
        rejected_withdrawals: 28527,
        rejected_withdrawals_count: 6,
    })

    useEffect(() => {
        // Fetch current user and live dashboard statistics from database
        apiGetMe().then((me) => {
            if (me) setUser(me)
        }).catch(() => {})

        apiGetDashboardStats().then((data) => {
            if (data) setStats(data)
        }).catch(() => {})
    }, [])

    const formatCurrency = (val: number) => {
        return Number(val || 0).toLocaleString('en-IN')
    }

    return (
        <div className="flex-1 w-full p-4 sm:p-5 bg-[#f4f6f9] dark:bg-gray-900 min-h-[calc(100vh-48px)] font-sans">
            {/* Top Bar: WELCOME & Breadcrumbs */}
            <div className="flex items-center justify-between mb-4 pb-1">
                <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                    WELCOME
                </h1>
                <div className="text-xs text-gray-500 font-medium">
                    <span className="hover:underline cursor-pointer" onClick={() => navigate('/home')}>
                        Home
                    </span>
                    <span className="mx-1.5 text-gray-400">/</span>
                    <span className="text-gray-600 dark:text-gray-300 font-semibold">Dashboard</span>
                </div>
            </div>

            {/* SECTION 1: Top Action Shortcut Cards */}
            <div className="space-y-3.5 mb-5">
                {/* Row 1: Single New Clients Card */}
                <div className="w-full sm:w-[320px]">
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/80 p-2.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#f1b44c] flex items-center justify-center text-white text-2xl shrink-0 shadow-sm">
                            <MdPerson />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">
                                New Clients : {stats.new_clients}
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/clients')}
                                className="bg-[#008080] hover:bg-[#006e6e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm tracking-wider uppercase transition-colors"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 2: 4 Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* 1. Deposit list */}
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/80 p-2.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#17a2b8] flex items-center justify-center text-white text-2xl shrink-0 shadow-sm">
                            <HiOutlineCash />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">
                                Deposit list
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/deposit')}
                                className="bg-[#f1b44c] hover:bg-[#e0a33b] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm tracking-wider uppercase transition-colors"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* 2. UTR Entry */}
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/80 p-2.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#b03a2e] flex items-center justify-center text-white text-2xl shrink-0 shadow-sm">
                            <MdAccountBalance />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">
                                UTR Entry
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/deposit')}
                                className="bg-[#008080] hover:bg-[#006e6e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm tracking-wider uppercase transition-colors"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* 3. Withdraw */}
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/80 p-2.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#28a745] flex items-center justify-center text-white text-2xl shrink-0 shadow-sm">
                            <MdPayments />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">
                                Withdraw
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/withdraw')}
                                className="bg-[#f1b44c] hover:bg-[#e0a33b] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm tracking-wider uppercase transition-colors"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* 4. Add Account */}
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/80 p-2.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#b03a2e] flex items-center justify-center text-white text-2xl shrink-0 shadow-sm">
                            <MdAccountBalance />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">
                                Add Account
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/accounts/create')}
                                className="bg-[#008080] hover:bg-[#006e6e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm tracking-wider uppercase transition-colors"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 3: 2 Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* 1. Account list */}
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/80 p-2.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#b03a2e] flex items-center justify-center text-white text-2xl shrink-0 shadow-sm">
                            <MdAccountBalance />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">
                                Account list
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/accounts')}
                                className="bg-[#f1b44c] hover:bg-[#e0a33b] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm tracking-wider uppercase transition-colors"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* 2. Global search */}
                    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/80 p-2.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#f1b44c] flex items-center justify-center text-white text-2xl shrink-0 shadow-sm">
                            <MdSearch />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">
                                Global search
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/global-search')}
                                className="bg-[#008080] hover:bg-[#006e6e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm tracking-wider uppercase transition-colors"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Financial Statistics Cards */}
            <div className="space-y-3.5">
                {/* Row 1: Total FTD Card */}
                <div className="w-full sm:w-[280px]">
                    <div className="relative overflow-hidden rounded-md bg-[#17a2b8] text-white p-3.5 shadow-sm">
                        <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                            <RiMoneyDollarBoxLine />
                        </div>
                        <div className="text-3xl font-black font-mono leading-none tracking-tight">
                            {stats.total_ftd}
                        </div>
                        <div className="text-xs font-semibold mt-1.5 opacity-90">
                            Total FTD : {stats.total_ftd_count}
                        </div>
                    </div>
                </div>

                {/* Row 2: 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Card 1: Total Deposits (Teal) */}
                    <div className="rounded-md overflow-hidden bg-[#17a2b8] text-white shadow-sm flex flex-col justify-between">
                        <div className="p-3.5 relative">
                            <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                                <RiMoneyDollarBoxLine />
                            </div>
                            <div className="text-2xl sm:text-[26px] font-black font-mono leading-none tracking-tight">
                                {formatCurrency(stats.total_deposits)}
                            </div>
                            <div className="text-xs font-semibold mt-1.5 opacity-90">
                                Total Deposits : {stats.total_deposits_count}
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/deposit')}
                            className="bg-[#138496] hover:bg-[#117a8b] py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs text-white/95 font-semibold cursor-pointer transition-colors select-none"
                        >
                            <span>More info</span>
                            <HiArrowCircleRight className="text-sm" />
                        </div>
                    </div>

                    {/* Card 2: Total Approved Deposits (Green) */}
                    <div className="rounded-md overflow-hidden bg-[#28a745] text-white shadow-sm flex flex-col justify-between">
                        <div className="p-3.5 relative">
                            <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                                <RiMoneyDollarBoxLine />
                            </div>
                            <div className="text-2xl sm:text-[26px] font-black font-mono leading-none tracking-tight">
                                {formatCurrency(stats.approved_deposits)}
                            </div>
                            <div className="text-xs font-semibold mt-1.5 opacity-90">
                                Total Approved Deposits : {stats.approved_deposits_count}
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/deposit')}
                            className="bg-[#218838] hover:bg-[#1e7e34] py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs text-white/95 font-semibold cursor-pointer transition-colors select-none"
                        >
                            <span>More info</span>
                            <HiArrowCircleRight className="text-sm" />
                        </div>
                    </div>

                    {/* Card 3: Total Rejected Deposits (Red) */}
                    <div className="rounded-md overflow-hidden bg-[#dc3545] text-white shadow-sm flex flex-col justify-between">
                        <div className="p-3.5 relative">
                            <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                                <RiMoneyDollarBoxLine />
                            </div>
                            <div className="text-2xl sm:text-[26px] font-black font-mono leading-none tracking-tight">
                                {formatCurrency(stats.rejected_deposits)}
                            </div>
                            <div className="text-xs font-semibold mt-1.5 opacity-90">
                                Total Rejected Deposits : {stats.rejected_deposits_count}
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/deposit')}
                            className="bg-[#c82333] hover:bg-[#bd2130] py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs text-white/95 font-semibold cursor-pointer transition-colors select-none"
                        >
                            <span>More info</span>
                            <HiArrowCircleRight className="text-sm" />
                        </div>
                    </div>

                    {/* Card 4: Total Withdrawals (Teal) */}
                    <div className="rounded-md overflow-hidden bg-[#17a2b8] text-white shadow-sm flex flex-col justify-between">
                        <div className="p-3.5 relative">
                            <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                                <RiMoneyDollarBoxLine />
                            </div>
                            <div className="text-2xl sm:text-[26px] font-black font-mono leading-none tracking-tight">
                                {formatCurrency(stats.total_withdrawals)}
                            </div>
                            <div className="text-xs font-semibold mt-1.5 opacity-90">
                                Total Withdrawals : {stats.total_withdrawals_count}
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/withdraw')}
                            className="bg-[#138496] hover:bg-[#117a8b] py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs text-white/95 font-semibold cursor-pointer transition-colors select-none"
                        >
                            <span>More info</span>
                            <HiArrowCircleRight className="text-sm" />
                        </div>
                    </div>
                </div>

                {/* Row 3: 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Card 1: Total Pending Withdrawals (Yellow/Amber) */}
                    <div className="rounded-md overflow-hidden bg-[#f39c12] text-white shadow-sm flex flex-col justify-between">
                        <div className="p-3.5 relative">
                            <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                                <RiMoneyDollarBoxLine />
                            </div>
                            <div className="text-2xl sm:text-[26px] font-black font-mono leading-none tracking-tight">
                                {formatCurrency(stats.pending_withdrawals)}
                            </div>
                            <div className="text-xs font-semibold mt-1.5 opacity-90">
                                Total Pending Withdrawals : {stats.pending_withdrawals_count}
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/withdraw')}
                            className="bg-[#d68910] hover:bg-[#c67d0c] py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs text-white/95 font-semibold cursor-pointer transition-colors select-none"
                        >
                            <span>More info</span>
                            <HiArrowCircleRight className="text-sm" />
                        </div>
                    </div>

                    {/* Card 2: Total Approved Withdrawals (Green) */}
                    <div className="rounded-md overflow-hidden bg-[#28a745] text-white shadow-sm flex flex-col justify-between">
                        <div className="p-3.5 relative">
                            <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                                <RiMoneyDollarBoxLine />
                            </div>
                            <div className="text-2xl sm:text-[26px] font-black font-mono leading-none tracking-tight">
                                {formatCurrency(stats.approved_withdrawals)}
                            </div>
                            <div className="text-xs font-semibold mt-1.5 opacity-90">
                                Total Approved Withdrawals : {stats.approved_withdrawals_count}
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/withdraw')}
                            className="bg-[#218838] hover:bg-[#1e7e34] py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs text-white/95 font-semibold cursor-pointer transition-colors select-none"
                        >
                            <span>More info</span>
                            <HiArrowCircleRight className="text-sm" />
                        </div>
                    </div>

                    {/* Card 3: Total Rejected Withdrawals (Red) */}
                    <div className="rounded-md overflow-hidden bg-[#dc3545] text-white shadow-sm flex flex-col justify-between">
                        <div className="p-3.5 relative">
                            <div className="absolute top-2.5 right-3 text-black/25 text-3xl pointer-events-none">
                                <RiMoneyDollarBoxLine />
                            </div>
                            <div className="text-2xl sm:text-[26px] font-black font-mono leading-none tracking-tight">
                                {formatCurrency(stats.rejected_withdrawals)}
                            </div>
                            <div className="text-xs font-semibold mt-1.5 opacity-90">
                                Total Rejected Withdrawals : {stats.rejected_withdrawals_count}
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/withdraw')}
                            className="bg-[#c82333] hover:bg-[#bd2130] py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs text-white/95 font-semibold cursor-pointer transition-colors select-none"
                        >
                            <span>More info</span>
                            <HiArrowCircleRight className="text-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
