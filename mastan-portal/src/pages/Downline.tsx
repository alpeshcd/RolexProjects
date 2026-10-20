import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useAuth } from '../auth/AuthContext'
import { usePageTitle, useToast } from '../components/Layout'
import Modal from '../components/Modal'
import { api } from '../lib/api'
import { fmtAmount, fmtDateTime } from '../lib/format'
import { usePolling } from '../lib/usePolling'
import { CREATE_ITEMS } from '../menus'
import type { Account, DownlineRow } from '../types'

const SCOPES = {
    '/clients/downline': { scope: 'downline', title: 'Down-Line' },
    '/clients/super-master': { scope: 'supermaster', title: 'Super Master' },
    '/clients/blocked': { scope: 'blocked', title: 'Blocked Users' },
} as const

function ChipModal({ row, action, me, onClose, onDone }: {
    row: DownlineRow
    action: 'deposit' | 'withdraw'
    me: Account
    onClose: () => void
    onDone: (updated: DownlineRow) => void
}) {
    const [amount, setAmount] = useState('')
    const [remark, setRemark] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)
    const value = Number(amount) || 0
    const deposit = action === 'deposit'

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
            onDone(await api.transferChips(row, action, value, remark.trim()))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transfer failed')
            setBusy(false)
        }
    }

    return (
        <Modal title={`${deposit ? 'Deposit' : 'Withdraw'} — ${row.username}`} onClose={onClose}>
            <form onSubmit={submit}>
                <table className="data-table compact transfer-table">
                    <thead>
                        <tr>
                            <th>Account</th>
                            <th>Balance</th>
                            <th>After</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{me.username}</td>
                            <td>{fmtAmount(me.balance)}</td>
                            <td>{fmtAmount(deposit ? me.balance - value : me.balance + value)}</td>
                        </tr>
                        <tr>
                            <td>{row.username}</td>
                            <td>{fmtAmount(row.balance)}</td>
                            <td>{fmtAmount(deposit ? row.balance + value : row.balance - value)}</td>
                        </tr>
                    </tbody>
                </table>
                <label className="field">
                    <span>Amount</span>
                    <input
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                        required
                    />
                </label>
                <label className="field">
                    <span>Remark</span>
                    <input value={remark} onChange={(e) => setRemark(e.target.value)} maxLength={200} />
                </label>
                {error && <p className="form-error">{error}</p>}
                <div className="form-actions">
                    <button type="button" className="btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className={`btn ${deposit ? 'btn-green' : 'btn-red'}`} disabled={busy || value <= 0}>
                        {busy ? 'Saving…' : deposit ? 'Deposit' : 'Withdraw'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

function PasswordModal({ row, onClose, onDone }: { row: DownlineRow; onClose: () => void; onDone: () => void }) {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (password !== confirm) {
            setError('Passwords do not match')
            return
        }
        setBusy(true)
        setError(null)
        try {
            await api.setPassword(row, password)
            onDone()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not change password')
            setBusy(false)
        }
    }

    return (
        <Modal title={`Change Password — ${row.username}`} onClose={onClose}>
            <form onSubmit={submit}>
                <label className="field">
                    <span>New Password</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} autoFocus required autoComplete="new-password" />
                </label>
                <label className="field">
                    <span>Confirm Password</span>
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required autoComplete="new-password" />
                </label>
                {error && <p className="form-error">{error}</p>}
                <div className="form-actions">
                    <button type="button" className="btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? 'Saving…' : 'Change Password'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default function Downline() {
    const { pathname } = useLocation()
    const { scope, title } = SCOPES[pathname as keyof typeof SCOPES] ?? SCOPES['/clients/downline']
    usePageTitle(title)
    const me = useAccount()
    const { refresh } = useAuth()
    const toast = useToast()
    const { data, error, loading, reload, setData } = usePolling(() => api.downline(scope), 15000, scope)
    const [search, setSearch] = useState('')
    const [chip, setChip] = useState<{ row: DownlineRow; action: 'deposit' | 'withdraw' } | null>(null)
    const [pwdRow, setPwdRow] = useState<DownlineRow | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)

    const rows = (data ?? []).filter((r) => r.username.toLowerCase().includes(search.trim().toLowerCase()))
    const total = (key: 'balance' | 'exposure' | 'available' | 'credit_reference') =>
        rows.reduce((sum, r) => sum + r[key], 0)
    const rowKey = (r: DownlineRow) => `${r.kind}-${r.id}`
    const replaceRow = (updated: DownlineRow) =>
        setData((current) => current?.map((r) => (rowKey(r) === rowKey(updated) ? updated : r)) ?? null)

    const toggleLock = async (row: DownlineRow) => {
        const verb = row.is_active ? 'Lock' : 'Unlock'
        if (!window.confirm(`${verb} ${row.username}?`)) return
        setBusyId(rowKey(row))
        try {
            const updated = await api.setStatus(row, !row.is_active)
            toast(`${updated.username} ${updated.is_active ? 'unlocked' : 'locked'}`)
            // Locking moves a row in or out of Blocked Users
            if (scope === 'blocked') reload()
            else replaceRow(updated)
        } catch (err) {
            toast(err instanceof Error ? err.message : `${verb} failed`, 'error')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="page-panel">
            <div className="toolbar">
                <input
                    className="search"
                    placeholder="Search username"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search username"
                />
                <button type="button" className="btn" onClick={reload}>
                    Refresh
                </button>
                <span className="toolbar-spacer" />
                {me.child_roles.map((role) =>
                    role === 'admin' ? null : (
                        <Link key={role} to={CREATE_ITEMS[role].to} className="btn btn-primary">
                            + {CREATE_ITEMS[role].label}
                        </Link>
                    ),
                )}
            </div>

            {error && !data && <div className="error-box">{error}</div>}
            <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Type</th>
                            <th>Upline</th>
                            <th className="num">Credit Ref.</th>
                            <th className="num">Balance</th>
                            <th className="num">Exposure</th>
                            <th className="num">Avail. Bal.</th>
                            <th className="num">P/L</th>
                            <th className="num">Share %</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && !data ? (
                            <tr>
                                <td colSpan={12} className="empty-cell">
                                    Loading…
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="empty-cell">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            rows.map((r) => (
                                <tr key={rowKey(r)} className={r.is_active ? '' : 'row-locked'}>
                                    <td className="strong">
                                        {r.username}
                                        {r.full_name && r.full_name !== r.username && <small className="sub">{r.full_name}</small>}
                                    </td>
                                    <td>
                                        <span className={`role-chip role-${r.role}`}>{r.role_label}</span>
                                    </td>
                                    <td>{r.parent ?? '-'}</td>
                                    <td className="num">{fmtAmount(r.credit_reference)}</td>
                                    <td className="num strong">{fmtAmount(r.balance)}</td>
                                    <td className="num neg">{fmtAmount(r.exposure)}</td>
                                    <td className="num">{fmtAmount(r.available)}</td>
                                    <td className={`num ${r.pl < 0 ? 'neg' : 'pos'}`}>{fmtAmount(r.pl)}</td>
                                    <td className="num">{r.kind === 'account' ? `${r.partnership}%` : '-'}</td>
                                    <td>
                                        <span className={`status ${r.is_active ? 'on' : 'off'}`}>{r.is_active ? 'Active' : 'Locked'}</span>
                                    </td>
                                    <td className="nowrap">{fmtDateTime(r.created_at)}</td>
                                    <td>
                                        <div className="actions">
                                            {scope === 'downline' && (
                                                <>
                                                    <button type="button" className="act act-d" onClick={() => setChip({ row: r, action: 'deposit' })} title="Deposit chips">
                                                        D
                                                    </button>
                                                    <button type="button" className="act act-w" onClick={() => setChip({ row: r, action: 'withdraw' })} title="Withdraw chips">
                                                        W
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                className="act"
                                                onClick={() => toggleLock(r)}
                                                disabled={busyId === rowKey(r)}
                                                title={r.is_active ? 'Lock user' : 'Unlock user'}
                                            >
                                                {r.is_active ? '🔒' : '🔓'}
                                            </button>
                                            <button type="button" className="act" onClick={() => setPwdRow(r)} title="Change password">
                                                🔑
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {rows.length > 0 && (
                        <tfoot>
                            <tr>
                                <td colSpan={3}>Total ({rows.length})</td>
                                <td className="num">{fmtAmount(total('credit_reference'))}</td>
                                <td className="num">{fmtAmount(total('balance'))}</td>
                                <td className="num">{fmtAmount(total('exposure'))}</td>
                                <td className="num">{fmtAmount(total('available'))}</td>
                                <td colSpan={5} />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {chip && (
                <ChipModal
                    row={chip.row}
                    action={chip.action}
                    me={me}
                    onClose={() => setChip(null)}
                    onDone={(updated) => {
                        replaceRow(updated)
                        setChip(null)
                        toast(`${chip.action === 'deposit' ? 'Deposited to' : 'Withdrawn from'} ${updated.username}`)
                        refresh().catch(() => undefined)
                    }}
                />
            )}
            {pwdRow && (
                <PasswordModal
                    row={pwdRow}
                    onClose={() => setPwdRow(null)}
                    onDone={() => {
                        toast(`Password changed for ${pwdRow.username}`)
                        setPwdRow(null)
                    }}
                />
            )}
        </div>
    )
}
