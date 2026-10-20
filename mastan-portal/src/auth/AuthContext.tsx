import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getToken, setToken, UNAUTHORIZED_EVENT } from '../lib/api'
import { portalHost } from '../lib/portal'
import type { Account, Portal } from '../types'

interface AuthState {
    portal: Portal | null
    portalError: string | null
    account: Account | null
    ready: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
    // Re-reads balance / upline after anything that moves chips
    refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// Header balance follows changes made elsewhere (e.g. a deposit approved in Rolex)
const BALANCE_REFRESH_MS = 15000

export function AuthProvider({ children }: { children: ReactNode }) {
    const [portal, setPortal] = useState<Portal | null>(null)
    const [portalError, setPortalError] = useState<string | null>(null)
    const [account, setAccount] = useState<Account | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const p = await api.portal(portalHost())
                if (cancelled) return
                setPortal(p)
                if (getToken()) {
                    const me = await api.me().catch(() => null)
                    if (!cancelled && me) setAccount(me.account)
                }
            } catch (e) {
                if (!cancelled) setPortalError(e instanceof Error ? e.message : 'Could not load this portal')
            } finally {
                if (!cancelled) setReady(true)
            }
        }
        load()
        const onUnauthorized = () => setAccount(null)
        window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
        return () => {
            cancelled = true
            window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
        }
    }, [])

    const refresh = useCallback(async () => {
        const me = await api.me()
        setAccount(me.account)
    }, [])

    useEffect(() => {
        if (!account) return
        const timer = window.setInterval(() => {
            if (!document.hidden) refresh().catch(() => undefined)
        }, BALANCE_REFRESH_MS)
        return () => window.clearInterval(timer)
    }, [account?.id, refresh])

    const login = useCallback(async (username: string, password: string) => {
        const res = await api.login(username, password)
        setToken(res.access_token)
        setPortal(res.portal)
        setAccount(res.account)
    }, [])

    const logout = useCallback(() => {
        setToken(null)
        setAccount(null)
    }, [])

    const value = useMemo(
        () => ({ portal, portalError, account, ready, login, logout, refresh }),
        [portal, portalError, account, ready, login, logout, refresh],
    )
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

// For pages behind RequireAuth, where the account is always loaded
export function useAccount(): Account {
    const { account } = useAuth()
    if (!account) throw new Error('useAccount needs a signed-in account')
    return account
}
