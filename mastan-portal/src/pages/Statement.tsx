import { useState } from 'react'
import { usePageTitle } from '../components/Layout'
import { api } from '../lib/api'
import { fmtAmount, fmtDateTime } from '../lib/format'
import { usePolling } from '../lib/usePolling'

export default function Statement() {
    usePageTitle('A/C Statement')
    const [draft, setDraft] = useState({ start_date: '', end_date: '' })
    const [range, setRange] = useState(draft)
    const { data, error, loading } = usePolling(() => api.statement(range), 30000, `${range.start_date}|${range.end_date}`)
    const rows = data ?? []

    return (
        <div className="page-panel">
            <form
                className="toolbar"
                onSubmit={(e) => {
                    e.preventDefault()
                    setRange(draft)
                }}
            >
                <label className="inline-field">
                    From
                    <input type="date" value={draft.start_date} onChange={(e) => setDraft((d) => ({ ...d, start_date: e.target.value }))} />
                </label>
                <label className="inline-field">
                    To
                    <input type="date" value={draft.end_date} onChange={(e) => setDraft((d) => ({ ...d, end_date: e.target.value }))} />
                </label>
                <button type="submit" className="btn btn-primary">
                    Search
                </button>
            </form>
            {error && <div className="error-box">{error}</div>}
            <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th className="num">Credit</th>
                            <th className="num">Debit</th>
                            <th className="num">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length ? (
                            rows.map((r) => (
                                <tr key={r.id}>
                                    <td className="nowrap">{fmtDateTime(r.date)}</td>
                                    <td>{r.description}</td>
                                    <td className="num pos">{r.credit ? fmtAmount(r.credit) : '-'}</td>
                                    <td className="num neg">{r.debit ? fmtAmount(r.debit) : '-'}</td>
                                    <td className="num strong">{fmtAmount(r.balance)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="empty-cell">
                                    {loading ? 'Loading…' : 'No transactions in this period'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
