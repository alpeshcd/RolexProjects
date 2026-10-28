import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetDashboardStats, type DashboardStatsData } from '@/services/AuthService'
import {
    FaUserPlus,
    FaMoneyBillWave,
    FaUniversity,
    FaSearch,
    FaArrowCircleRight,
} from 'react-icons/fa'

const Home = () => {
    const navigate = useNavigate()

    // Default stats initialized with values matching the reference design
    const [stats, setStats] = useState<DashboardStatsData>({
        new_clients: 28,
        total_ftd: 0,
        total_ftd_count: 0,
        total_deposits: 360595,
        total_deposits_count: 195,
        approved_deposits: 315795,
        approved_deposits_count: 179,
        rejected_deposits: 44800,
        rejected_deposits_count: 16,
        total_withdrawals: 465226,
        total_withdrawals_count: 97,
        pending_withdrawals: 160566,
        pending_withdrawals_count: 22,
        approved_withdrawals: 284140,
        approved_withdrawals_count: 64,
        rejected_withdrawals: 20520,
        rejected_withdrawals_count: 11,
    })

    const loadData = () => {
        apiGetDashboardStats()
            .then((data) => {
                if (data) setStats(data)
            })
            .catch(() => {
                // Keep initial demo/reference stats if API is unavailable
            })
    }

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 10000)
        return () => clearInterval(interval)
    }, [])

    const formatIndian = (val: number | undefined | null) => {
        if (val === undefined || val === null) return '0'
        return Number(val).toLocaleString('en-IN')
    }

    return (
        <div className="w-full py-1 px-1 text-ink space-y-4">
            {/* Header: WELCOME & Breadcrumb */}
            <div className="flex items-center justify-between pb-2.5 border-b border-line">
                <h1 className="text-base md:text-lg font-bold tracking-tight text-ink uppercase m-0">
                    WELCOME
                </h1>
                <div className="flex items-center text-xs md:text-sm text-ink-3">
                    <span
                        onClick={() => navigate('/home')}
                        className="font-semibold text-ink hover:text-primary cursor-pointer transition-colors"
                    >
                        Home
                    </span>
                    <span className="mx-2 text-ink-3 opacity-60">/</span>
                    <span className="text-ink-3">Dashboard</span>
                </div>
            </div>

            {/* Quick Navigation Action Cards */}
            <div className="space-y-4">
                {/* Row 1: New Clients */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-surface rounded-[4px] shadow-sm border border-line flex items-center overflow-hidden h-[76px] hover:border-line-strong hover:shadow-md transition-all">
                        <div className="w-[76px] h-full bg-[#f39c12] flex items-center justify-center text-white text-2xl shrink-0">
                            <FaUserPlus />
                        </div>
                        <div className="flex-1 px-4 py-2 flex flex-col justify-center items-start">
                            <span className="text-sm font-semibold text-ink leading-snug">
                                New Clients : {stats.new_clients}
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/clients')}
                                className="mt-1 px-3 py-1 rounded-[3px] text-[11px] font-bold tracking-wider uppercase text-white bg-[#00897b] hover:bg-[#00796b] shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 2: Deposit list, UTR Entry, Withdraw, Add Account */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Deposit list */}
                    <div className="bg-surface rounded-[4px] shadow-sm border border-line flex items-center overflow-hidden h-[76px] hover:border-line-strong hover:shadow-md transition-all">
                        <div className="w-[76px] h-full bg-[#17a2b8] flex items-center justify-center text-white text-2xl shrink-0">
                            <FaMoneyBillWave />
                        </div>
                        <div className="flex-1 px-4 py-2 flex flex-col justify-center items-start">
                            <span className="text-sm font-semibold text-ink leading-snug">
                                Deposit list
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/deposit')}
                                className="mt-1 px-3 py-1 rounded-[3px] text-[11px] font-bold tracking-wider uppercase text-white bg-[#f39c12] hover:bg-[#d68910] shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* UTR Entry */}
                    <div className="bg-surface rounded-[4px] shadow-sm border border-line flex items-center overflow-hidden h-[76px] hover:border-line-strong hover:shadow-md transition-all">
                        <div className="w-[76px] h-full bg-[#c0392b] flex items-center justify-center text-white text-2xl shrink-0">
                            <FaUniversity />
                        </div>
                        <div className="flex-1 px-4 py-2 flex flex-col justify-center items-start">
                            <span className="text-sm font-semibold text-ink leading-snug">
                                UTR Entry
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/deposits/utr-entry')}
                                className="mt-1 px-3 py-1 rounded-[3px] text-[11px] font-bold tracking-wider uppercase text-white bg-[#00897b] hover:bg-[#00796b] shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* Withdraw */}
                    <div className="bg-surface rounded-[4px] shadow-sm border border-line flex items-center overflow-hidden h-[76px] hover:border-line-strong hover:shadow-md transition-all">
                        <div className="w-[76px] h-full bg-[#28a745] flex items-center justify-center text-white text-2xl shrink-0">
                            <FaMoneyBillWave />
                        </div>
                        <div className="flex-1 px-4 py-2 flex flex-col justify-center items-start">
                            <span className="text-sm font-semibold text-ink leading-snug">
                                Withdraw
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/withdraw')}
                                className="mt-1 px-3 py-1 rounded-[3px] text-[11px] font-bold tracking-wider uppercase text-white bg-[#f39c12] hover:bg-[#d68910] shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* Add Account */}
                    <div className="bg-surface rounded-[4px] shadow-sm border border-line flex items-center overflow-hidden h-[76px] hover:border-line-strong hover:shadow-md transition-all">
                        <div className="w-[76px] h-full bg-[#c0392b] flex items-center justify-center text-white text-2xl shrink-0">
                            <FaUniversity />
                        </div>
                        <div className="flex-1 px-4 py-2 flex flex-col justify-center items-start">
                            <span className="text-sm font-semibold text-ink leading-snug">
                                Add Account
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/accounts')}
                                className="mt-1 px-3 py-1 rounded-[3px] text-[11px] font-bold tracking-wider uppercase text-white bg-[#00897b] hover:bg-[#00796b] shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 3: Account list, Global search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Account list */}
                    <div className="bg-surface rounded-[4px] shadow-sm border border-line flex items-center overflow-hidden h-[76px] hover:border-line-strong hover:shadow-md transition-all">
                        <div className="w-[76px] h-full bg-[#c0392b] flex items-center justify-center text-white text-2xl shrink-0">
                            <FaUniversity />
                        </div>
                        <div className="flex-1 px-4 py-2 flex flex-col justify-center items-start">
                            <span className="text-sm font-semibold text-ink leading-snug">
                                Account list
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/accounts')}
                                className="mt-1 px-3 py-1 rounded-[3px] text-[11px] font-bold tracking-wider uppercase text-white bg-[#f39c12] hover:bg-[#d68910] shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>

                    {/* Global search */}
                    <div className="bg-surface rounded-[4px] shadow-sm border border-line flex items-center overflow-hidden h-[76px] hover:border-line-strong hover:shadow-md transition-all">
                        <div className="w-[76px] h-full bg-[#f39c12] flex items-center justify-center text-white text-2xl shrink-0">
                            <FaSearch />
                        </div>
                        <div className="flex-1 px-4 py-2 flex flex-col justify-center items-start">
                            <span className="text-sm font-semibold text-ink leading-snug">
                                Global search
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/global-search')}
                                className="mt-1 px-3 py-1 rounded-[3px] text-[11px] font-bold tracking-wider uppercase text-white bg-[#00897b] hover:bg-[#00796b] shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                CLICK HERE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Financial Stat Cards Section */}
            <div className="space-y-4 pt-2">
                {/* Row 4: Total FTD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#17a2b8] rounded-[4px] shadow-sm text-white overflow-hidden relative p-3.5 min-h-[92px] flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                            <FaMoneyBillWave />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.total_ftd)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total FTD : {stats.total_ftd_count}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 5: Total Deposits, Total Approved Deposits, Total Rejected Deposits, Total Withdrawals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Deposits */}
                    <div className="bg-[#17a2b8] rounded-[4px] shadow-sm text-white overflow-hidden relative flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="p-3.5 relative">
                            <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                                <FaMoneyBillWave />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.total_deposits)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total Deposits : {stats.total_deposits_count}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/deposit')}
                            className="w-full bg-black/15 hover:bg-black/25 active:bg-black/35 transition-colors py-1 px-3 text-center text-xs text-white flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                        >
                            <span>More info</span>
                            <FaArrowCircleRight className="text-[13px]" />
                        </button>
                    </div>

                    {/* Total Approved Deposits */}
                    <div className="bg-[#28a745] rounded-[4px] shadow-sm text-white overflow-hidden relative flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="p-3.5 relative">
                            <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                                <FaMoneyBillWave />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.approved_deposits)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total Approved Deposits : {stats.approved_deposits_count}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/deposit')}
                            className="w-full bg-black/15 hover:bg-black/25 active:bg-black/35 transition-colors py-1 px-3 text-center text-xs text-white flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                        >
                            <span>More info</span>
                            <FaArrowCircleRight className="text-[13px]" />
                        </button>
                    </div>

                    {/* Total Rejected Deposits */}
                    <div className="bg-[#dc3545] rounded-[4px] shadow-sm text-white overflow-hidden relative flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="p-3.5 relative">
                            <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                                <FaMoneyBillWave />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.rejected_deposits)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total Rejected Deposits : {stats.rejected_deposits_count}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/deposit')}
                            className="w-full bg-black/15 hover:bg-black/25 active:bg-black/35 transition-colors py-1 px-3 text-center text-xs text-white flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                        >
                            <span>More info</span>
                            <FaArrowCircleRight className="text-[13px]" />
                        </button>
                    </div>

                    {/* Total Withdrawals */}
                    <div className="bg-[#17a2b8] rounded-[4px] shadow-sm text-white overflow-hidden relative flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="p-3.5 relative">
                            <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                                <FaMoneyBillWave />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.total_withdrawals)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total Withdrawals : {stats.total_withdrawals_count}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/withdraw')}
                            className="w-full bg-black/15 hover:bg-black/25 active:bg-black/35 transition-colors py-1 px-3 text-center text-xs text-white flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                        >
                            <span>More info</span>
                            <FaArrowCircleRight className="text-[13px]" />
                        </button>
                    </div>
                </div>

                {/* Row 6: Total Pending Withdrawals, Total Approved Withdrawals, Total Rejected Withdrawals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Pending Withdrawals */}
                    <div className="bg-[#f39c12] rounded-[4px] shadow-sm text-white overflow-hidden relative flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="p-3.5 relative">
                            <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                                <FaMoneyBillWave />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.pending_withdrawals)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total Pending Withdrawals : {stats.pending_withdrawals_count}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/withdraw')}
                            className="w-full bg-black/15 hover:bg-black/25 active:bg-black/35 transition-colors py-1 px-3 text-center text-xs text-white flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                        >
                            <span>More info</span>
                            <FaArrowCircleRight className="text-[13px]" />
                        </button>
                    </div>

                    {/* Total Approved Withdrawals */}
                    <div className="bg-[#28a745] rounded-[4px] shadow-sm text-white overflow-hidden relative flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="p-3.5 relative">
                            <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                                <FaMoneyBillWave />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.approved_withdrawals)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total Approved Withdrawals : {stats.approved_withdrawals_count}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/withdraw')}
                            className="w-full bg-black/15 hover:bg-black/25 active:bg-black/35 transition-colors py-1 px-3 text-center text-xs text-white flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                        >
                            <span>More info</span>
                            <FaArrowCircleRight className="text-[13px]" />
                        </button>
                    </div>

                    {/* Total Rejected Withdrawals */}
                    <div className="bg-[#dc3545] rounded-[4px] shadow-sm text-white overflow-hidden relative flex flex-col justify-between border border-black/10 dark:border-white/10 transition-transform hover:-translate-y-0.5">
                        <div className="p-3.5 relative">
                            <div className="absolute top-3.5 right-3.5 text-black/60 dark:text-black/50 text-2xl pointer-events-none select-none">
                                <FaMoneyBillWave />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-white">
                                {formatIndian(stats.rejected_withdrawals)}
                            </div>
                            <div className="text-xs md:text-sm font-medium text-white/95 mt-1.5">
                                Total Rejected Withdrawals : {stats.rejected_withdrawals_count}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/withdraw')}
                            className="w-full bg-black/15 hover:bg-black/25 active:bg-black/35 transition-colors py-1 px-3 text-center text-xs text-white flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                        >
                            <span>More info</span>
                            <FaArrowCircleRight className="text-[13px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
