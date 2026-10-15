import { mock } from '../MockAdapter'
import { signInUserData } from '../data/authData'

const handleLogin = (config: any) => {
    const data = JSON.parse(config.data as string) as {
        email?: string
        username?: string
        password?: string
    }

    const identifier = (data.username || data.email || '').toLowerCase()
    const password = data.password

    const user = signInUserData.find(
        (u) =>
            (u.email.toLowerCase() === identifier ||
                u.accountUserName?.toLowerCase() === identifier ||
                u.userName?.toLowerCase() === identifier) &&
            u.password === password,
    )

    if (user) {
        if (user.is_2fa_enabled) {
            return [
                200,
                {
                    requires_2fa: true,
                    temp_token: `mock_temp_token_${user.userName}`,
                    message: 'Please verify your 2FA OTP to complete login.',
                },
            ]
        }
        return [
            200,
            {
                requires_2fa: false,
                access_token: `mock_access_token_${user.userName}_${Date.now()}`,
                refresh_token: `mock_refresh_token_${user.userName}_${Date.now()}`,
                token_type: 'bearer',
                user,
                token: 'mock_token',
                message: 'Login successful',
            },
        ]
    }

    return [401, { detail: 'Invalid username or password!' }]
}

mock.onPost(`/sign-in`).reply(handleLogin)
mock.onPost(`/api/v1/auth/login`).reply(handleLogin)

mock.onPost(`/api/v1/auth/verify-2fa`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        temp_token: string
        otp_code: string
    }
    if (data.otp_code === '123456' || data.otp_code?.length === 6) {
        const user = signInUserData[0] // MASTAN99M
        return [
            200,
            {
                access_token: `mock_access_token_mastan_${Date.now()}`,
                refresh_token: `mock_refresh_token_mastan_${Date.now()}`,
                token_type: 'bearer',
                user,
                message: '2FA verification successful',
            },
        ]
    }
    return [400, { detail: 'Invalid OTP code. Please enter 123456.' }]
})

mock.onPost(`/api/v1/auth/refresh`).reply(() => {
    return [
        200,
        {
            access_token: `mock_access_token_refreshed_${Date.now()}`,
            refresh_token: `mock_refresh_token_refreshed_${Date.now()}`,
            token_type: 'bearer',
            message: 'Token refreshed successfully',
        },
    ]
})

mock.onPost(`/api/v1/auth/logout`).reply(() => [200, { message: 'Logged out' }])
mock.onGet(`/api/v1/auth/me`).reply(() => [200, signInUserData[0]])

mock.onPost(`/sign-up`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        email: string
        password: string
        userName: string
    }

    const { email, userName } = data
    const emailUsed = signInUserData.some((user) => user.email === email)
    const newUser = {
        avatar: '',
        userName,
        email,
        authority: ['admin', 'user'],
    }

    if (emailUsed) {
        return [400, { message: 'User already exist!' }]
    }

    return [
        201,
        {
            user: newUser,
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
        },
    ]
})

mock.onPost(`/reset-password`).reply(() => [200, true])
mock.onPost(`/forgot-password`).reply(() => [200, true])
mock.onPost(`/sign-out`).reply(() => [200, true])
