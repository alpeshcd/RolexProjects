import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useAuth } from '@/auth'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
    const { authenticated } = useAuth()
    const { search } = useLocation()

    if (authenticated) {
        // Honor ?redirectUrl=... so sign-in / 2FA return the user where they were headed
        const redirectUrl = new URLSearchParams(search).get(REDIRECT_URL_KEY)
        const target =
            redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')
                ? redirectUrl
                : authenticatedEntryPath
        return <Navigate replace to={target} />
    }

    return <Outlet />
}

export default PublicRoute
