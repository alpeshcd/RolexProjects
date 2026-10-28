import { useState, type FormEvent } from 'react'
import { usePageTitle, useToast } from '../components/Layout'
import { api } from '../lib/api'

export default function ChangePassword() {
    usePageTitle('Change Password')
    const toast = useToast()
    const [form, setForm] = useState({ old: '', next: '', confirm: '' })
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (form.next !== form.confirm) {
            setError('New password and confirmation do not match')
            return
        }
        setBusy(true)
        setError(null)
        try {
            await api.changePassword(form.old, form.next)
            toast('Password changed')
            setForm({ old: '', next: '', confirm: '' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not change the password')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <h1>CHANGE PASSWORD</h1>
            </div>
            <form className="form-card" onSubmit={submit}>
                <label className="field">
                    <span>Old password</span>
                    <input type="password" value={form.old} onChange={(e) => setForm({ ...form, old: e.target.value })} autoComplete="current-password" required />
                </label>
                <label className="field">
                    <span>New password</span>
                    <input type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} autoComplete="new-password" minLength={6} required />
                </label>
                <label className="field">
                    <span>Confirm new password</span>
                    <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" minLength={6} required />
                </label>
                {error && <p className="form-error">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? 'Saving…' : 'Change Password'}
                </button>
            </form>
        </div>
    )
}
