import { useState, type FormEvent } from 'react'
import { usePageTitle } from '../components/Layout'
import { api } from '../lib/api'
import { fmtAmount, fmtDateTime, isoDay } from '../lib/format'
import { usePolling } from '../lib/usePolling'

function lastDays(n: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - n)
    return { start_date: isoDay(start), end_date: isoDay(end) }
}

export default function Statement() {
    usePageTitle('Account Statement')
    const [form, setForm] = useState(() => lastDays(30))
    const [range, setRange] = useState(form)
    const { data, error, loading } = usePolling(() => api.statement(range), 30000, `${range.start_date}|${range.end_date}`)
    const rows = data ?? []

    const submit = (e: FormEvent) => {
        e.preventDefault()
        setRange(form)
    }

    return (
        <div className="page">
            <div className="page-head">
                <h1>ACCOUNT STATEMENT</h1>
            </div>
            <form className="toolbar" onSubmit={submit}>
                <label className="inline-field">
                    From
                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </label>
                <label className="inline-field">
                    To
                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </label>
                <button type="submit" className="btn btn-primary">
                    Search
                </button>
            </form>
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
                        {rows.map((r) => (
                            <tr key={r.id}>
                                <td className="nowrap">{fmtDateTime(r.date)}</td>
                                <td>
                                    {r.description || r.type}
                                    {r.description && r.type && <small>{r.type}</small>}
                                </td>
                                <td className="num pos">{r.credit ? fmtAmount(r.credit) : ''}</td>
                                <td className="num neg">{r.debit ? fmtAmount(r.debit) : ''}</td>
                                <td className="num">{fmtAmount(r.balance)}</td>
                            </tr>
                        ))}
                        {!rows.length && (
                            <tr>
                                <td colSpan={5} className="empty-cell">
                                    {loading ? 'Loading…' : error ?? 'No entries in this period'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
