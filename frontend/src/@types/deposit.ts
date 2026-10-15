export interface Deposit {
    id: number
    deposit_id: number
    site: string
    domain?: string
    username: string
    master: string
    added_by: string
    account_id?: number
    account_name?: string
    amount: number
    type: string
    utr_number: string
    status: 'Pending' | 'Approved' | 'Rejected' | string
    proof_image_url?: string
    date?: string
    date_str?: string
    approved_at?: string
    approved_at_str?: string
    rejected_at?: string
    rejected_at_str?: string
}

export interface CreateDepositPayload {
    username: string
    amount: number
    utr_number: string
    account_name?: string
    account_id?: number
    proof_image_url?: string
    site?: string
    type?: string
}

export interface UTREntry {
    id: number
    utr_id: number
    master: string
    added_by: string
    account_name: string
    utr_number: string
    amount: number
    status: 'PENDING' | 'REMOVED' | 'MATCHED' | string
    removed_by?: string
    date?: string
    date_str?: string
}

export interface CreateUTRPayload {
    utr_number: string
    account_name: string
    amount: number
}
