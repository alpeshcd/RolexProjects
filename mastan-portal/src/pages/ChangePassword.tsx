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
            setError('New passwords do not match')
            return
        }
        setBusy(true)
        setError(null)
        try {
            await api.changePassword(form.old, form.next)
            toast('Password changed')
            setForm({ old: '', next: '', confirm: '' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not change password')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="page-panel narrow">
            <form className="form-card" onSubmit={submit}>
                <label className="field">
                    <span>Old Password</span>
                    <input type="password" value={form.old} onChange={(e) => setForm((f) => ({ ...f, old: e.target.value }))} required autoComplete="current-password" />
                </label>
                <label className="field">
                    <span>New Password</span>
                    <input type="password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} minLength={6} required autoComplete="new-password" />
                </label>
                <label className="field">
                    <span>Confirm New Password</span>
                    <input type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} minLength={6} required autoComplete="new-password" />
                </label>
                {error && <p className="form-error">{error}</p>}
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? 'Saving…' : 'Change Password'}
                    </button>
                </div>
            </form>
        </div>
    )
}
