import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated } = useAuth()

    const { pathname, search } = useLocation()

    // Use the router's location; window.location may already point at /sign-in
    const getPathName =
        pathname === '/'
            ? ''
            : `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname + search)}`

    if (!authenticated) {
        return (
            <Navigate
                replace
                to={`${unAuthenticatedEntryPath}${getPathName}`}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute
