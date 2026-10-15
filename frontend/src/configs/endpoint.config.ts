export const apiPrefix = '/api'

const endpointConfig = {
    signIn: '/api/v1/auth/login',
    signOut: '/api/v1/auth/logout',
    verify2fa: '/api/v1/auth/verify-2fa',
    refreshToken: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    signUp: '/api/v1/auth/sign-up',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
}

export default endpointConfig
