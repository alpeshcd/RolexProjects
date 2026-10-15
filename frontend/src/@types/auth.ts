export type SignInCredential = {
    username?: string
    userName?: string
    email?: string
    password: string
    rememberMe?: boolean
}

export type User = {
    id?: number | string
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    username?: string | null
    full_name?: string | null
    email?: string | null
    role?: string
    authority?: string[]
    balance?: number
    upline_share?: number
    upline?: string | null
    is_2fa_enabled?: boolean
    company?: any
}

export type Token = {
    accessToken: string
    refreshToken?: string
    refereshToken?: string
    token?: string
}

export type SignInResponse = {
    access_token?: string
    refresh_token?: string
    token?: string
    token_type?: string
    requires_2fa?: boolean
    temp_token?: string
    user?: User
    message?: string
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    userName: string
    email: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
