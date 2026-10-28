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
            <div className="login-logo">
                <Logo brand={portal?.brand_name ?? ''} size="lg" />
            </div>
            <form className="login-card" onSubmit={submit}>
                <h1>LOGIN</h1>
                {portalError ? (
                    <p className="form-error">{portalError}. This site is not set up yet.</p>
                ) : (
                    <>
                        <label className="login-field">
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                aria-label="Username"
                                autoComplete="username"
                                autoCapitalize="characters"
                                autoFocus
                                required
                            />
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-9 2.2-9 5v3h18v-3c0-2.8-4.6-5-9-5z" />
                            </svg>
                        </label>
                        <label className="login-field">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                aria-label="Password"
                                autoComplete="current-password"
                                required
                            />
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M7 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.6-4A6 6 0 1 0 12.6 14H16v3h3v-3h2v-4z" />
                            </svg>
                        </label>
                        {error && <p className="form-error">{error}</p>}
                        <button type="submit" className="btn btn-primary btn-block" disabled={busy || !portal}>
                            {busy ? 'Signing in…' : 'Login'}
                        </button>
                        <p className="login-help">Forgot your password? Ask your master to reset it.</p>
                    </>
                )}
                <p className="login-domain">{portal?.domain_url ?? portalHost()}</p>
            </form>
        </div>
    )
}
