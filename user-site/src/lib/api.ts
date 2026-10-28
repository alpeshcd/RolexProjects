import type { Account, Bet, EventDetail, ExchangeEvent, LoginResponse, Me, Portal, Side, Sport, StatementRow } from '../types'
import { portalHost } from './portal'

const BASE = '/api/v1/player'
const TOKEN_KEY = `player-token:${portalHost()}`

// Fired when the backend rejects the saved token, so the app can show the login page
export const UNAUTHORIZED_EVENT = 'player:unauthorized'

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message)
    }
}

export function getToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

export function setToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token)
        else localStorage.removeItem(TOKEN_KEY)
    } catch {
        // Storage blocked: the session just won't survive a reload
    }
}

type Query = Record<string, string | number | boolean | null | undefined>

function errorMessage(data: unknown): string | null {
    const detail = (data as { detail?: unknown } | null)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) {
        const loc: unknown[] = detail[0].loc ?? []
        const field = loc[loc.length - 1]
        return typeof field === 'string' ? `${field.replace(/_/g, ' ')}: ${detail[0].msg}` : detail[0].msg
    }
    return null
}

async function request<T>(path: string, opts: { method?: string; body?: unknown; query?: Query } = {}): Promise<T> {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(opts.query ?? {})) {
        if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
    }
    const qs = params.toString()
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

    let res: Response
    try {
        res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ''}`, {
            method: opts.method ?? 'GET',
            headers,
            body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        })
    } catch {
        throw new ApiError('Cannot reach the server. Please check your internet connection.', 0)
    }
    const data = await res.json().catch(() => null)
    if (!res.ok) {
        if (res.status === 401 && token) {
            setToken(null)
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
        }
        throw new ApiError(errorMessage(data) ?? `Request failed (${res.status})`, res.status)
    }
    return data as T
}

export interface PlaceBetBody {
    event_id: number
    market_type: 'match_odds' | 'bookmaker'
    market_id: string
    selection: string
    side: Side
    odds: number
    stake: number
}

export const api = {
    portal: (host: string) => request<Portal>('/portal', { query: { host } }),
    login: (username: string, password: string) =>
        request<LoginResponse>('/login', { method: 'POST', body: { host: portalHost(), username, password } }),
    me: () => request<Me>('/me'),
    changePassword: (old_password: string, new_password: string) =>
        request<{ message: string }>('/change-password', { method: 'POST', body: { old_password, new_password } }),

    sports: () => request<Sport[]>('/sports'),
    events: (query: { sport_id?: number; inplay?: boolean }) => request<ExchangeEvent[]>('/events', { query }),
    event: (eventId: number) => request<EventDetail>(`/events/${eventId}`),

    placeBet: (body: PlaceBetBody) => request<{ bet: Bet; account: Account }>('/bets', { method: 'POST', body }),
    bets: (query: { status?: 'open' | 'settled'; event_id?: number }) => request<Bet[]>('/bets', { query }),
    statement: (query: { start_date?: string; end_date?: string }) => request<StatementRow[]>('/statement', { query }),
}
