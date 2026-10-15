export interface DomainPortal {
    id: number
    domain_key: string
    domain_title: string
    domain_url: string
    brand_name: string
    balance: number
    pl: number
    client_wallet: number
    is_active: boolean
    updated_at?: string
}

export interface GlobalSearchClient {
    id: number
    s_no?: number
    domain: string
    domain_title?: string
    username: string
    full_name?: string
    balance: number
    last_updated?: string
    is_active: boolean
}

export interface CreateClientPayload {
    domain: string
    username: string
    full_name?: string
    password: string
    balance?: number
    upline?: string
    upline_share?: number
}
