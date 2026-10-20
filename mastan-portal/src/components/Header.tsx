import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useAuth } from '../auth/AuthContext'
import { fmtAmount } from '../lib/format'
import { ACCOUNT_MENU, CLIENT_MENU, CREATE_ITEMS, MARKET_MENU, type MenuItem } from '../menus'
import Logo from './Logo'

function Dropdown({ label, align = 'left', children }: { label: string; align?: 'left' | 'right'; children: ReactNode }) {
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
                {label}
                <span className="caret" aria-hidden="true" />
            </button>
            {open && (
                <div className={`dd-menu dd-${align}`} onClick={() => setOpen(false)}>
                    {children}
                </div>
            )}
        </div>
    )
}

function MenuLink({ item }: { item: MenuItem }) {
    return (
        <Link to={item.to} className="dd-item">
            {item.letter && <span className="dd-letter">{item.letter}</span>}
            {item.label}
        </Link>
    )
}

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const { portal, logout } = useAuth()
    const account = useAccount()

    return (
        <header className="topbar">
            <button type="button" className="hamburger" onClick={onToggleSidebar} aria-label="Toggle sports menu">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 5h3v3H3zM8 5h13v3H8zM3 10.5h3v3H3zM8 10.5h13v3H8zM3 16h3v3H3zM8 16h13v3H8z" />
                </svg>
            </button>
            <Link to="/home" className="brand" aria-label="Home">
                <Logo brand={portal?.brand_name ?? ''} />
            </Link>

            <div className="topbar-right">
                <div className="balance-box">
                    <div>
                        Bal : <b>{fmtAmount(account.balance)}</b>
                    </div>
                    <div>
                        Upline : <b>{fmtAmount(account.upline)}</b>
                    </div>
                </div>
                <nav className="topnav" aria-label="Main">
                    <Dropdown label="Market">
                        {MARKET_MENU.map((item) => (
                            <MenuLink key={item.to} item={item} />
                        ))}
                    </Dropdown>
                    <Dropdown label="Client List">
                        {CLIENT_MENU.filter((item) => !item.adminOnly || account.role === 'admin').map((item) => (
                            <MenuLink key={item.to} item={item} />
                        ))}
                    </Dropdown>
                    {account.child_roles.length > 0 && (
                        <Dropdown label="Create User">
                            {account.child_roles.map((role) =>
                                role === 'admin' ? null : <MenuLink key={role} item={CREATE_ITEMS[role]} />,
                            )}
                        </Dropdown>
                    )}
                    <Dropdown label={account.username} align="right">
                        {ACCOUNT_MENU.map((item) => (
                            <MenuLink key={item.to} item={item} />
                        ))}
                        <button type="button" className="dd-item dd-logout" onClick={logout}>
                            LOGOUT
                        </button>
                    </Dropdown>
                </nav>
            </div>
        </header>
    )
}
