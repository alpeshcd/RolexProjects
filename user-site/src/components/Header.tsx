import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { fmtAmount } from '../lib/format'
import AuthModal from './AuthModal'
import { useLayout } from './Layout'
import Logo from './Logo'

function UserMenu() {
    const { account, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const { pathname } = useLocation()

    useEffect(() => setOpen(false), [pathname])
    useEffect(() => {
        if (!open) return
        const onDown = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    if (!account) return null

    return (
        <div className="dd" ref={ref}>
            <button type="button" className="dd-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                <span className="dd-user">{account.username}</span>
                <span className="caret" aria-hidden="true">▾</span>
            </button>
            {open && (
                <div className="dd-menu" onClick={() => setOpen(false)}>
                    <div className="dd-balance">
                        <span>Main balance</span>
                        <b>{fmtAmount(account.balance)}</b>
                    </div>
                    <Link to="/bets" className="dd-item">
                        My Bets
                    </Link>
                    <Link to="/statement" className="dd-item">
                        Account Statement
                    </Link>
                    <Link to="/change-password" className="dd-item">
                        Change Password
                    </Link>
                    <button type="button" className="dd-item dd-logout" onClick={logout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}

export default function Header() {
    const { portal, account } = useAuth()
    const { toggleMobileSidebar } = useLayout()
    const [modalMode, setModalMode] = useState<'login' | 'signup' | 'rules' | null>(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <>
            <header className="topbar">
                <div className="topbar-left">
                    <button
                        type="button"
                        className="hamburger-btn"
                        onClick={toggleMobileSidebar}
                        aria-label="Sports directory menu"
                    >
                        <span className="ham-line"></span>
                        <span className="ham-line"></span>
                        <span className="ham-line"></span>
                    </button>
                    <Link to="/home" className="brand" aria-label="Home">
                        <Logo brand={portal?.brand_name || 'MASTAN99'} />
                    </Link>
                </div>

                <div className="topbar-right">
                    {/* Search button / bar */}
                    <div className="search-wrap">
                        {searchOpen ? (
                            <div className="search-box">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search match or team…"
                                    autoFocus
                                    onBlur={() => !searchQuery && setSearchOpen(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setSearchOpen(false)
                                    }}
                                />
                                <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
                                    ×
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="icon-btn search-toggle"
                                onClick={() => setSearchOpen(true)}
                                title="Search"
                                aria-label="Search matches"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Rules */}
                    <button
                        type="button"
                        className="top-link-rules"
                        onClick={() => setModalMode('rules')}
                    >
                        Rules
                    </button>

                    {/* If signed in: Balance + User Menu */}
                    {account ? (
                        <div className="user-logged-wrap">
                            <div className="balance-box">
                                <div>
                                    Bal: <b>{fmtAmount(account.available)}</b>
                                </div>
                                <div>
                                    Exp: <b className={account.exposure > 0 ? 'neg' : undefined}>{fmtAmount(account.exposure)}</b>
                                </div>
                            </div>
                            <UserMenu />
                        </div>
                    ) : (
                        /* If not signed in: Signup & Login buttons matching Screenshot 1 */
                        <div className="auth-btns">
                            <button
                                type="button"
                                className="btn-top-signup"
                                onClick={() => setModalMode('signup')}
                            >
                                Signup
                            </button>
                            <button
                                type="button"
                                className="btn-top-login"
                                onClick={() => setModalMode('login')}
                            >
                                Login
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {modalMode && <AuthModal mode={modalMode} onClose={() => setModalMode(null)} />}
        </>
    )
}
