export interface Party {
    id: number
    name: string
    type: 'Purchase' | 'Seller' | 'Third' | 'All' | string
    contact?: string | null
    notes?: string | null
    is_active: boolean
    created_at?: string
}

export interface CreatePartyPayload {
    name: string
    type?: string
    contact?: string
    notes?: string
    is_active?: boolean
}

export interface ThirdPartyRow {
    id: number
    party_id: number
    party_name?: string | null
    commission: number
}

export interface ThirdPartyInput {
    party_id: number
    commission: number
}

export interface DirectMaster {
    id: number
    exchange: string
    exchange_title?: string | null
    admin: string
    purchase_party_id: number
    purchase_party_name?: string | null
    purchase_rate: number
    seller_party_id: number
    seller_party_name?: string | null
    seller_rate: number
    credit?: number | null
    status: 'Active' | 'Inactive' | string
    is_active: boolean
    third_parties: ThirdPartyRow[]
    /* derived on the server */
    spread: number
    total_commission: number
    net_spread: number
    created_at?: string
    created_at_str?: string
}

export interface CreateDirectMasterPayload {
    exchange: string
    exchange_title?: string
    admin: string
    purchase_party_id: number
    purchase_rate: number
    seller_party_id: number
    seller_rate: number
    credit?: number
    status?: string
    third_parties?: ThirdPartyInput[]
}
