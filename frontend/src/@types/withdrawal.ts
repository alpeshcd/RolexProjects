export interface Withdrawal {
    id: number
    withdrawal_id: number
    site: string
    domain?: string
    username: string
    master: string
    added_by?: string
    account_name?: string
    account_no?: string
    ifsc_code?: string
    bank_name?: string
    amount: number
    type: string
    utr_number?: string | null
    status: 'Pending' | 'Approved' | 'Rejected' | 'Canceled'
    rejection_reason?: string | null
    date?: string
    date_str?: string
    approved_at?: string | null
    approved_at_str?: string | null
    rejected_at?: string | null
    rejected_at_str?: string | null
    canceled_at?: string | null
    canceled_at_str?: string | null
}

export interface CreateWithdrawalPayload {
    username: string
    site?: string
    account_name?: string
    account_no?: string
    ifsc_code?: string
    bank_name?: string
    amount: number
    type?: string
}

export interface ApproveWithdrawalPayload {
    utr_number: string
}

export interface RejectWithdrawalPayload {
    reason?: string
}
