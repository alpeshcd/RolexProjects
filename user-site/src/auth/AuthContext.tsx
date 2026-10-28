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
    // Re-reads balance / exposure, e.g. after a bet or a result
    refresh: () => Promise<void>
    setAccount: (account: Account) => void
}

const AuthContext = createContext<AuthState | null>(null)

// The header balance follows deposits, D/W from the master and settled results
const BALANCE_REFRESH_MS = 10000

export function AuthProvider({ children }: { children: ReactNode }) {
    const [portal, setPortal] = useState<Portal | null>(null)
    const [portalError, setPortalError] = useState<string | null>(null)
    const [account, setAccountState] = useState<Account | null>(null)
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
                    if (!cancelled && me) setAccountState(me.account)
                }
            } catch (e) {
                if (!cancelled) setPortalError(e instanceof Error ? e.message : 'Could not load this site')
            } finally {
                if (!cancelled) setReady(true)
            }
        }
        load()
        const onUnauthorized = () => setAccountState(null)
        window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
        return () => {
            cancelled = true
            window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
        }
    }, [])

    const refresh = useCallback(async () => {
        const me = await api.me()
        setAccountState(me.account)
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
        setAccountState(res.account)
    }, [])

    const logout = useCallback(() => {
        setToken(null)
        setAccountState(null)
    }, [])

    const setAccount = useCallback((a: Account) => setAccountState(a), [])

    const value = useMemo(
        () => ({ portal, portalError, account, ready, login, logout, refresh, setAccount }),
        [portal, portalError, account, ready, login, logout, refresh, setAccount],
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
