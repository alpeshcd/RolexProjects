import { useState, useEffect } from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetSiteStats } from '@/services/StatementsService'
import type { SiteStatRow } from '@/@types/statement'
import {
    HiSearch,
    HiRefresh,
    HiTrendingUp,
    HiTrendingDown,
    HiUserGroup,
    HiCash,
    HiOutlineChartBar,
} from 'react-icons/hi'
import { MdAnalytics } from 'react-icons/md'

const SiteStatsView = () => {
    const [stats, setStats] = useState<SiteStatRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [startDate, setStartDate] = useState<string>('2026-10-08')
    const [endDate, setEndDate] = useState<string>('2026-10-15')

    const fetchStats = async () => {
        setLoading(true)
        try {
            const data = await apiGetSiteStats()
            setStats(data)
        } catch (err: any) {
            console.error('Failed to load stats', err)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to fetch user stats.
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    // Totals calculations
    const sumClients = stats.reduce((acc, curr) => acc + curr.total_clients, 0)
    const sumAppDepAmt = stats.reduce((acc, curr) => acc + curr.total_approved_deposit, 0)
    const sumAppDepCount = stats.reduce((acc, curr) => acc + curr.number_approved_deposit, 0)
    const sumRejDepAmt = stats.reduce((acc, curr) => acc + curr.total_rejected_deposit, 0)
    const sumRejDepCount = stats.reduce((acc, curr) => acc + curr.number_rejected_deposit, 0)
    const sumAppWithAmt = stats.reduce((acc, curr) => acc + curr.total_approved_withdraw, 0)
    const sumAppWithCount = stats.reduce((acc, curr) => acc + curr.number_approved_withdraw, 0)
    const sumRejWithAmt = stats.reduce((acc, curr) => acc + curr.total_rejected_withdraw, 0)
    const sumRejWithCount = stats.reduce((acc, curr) => acc + curr.number_rejected_withdraw, 0)

    return (
        <div className="space-y-6 pb-12">
            {/* Top Luxury Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                        <span>Rolex Platform Analytics</span>
                        <span>•</span>
                        <span>Master Portal Metrics</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <MdAnalytics className="text-emerald-400 text-3xl" />
                        <span>SITE USER STATS & PERFORMANCE MATRIX</span>
                    </h1>
                    <p className="text-xs text-slate-300 mt-1">
                        Real-time player volume, deposit approvals vs rejections, and withdrawal payout ratios across master domains.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchStats}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition self-start md:self-auto"
                    title="Reload Statistics"
                >
                    <HiRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Active Clients
                        </div>
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                            {sumClients}
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl font-bold">
                        <HiUserGroup />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Approved Deposits
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            ₹{sumAppDepAmt.toLocaleString('en-IN')}{' '}
                            <span className="text-xs font-bold text-slate-400">({sumAppDepCount})</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl font-bold">
                        <HiTrendingUp />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Approved Withdrawals
                        </div>
                        <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                            ₹{sumAppWithAmt.toLocaleString('en-IN')}{' '}
                            <span className="text-xs font-bold text-slate-400">({sumAppWithCount})</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-2xl font-bold">
                        <HiCash />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Rejections
                        </div>
                        <div className="text-2xl font-black text-rose-500 mt-1">
                            ₹{(sumRejDepAmt + sumRejWithAmt).toLocaleString('en-IN')}{' '}
                            <span className="text-xs font-bold text-slate-400">({sumRejDepCount + sumRejWithCount})</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl font-bold">
                        <HiTrendingDown />
                    </div>
                </div>
            </div>

            {/* Date Search Filter Bar matching Screenshot 2 */}
            <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-56">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Start Date:
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                    </div>

                    <div className="w-56">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            End Date:
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={fetchStats}
                        className="px-8 py-2.5 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-2 transition"
                    >
                        <HiSearch className="text-base" />
                        <span>Search</span>
                    </button>
                </div>
            </div>

            {/* Color-Coded Master Stats Table matching Screenshot 2 */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="py-3 px-3">NO</th>
                                <th className="py-3 px-3">ID</th>
                                <th className="py-3 px-3">USERNAME</th>
                                <th className="py-3 px-3 text-center bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-l border-r border-blue-100 dark:border-blue-900">
                                    TOTAL CLIENTS
                                </th>
                                <th className="py-3 px-3 text-right bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                    TOTAL APPROVED DEPOSIT
                                </th>
                                <th className="py-3 px-3 text-center bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-r border-emerald-100 dark:border-emerald-900">
                                    NUMBER APPROVED DEPOSIT
                                </th>
                                <th className="py-3 px-3 text-right bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                                    TOTAL REJECTED DEPOSIT
                                </th>
                                <th className="py-3 px-3 text-center bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-r border-rose-100 dark:border-rose-900">
                                    NUMBER REJECTED DEPOSIT
                                </th>
                                <th className="py-3 px-3 text-right bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                    TOTAL APPROVED WITHDRAW
                                </th>
                                <th className="py-3 px-3 text-center bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-r border-emerald-100 dark:border-emerald-900">
                                    NUMBER APPROVED WITHDRAW
                                </th>
                                <th className="py-3 px-3 text-right bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                                    TOTAL REJECTED WITHDRAW
                                </th>
                                <th className="py-3 px-3 text-center bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                                    NUMBER REJECTED WITHDRAW
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stats.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                    <td className="py-3.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                                    <td className="py-3.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {row.master_id}
                                    </td>
                                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                                        {row.username}
                                    </td>

                                    {/* Total Clients (Blue) */}
                                    <td className="py-3.5 px-3 text-center font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20 border-l border-r border-blue-100 dark:border-blue-900/60">
                                        {row.total_clients}
                                    </td>

                                    {/* Approved Deposits (Green) */}
                                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                                        ₹{row.total_approved_deposit.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-r border-emerald-100 dark:border-emerald-900/60">
                                        {row.number_approved_deposit}
                                    </td>

                                    {/* Rejected Deposits (Red) */}
                                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20">
                                        ₹{row.total_rejected_deposit.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 border-r border-rose-100 dark:border-rose-900/60">
                                        {row.number_rejected_deposit}
                                    </td>

                                    {/* Approved Withdrawals (Green) */}
                                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                                        ₹{row.total_approved_withdraw.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-r border-emerald-100 dark:border-emerald-900/60">
                                        {row.number_approved_withdraw}
                                    </td>

                                    {/* Rejected Withdrawals (Red) */}
                                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20">
                                        ₹{row.total_rejected_withdraw.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20">
                                        {row.number_rejected_withdraw}
                                    </td>
                                </tr>
                            ))}

                            {/* Sticky Total Row matching Screenshot 2 */}
                            <tr className="bg-slate-200/80 dark:bg-slate-900 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                <td colSpan={3} className="py-4 px-3 text-right uppercase tracking-wider text-xs">
                                    Total :
                                </td>
                                <td className="py-4 px-3 text-center text-sm font-black text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/40 border-l border-r border-blue-200 dark:border-blue-800">
                                    {sumClients}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-sm font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40">
                                    ₹{sumAppDepAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-3 text-center font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 border-r border-emerald-200 dark:border-emerald-800">
                                    {sumAppDepCount}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-sm font-black text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/40">
                                    ₹{sumRejDepAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-3 text-center font-black text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/40 border-r border-rose-200 dark:border-rose-800">
                                    {sumRejDepCount}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-sm font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40">
                                    ₹{sumAppWithAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-3 text-center font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 border-r border-emerald-200 dark:border-emerald-800">
                                    {sumAppWithCount}
                                </td>
                                <td className="py-4 px-3 text-right font-mono text-sm font-black text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/40">
                                    ₹{sumRejWithAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-3 text-center font-black text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/40">
                                    {sumRejWithCount}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default SiteStatsView
