import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAccount } from '../auth/AuthContext'
import { usePageTitle, useToast } from '../components/Layout'
import { api } from '../lib/api'
import { CREATE_ITEMS } from '../menus'
import type { Role } from '../types'

export default function CreateUser() {
    const role = useParams().role as Exclude<Role, 'admin'>
    const item = CREATE_ITEMS[role]
    const me = useAccount()
    const toast = useToast()
    const navigate = useNavigate()
    usePageTitle(item ? `Create ${item.label}` : 'Create User')

    const [form, setForm] = useState({
        username: '',
        full_name: '',
        password: '',
        confirm: '',
        credit_reference: '',
        partnership: '',
        mobile: '',
    })
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)
    const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
        setForm((f) => ({ ...f, [key]: e.target.value }))

    if (!item || !me.child_roles.includes(role)) {
        return (
            <div className="error-box">
                Your account ({me.role_label}) can't create this user type. <Link to="/clients/downline">Go to Down-Line</Link>
            </div>
        )
    }
    const isClient = role === 'client'

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (form.password !== form.confirm) {
            setError('Passwords do not match')
            return
        }
        setBusy(true)
        setError(null)
        try {
            const created = await api.createDownline({
                role,
                username: form.username.trim(),
                full_name: form.full_name.trim() || undefined,
                password: form.password,
                credit_reference: isClient ? undefined : Number(form.credit_reference) || 0,
                partnership: isClient ? undefined : Number(form.partnership) || 0,
                mobile: isClient ? form.mobile.trim() || undefined : undefined,
            })
            toast(`${item.label} ${created.username} created`)
            navigate('/clients/downline')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create user')
            setBusy(false)
        }
    }

    return (
        <div className="page-panel narrow">
            <form className="form-card" onSubmit={submit}>
                <div className="form-card-head">
                    <span className="dd-letter">{item.letter}</span>
                    New {item.label} under <b>{me.username}</b>
                </div>
                <label className="field">
                    <span>Username</span>
                    <input
                        value={form.username}
                        onChange={set('username')}
                        pattern="[A-Za-z0-9_]{4,20}"
                        title="4–20 letters, numbers or _"
                        autoComplete="off"
                        autoFocus
                        required
                    />
                </label>
                <label className="field">
                    <span>Full Name</span>
                    <input value={form.full_name} onChange={set('full_name')} maxLength={100} />
                </label>
                <div className="field-row">
                    <label className="field">
                        <span>Password</span>
                        <input type="password" value={form.password} onChange={set('password')} minLength={6} required autoComplete="new-password" />
                    </label>
                    <label className="field">
                        <span>Confirm Password</span>
                        <input type="password" value={form.confirm} onChange={set('confirm')} minLength={6} required autoComplete="new-password" />
                    </label>
                </div>
                {isClient ? (
                    <label className="field">
                        <span>Mobile</span>
                        <input value={form.mobile} onChange={set('mobile')} inputMode="tel" maxLength={20} />
                    </label>
                ) : (
                    <div className="field-row">
                        <label className="field">
                            <span>Credit Reference</span>
                            <input type="number" min="0" step="1" value={form.credit_reference} onChange={set('credit_reference')} />
                        </label>
                        <label className="field">
                            <span>Partnership % (max {me.partnership}%)</span>
                            <input type="number" min="0" max={me.partnership} step="0.5" value={form.partnership} onChange={set('partnership')} />
                        </label>
                    </div>
                )}
                <p className="hint">
                    {isClient
                        ? 'The client is also added to Rolex Admin (Clients) under this domain.'
                        : 'Chips start at 0 — use D on the Down-Line page to give chips.'}
                </p>
                {error && <p className="form-error">{error}</p>}
                <div className="form-actions">
                    <Link to="/clients/downline" className="btn">
                        Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? 'Creating…' : `Create ${item.label}`}
                    </button>
                </div>
            </form>
        </div>
    )
}
