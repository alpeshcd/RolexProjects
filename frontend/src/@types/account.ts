export interface BankAccount {
    id: number
    user?: string
    name: string
    type: string // UPI, BANK, QR
    category?: string
    account_number: string
    ifsc_code?: string | null
    bank_name?: string | null
    min_amount: number
    max_amount: number
    max_deposit?: string
    account_for?: string
    is_only_withdrawal?: boolean
    qr_code_url?: string | null
    status: 'Active' | 'Inactive' | string
    is_active: boolean
    last_update?: string
    last_update_str?: string
    created_at?: string
}

export interface CreateAccountPayload {
    user?: string
    name: string
    type: string
    category?: string
    account_number: string
    ifsc_code?: string
    bank_name?: string
    min_amount?: number
    max_amount?: number
    max_deposit?: string
    account_for?: string
    is_only_withdrawal?: boolean
    qr_code_url?: string
    status?: string
}
