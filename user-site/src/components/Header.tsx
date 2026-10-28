import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useAuth } from '../auth/AuthContext'
import { fmtAmount } from '../lib/format'
import Logo from './Logo'

function UserMenu() {
    const { logout } = useAuth()
    const account = useAccount()
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

    return (
        <div className="dd" ref={ref}>
            <button type="button" className="dd-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                <span className="dd-user">{account.username}</span>
                <span className="caret" aria-hidden="true" />
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
    const { portal } = useAuth()
    const account = useAccount()

    return (
        <header className="topbar">
            <Link to="/home" className="brand" aria-label="Home">
                <Logo brand={portal?.brand_name ?? ''} />
            </Link>
            <div className="topbar-right">
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
        </header>
    )
}
