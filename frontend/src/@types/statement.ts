export interface StatementItem {
    id: number
    site_user: string
    domain?: string
    username: string
    date?: string
    date_str?: string
    event_type: string
    amount: number
    total: number
    balance: number
    type: 'Profit & Loss' | 'Withdraw' | 'Deposit'
    dc: 'Credit' | 'Debit'
    description?: string
}

export interface SiteStatRow {
    id: number
    master_id: number
    username: string
    total_clients: number
    total_approved_deposit: number
    number_approved_deposit: number
    total_rejected_deposit: number
    number_rejected_deposit: number
    total_approved_withdraw: number
    number_approved_withdraw: number
    total_rejected_withdraw: number
    number_rejected_withdraw: number
}

export interface ChangePasswordPayload {
    old_password: string
    new_password: string
    confirm_password: string
    otp_code?: string
}
