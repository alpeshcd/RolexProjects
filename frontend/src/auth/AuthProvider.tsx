import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp, apiVerify2FA, apiGetMe } from '@/services/AuthService'
import {
    TOKEN_NAME_IN_STORAGE,
    REFRESH_TOKEN_NAME_IN_STORAGE,
    USER_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>((_, ref) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
})

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const replaceUser = useSessionUser((state) => state.replaceUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setTokens, clearTokens } = useToken()

    const authenticated = Boolean(token && signedIn)
    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    // Sync latest user profile and balance from backend whenever session is active
    useEffect(() => {
        if (authenticated && token) {
            apiGetMe()
                .then((latestUser) => {
                    if (latestUser) {
                        setUser({
                            ...latestUser,
                            userName: latestUser.username || latestUser.userName,
                        })
                    }
                })
                .catch(() => {
                    // Ignore silently if token refresh handles it
                })
        }
    }, [authenticated, token])

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)
        // Only follow in-app paths (blocks //evil.com style redirects)
        const isInternal =
            !!redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')

        navigatorRef.current?.navigate(
            isInternal ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens: Token, profile: User = {}) => {
        const accessToken = tokens.accessToken || tokens.token || ''
        const refreshToken = tokens.refreshToken || tokens.refereshToken || ''

        localStorage.setItem(TOKEN_NAME_IN_STORAGE, accessToken)
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_NAME_IN_STORAGE, refreshToken)
        }
        localStorage.setItem(USER_NAME_IN_STORAGE, JSON.stringify(profile))

        setTokens({ accessToken, refreshToken })
        replaceUser(profile)
        setSessionSignedIn(true)
    }

    const handleSignOut = () => {
        clearTokens()
        replaceUser()
        setSessionSignedIn(false)
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const username = (
                values.username ||
                values.userName ||
                values.email ||
                ''
            ).trim()

            const resp = await apiSignIn({
                username,
                password: values.password,
            })

            // If user requires 2FA authentication step
            if (resp && resp.requires_2fa) {
                // Drop any previous session so the 2FA screen shows only this user
                handleSignOut()
                if (resp.temp_token) {
                    localStorage.setItem('temp_2fa_token', resp.temp_token)
                }
                localStorage.setItem('temp_2fa_user', username)
                replaceUser({ username, userName: username, full_name: username })
                // Keep ?redirectUrl=... so the user lands where they were headed
                navigatorRef.current?.navigate(`/verify${window.location.search}`)
                return {
                    status: 'success',
                    message: resp.message || '2FA verification required',
                }
            }

            // Direct login with tokens
            const accessToken = resp.access_token || resp.token
            if (resp && accessToken) {
                const profile: User = {
                    id: resp.user?.id,
                    username: resp.user?.username || username,
                    userName: resp.user?.username || resp.user?.userName || username,
                    full_name: resp.user?.full_name || username,
                    email: resp.user?.email || '',
                    role: resp.user?.role || 'user',
                    authority: resp.user?.authority || [resp.user?.role || 'user'],
                    balance: resp.user?.balance ?? 0,
                    upline_share: resp.user?.upline_share ?? 0,
                    upline: resp.user?.upline ?? '',
                    is_2fa_enabled: Boolean(resp.user?.is_2fa_enabled),
                }

                handleSignIn(
                    {
                        accessToken,
                        refreshToken: resp.refresh_token || '',
                    },
                    profile,
                )

                toast.push(
                    <Notification
                        title="Sign In Successful"
                        type="success"
                        duration={3000}
                    >
                        Welcome back, <strong>{profile.userName}</strong>!
                    </Notification>,
                )

                redirect()

                return {
                    status: 'success',
                    message: '',
                }
            }

            return {
                status: 'failed',
                message: resp.message || 'Unable to sign in. Please check credentials.',
            }
        } catch (errors: any) {
            const message =
                errors?.response?.data?.detail ||
                errors?.response?.data?.message ||
                errors.message ||
                errors.toString()
            return {
                status: 'failed',
                message,
            }
        }
    }

    const verify2FA = async (otpCode: string): AuthResult => {
        try {
            const tempToken = localStorage.getItem('temp_2fa_token')
            if (!tempToken) {
                return {
                    status: 'failed',
                    message: '2FA session expired. Please sign in again.',
                }
            }

            const resp = await apiVerify2FA({
                temp_token: tempToken,
                otp_code: otpCode,
            })

            const accessToken = resp.access_token || resp.token
            if (resp && accessToken) {
                const savedUser = localStorage.getItem('temp_2fa_user') || ''
                const profile: User = {
                    id: resp.user?.id,
                    username: resp.user?.username || savedUser,
                    userName: resp.user?.username || resp.user?.userName || savedUser,
                    full_name: resp.user?.full_name || savedUser,
                    email: resp.user?.email || '',
                    role: resp.user?.role || 'supermaster',
                    authority: resp.user?.authority || [resp.user?.role || 'admin'],
                    balance: resp.user?.balance ?? 0,
                    upline_share: resp.user?.upline_share ?? 0,
                    upline: resp.user?.upline ?? '',
                    is_2fa_enabled: Boolean(resp.user?.is_2fa_enabled),
                }

                handleSignIn(
                    {
                        accessToken,
                        refreshToken: resp.refresh_token || '',
                    },
                    profile,
                )

                localStorage.removeItem('temp_2fa_token')
                localStorage.removeItem('temp_2fa_user')

                toast.push(
                    <Notification
                        title="2FA Verified"
                        type="success"
                        duration={3000}
                    >
                        Authentication established for <strong>{profile.userName}</strong>.
                    </Notification>,
                )

                redirect()

                return {
                    status: 'success',
                    message: '',
                }
            }

            return {
                status: 'failed',
                message: resp.message || 'OTP verification failed',
            }
        } catch (errors: any) {
            const message =
                errors?.response?.data?.detail ||
                errors?.response?.data?.message ||
                errors.message ||
                'Invalid OTP code.'
            return {
                status: 'failed',
                message,
            }
        }
    }

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values)
            if (resp && (resp.access_token || resp.token)) {
                const accessToken = resp.access_token || resp.token || ''
                const refreshToken = resp.refresh_token || ''
                handleSignIn(
                    { accessToken, refreshToken },
                    resp.user || {
                        userName: values.userName,
                        email: values.email,
                        authority: ['user'],
                    },
                )
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign up',
            }
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut().catch(() => {})
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }

    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                verify2FA,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

IsolatedNavigator.displayName = 'IsolatedNavigator'

export default AuthProvider
