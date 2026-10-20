import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Header from './Header'
import SportsSidebar from './SportsSidebar'
import Ticker from './Ticker'

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

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
    useEffect(() => {
        const mq = window.matchMedia(query)
        const onChange = () => setMatches(mq.matches)
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [query])
    return matches
}

export default function Layout() {
    const { portal } = useAuth()
    const { pathname } = useLocation()
    const desktop = useMediaQuery('(min-width: 900px)')

    // The sports list is docked on the market pages (desktop) and a drawer
    // elsewhere; the hamburger overrides that until the next navigation.
    const marketsRoute = pathname === '/home' || pathname.startsWith('/sport/')
    const [sidebarPref, setSidebarPref] = useState<boolean | null>(null)
    useEffect(() => setSidebarPref(null), [pathname])
    const sidebarOpen = sidebarPref ?? (marketsRoute && desktop)
    const overlay = !desktop || !marketsRoute

    const [title, setTitle] = useState('')
    useEffect(() => {
        document.title = [title, portal?.brand_name].filter(Boolean).join(' | ')
    }, [title, portal?.brand_name])

    const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([])
    const toast = useCallback((message: string, kind: ToastKind = 'success') => {
        const id = Date.now() + Math.random()
        setToasts((t) => [...t, { id, message, kind }])
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
    }, [])

    const api = useMemo(() => ({ setTitle, toast }), [toast])

    return (
        <LayoutContext.Provider value={api}>
            <Header onToggleSidebar={() => setSidebarPref(!sidebarOpen)} />
            <div className="page-title">
                <h1>{title}</h1>
            </div>
            <Ticker />
            <div className="shell">
                {sidebarOpen && (
                    <>
                        {overlay && <div className="backdrop" onClick={() => setSidebarPref(false)} />}
                        <SportsSidebar overlay={overlay} onNavigate={() => overlay && setSidebarPref(false)} />
                    </>
                )}
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
