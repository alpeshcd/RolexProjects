import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import Logo from './Logo'

interface Props {
    mode: 'login' | 'signup' | 'rules'
    onClose: () => void
}

export default function AuthModal({ mode, onClose }: Props) {
    const { portal, login } = useAuth()
    const [tab, setTab] = useState<'login' | 'signup' | 'rules'>(mode)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
            await login(username.trim(), password)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
                    ×
                </button>
                <div className="modal-header">
                    <Logo brand={portal?.brand_name} size="md" />
                </div>

                <div className="modal-tabs">
                    <button
                        type="button"
                        className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
                        onClick={() => { setTab('login'); setError(null) }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`modal-tab ${tab === 'signup' ? 'active' : ''}`}
                        onClick={() => { setTab('signup'); setError(null) }}
                    >
                        Signup
                    </button>
                    <button
                        type="button"
                        className={`modal-tab ${tab === 'rules' ? 'active' : ''}`}
                        onClick={() => { setTab('rules'); setError(null) }}
                    >
                        Rules
                    </button>
                </div>

                <div className="modal-body">
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="modal-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    autoFocus
                                    required
                                    disabled={busy}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={busy}
                                />
                            </div>
                            {error && <div className="modal-error">{error}</div>}
                            <button type="submit" className="btn-modal-submit" disabled={busy}>
                                {busy ? 'Signing In…' : 'LOGIN'}
                            </button>
                            <p className="modal-hint">Forgot your password? Please contact your upline master.</p>
                        </form>
                    )}

                    {tab === 'signup' && (
                        <div className="signup-info">
                            <h3>Create an Account</h3>
                            <p>To register a new player ID on this exchange, please contact our 24/7 WhatsApp or Telegram customer service desk or your upline Master agent.</p>
                            <div className="signup-contact-card">
                                <div><b>Customer Desk:</b> Available 24/7</div>
                                <div><b>Instant Deposit &amp; Withdrawal</b></div>
                                <div><b>Minimum Bet:</b> ₹100</div>
                            </div>
                            <button type="button" className="btn-modal-submit" onClick={() => setTab('login')}>
                                Back to Login
                            </button>
                        </div>
                    )}

                    {tab === 'rules' && (
                        <div className="rules-content">
                            <h3>Exchange Rules &amp; Regulations</h3>
                            <ul>
                                <li>All bets are accepted based on the official exchange market rules.</li>
                                <li>Match Odds, Bookmaker and Fancy bets are settled immediately upon official match results.</li>
                                <li>In the event of match abandonment or rain interruption, bets are settled per international ICC / federation standard rules.</li>
                                <li>Duplicate accounts or automated bot betting is strictly prohibited.</li>
                                <li>Maximum payout limits apply according to your account level and market limits.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
