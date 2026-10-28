import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { api } from '../lib/api'
import { usePolling } from '../lib/usePolling'
import type { Sport } from '../types'
import Header from './Header'

type ToastKind = 'success' | 'error'

interface LayoutApi {
    setTitle: (title: string) => void
    toast: (message: string, kind?: ToastKind) => void
}

const LayoutContext = createContext<LayoutApi | null>(null)

function useLayout(): LayoutApi {
    const ctx = useContext(LayoutContext)
    if (!ctx) throw new Error('Layout hooks must be used inside Layout')
    return ctx
}

export function usePageTitle(title: string) {
    const { setTitle } = useLayout()
    useEffect(() => setTitle(title), [title, setTitle])
}

export function useToast() {
    return useLayout().toast
}

// Sports with nothing listed are left out of the menus
function listed(sports: Sport[] | null): Sport[] {
    return (sports ?? []).filter((s) => s.event_count > 0)
}

export default function Layout() {
    const { portal } = useAuth()
    const { data: sports } = usePolling(api.sports, 60000)

    const [title, setTitle] = useState('')
    useEffect(() => {
        document.title = [title, portal?.brand_name].filter(Boolean).join(' | ')
    }, [title, portal?.brand_name])

    const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([])
    const toast = useCallback((message: string, kind: ToastKind = 'success') => {
        const id = Date.now() + Math.random()
        setToasts((t) => [...t, { id, message, kind }])
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
    }, [])

    const layoutApi = useMemo(() => ({ setTitle, toast }), [toast])

    return (
        <LayoutContext.Provider value={layoutApi}>
            <Header />
            <nav className="sports-nav" aria-label="Sports">
                <NavLink to="/home">HOME</NavLink>
                {listed(sports).map((s) => (
                    <NavLink key={s.id} to={`/sport/${s.id}`}>
                        {s.name.toUpperCase()}
                    </NavLink>
                ))}
            </nav>
            <div className="shell">
                <aside className="sidebar" aria-label="All sports">
                    <div className="sidebar-head">All Sports</div>
                    <NavLink to="/home" className="sidebar-item" end>
                        In-Play &amp; Upcoming
                    </NavLink>
                    {listed(sports).map((s) => (
                        <NavLink key={s.id} to={`/sport/${s.id}`} className="sidebar-item">
                            {s.name}
                            {s.inplay_count > 0 && <span className="sidebar-count">{s.inplay_count}</span>}
                        </NavLink>
                    ))}
                </aside>
                <main className="content">
                    <Outlet />
                </main>
            </div>
            <div className="toasts" role="status" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.kind}`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </LayoutContext.Provider>
    )
}
