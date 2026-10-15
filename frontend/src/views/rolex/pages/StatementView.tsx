import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import { apiGetAccountStatements } from '@/services/StatementsService'
import type { StatementItem } from '@/@types/statement'
import {
    HiSearch,
    HiRefresh,
    HiDocumentDownload,
    HiOutlineDocumentText,
    HiCash,
    HiTrendingUp,
    HiTrendingDown,
    HiScale,
} from 'react-icons/hi'
import { MdReceiptLong } from 'react-icons/md'

const StatementView = () => {
    const location = useLocation()
    const queryUser = new URLSearchParams(location.search).get('user') || new URLSearchParams(location.search).get('username') || ''

    const [statements, setStatements] = useState<StatementItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Filter states
    const [selectedUser, setSelectedUser] = useState<string>(queryUser || 'Mastan777 (mastan247.club)')
    const [selectedType, setSelectedType] = useState<string>('')
    const [selectedDetail, setSelectedDetail] = useState<StatementItem | null>(null)

    const fetchStatements = async () => {
        setLoading(true)
        try {
            const data = await apiGetAccountStatements()
            setStatements(data)
        } catch (err: any) {
            console.error('Failed to load statements', err)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to fetch statement records.
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatements()
    }, [])

    const filteredStatements = statements.filter((item) => {
        if (selectedType && selectedType !== 'Select type' && selectedType !== 'All') {
            if (item.type.toLowerCase() !== selectedType.toLowerCase()) return false
        }
        if (selectedUser && selectedUser !== 'All') {
            const cleanUser = selectedUser.split(' ')[0].toLowerCase()
            if (!item.site_user.toLowerCase().includes(cleanUser)) return false
        }
        return true
    })

    // Totals
    const totalCredit = filteredStatements
        .filter((s) => s.dc === 'Credit')
        .reduce((acc, curr) => acc + Math.abs(curr.amount), 0)

    const totalDebit = filteredStatements
        .filter((s) => s.dc === 'Debit')
        .reduce((acc, curr) => acc + Math.abs(curr.amount), 0)

    const netDifference = totalCredit - totalDebit
    const currentBalance = filteredStatements.length > 0 ? filteredStatements[0].balance : 762427.20

    const exportToCSV = () => {
        const headers = ['NO,DATE,EVENT TYPE,AMOUNT,TOTAL,BALANCE,TYPE,D/C,DESCRIPTION\n']
        const rows = filteredStatements.map((s, idx) =>
            [
                idx + 1,
                `"${s.date_str || ''}"`,
                `"${s.event_type}"`,
                s.amount,
                s.total,
                s.balance,
                `"${s.type}"`,
                `"${s.dc}"`,
                `"${(s.description || '').replace(/"/g, '""')}"`,
            ].join(',')
        )
        const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Account_Statement_${Date.now()}.csv`
        a.click()
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Top Luxury Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                        <span>Rolex Ledger Engine</span>
                        <span>•</span>
                        <span>Multi-Currency Audit</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <MdReceiptLong className="text-emerald-400 text-3xl" />
                        <span>ACCOUNT STATEMENT ({selectedUser.toUpperCase()})</span>
                    </h1>
                    <p className="text-xs text-slate-300 mt-1">
                        Comprehensive ledger audit trail, market odds settlement, casino rounds, and balance reconciliation.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-700 shadow flex items-center gap-2 transition"
                    >
                        <HiDocumentDownload className="text-base text-emerald-400" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        type="button"
                        onClick={fetchStatements}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
                        title="Reload Statements"
                    >
                        <HiRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Overview Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Closing Ledger
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-2xl font-bold">
                        <HiScale />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Credits
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            +₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl font-bold">
                        <HiTrendingUp />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Debits
                        </div>
                        <div className="text-2xl font-black text-rose-500 mt-1">
                            -₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl font-bold">
                        <HiTrendingDown />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Net Period P&L
                        </div>
                        <div
                            className={`text-2xl font-black mt-1 ${
                                netDifference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                            }`}
                        >
                            {netDifference >= 0 ? '+' : ''}₹{netDifference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-2xl font-bold">
                        <HiCash />
                    </div>
                </div>
            </div>

            {/* Filter Bar matching Screenshot 1 */}
            <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[260px]">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Site Users:
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        >
                            <option value="Mastan777 (mastan247.club)">Mastan777 (mastan247.club)</option>
                            <option value="Mastan365m (mastan365.com)">Mastan365m (mastan365.com)</option>
                            <option value="Mastan99m (mastan99.com)">Mastan99m (mastan99.com)</option>
                            <option value="Mastanreddymas (mastanreddy.com)">Mastanreddymas (mastanreddy.com)</option>
                        </select>
                    </div>

                    <div className="w-64">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Type:
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        >
                            <option value="Select type">Select type</option>
                            <option value="All">All Types</option>
                            <option value="Profit & Loss">Profit & Loss</option>
                            <option value="Withdraw">Withdraw</option>
                            <option value="Deposit">Deposit</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={fetchStatements}
                        className="px-8 py-2.5 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-2 transition"
                    >
                        <HiSearch className="text-base" />
                        <span>Search</span>
                    </button>
                </div>
            </div>

            {/* Account Statement Ledger Table */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="py-3 px-3">NO</th>
                                <th className="py-3 px-3 min-w-[170px]">DATE</th>
                                <th className="py-3 px-3">EVENT TYPE</th>
                                <th className="py-3 px-3 text-right">AMOUNT</th>
                                <th className="py-3 px-3 text-right">TOTAL</th>
                                <th className="py-3 px-3 text-right">BALANCE</th>
                                <th className="py-3 px-3 text-center">TYPE</th>
                                <th className="py-3 px-3 text-center">D/C</th>
                                <th className="py-3 px-3 min-w-[340px]">DESC [15/10/2026 15:14:02:5590]</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                            {filteredStatements.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                                        No Statement Entries Available
                                    </td>
                                </tr>
                            ) : (
                                filteredStatements.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedDetail(item)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition"
                                    >
                                        <td className="py-3.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                                        <td className="py-3.5 px-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                            {item.date_str}
                                        </td>
                                        <td className="py-3.5 px-3">
                                            {item.event_type === 'Tennis' ? (
                                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                    🎾 Tennis
                                                </span>
                                            ) : item.event_type === 'Cricket' ? (
                                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                    🏏 Cricket
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-mono">-</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-right font-mono font-bold text-xs">
                                            <span
                                                className={
                                                    item.amount > 0
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : item.amount < 0
                                                        ? 'text-rose-500'
                                                        : 'text-slate-500'
                                                }
                                            >
                                                {item.amount > 0 ? '+' : ''}
                                                {item.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                                            {item.total.toFixed(2)}
                                        </td>
                                        <td className="py-3.5 px-3 text-right font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                                            {item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.dc === 'Credit' ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                                                    Credit
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700">
                                                    Debit
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                                            <div className="hover:text-teal-600 transition truncate max-w-[500px]" title={item.description}>
                                                {item.description}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Entry Detail Dialog */}
            <Dialog
                isOpen={Boolean(selectedDetail)}
                onClose={() => setSelectedDetail(null)}
                onRequestClose={() => setSelectedDetail(null)}
                width={500}
            >
                {selectedDetail && (
                    <div className="space-y-4 p-2">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <MdReceiptLong className="text-xl text-[#008080]" />
                                <span>Ledger Entry Audit</span>
                            </h3>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    selectedDetail.dc === 'Credit'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                {selectedDetail.dc}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Timestamp:</span>
                                <span>{selectedDetail.date_str}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Account:</span>
                                <span>{selectedDetail.site_user}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Event Category:</span>
                                <span>{selectedDetail.event_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Transaction Type:</span>
                                <span>{selectedDetail.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Ledger Amount:</span>
                                <span className={selectedDetail.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                                    ₹{selectedDetail.amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Updated Balance:</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                    ₹{selectedDetail.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Market / Bet Slip Description:
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {selectedDetail.description}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setSelectedDetail(null)}
                                className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default StatementView
