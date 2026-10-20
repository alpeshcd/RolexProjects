import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Logo from '../components/Logo'
import { portalHost } from '../lib/portal'

export default function Login() {
    const { portal, portalError, account, login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    if (account) return <Navigate to="/home" replace />

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
            await login(username.trim(), password)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={submit}>
                <div className="login-logo">
                    <Logo brand={portal?.brand_name ?? 'MASTER PANEL'} size="lg" />
                </div>
                <h1>Master Panel Login</h1>
                {portalError ? (
                    <p className="form-error">
                        {portalError}. Add this domain under Global Search → Portals in Rolex Admin, or open the panel
                        as <b>{'<portal>'}.localhost</b>.
                    </p>
                ) : (
                    <>
                        <label className="field">
                            <span>Username</span>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoFocus
                                required
                            />
                        </label>
                        <label className="field">
                            <span>Password</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </label>
                        {error && <p className="form-error">{error}</p>}
                        <button type="submit" className="btn btn-primary btn-block" disabled={busy || !portal}>
                            {busy ? 'Signing in…' : 'LOGIN'}
                        </button>
                    </>
                )}
                <p className="login-domain">{portal?.domain_url ?? portalHost()}</p>
            </form>
        </div>
    )
}
