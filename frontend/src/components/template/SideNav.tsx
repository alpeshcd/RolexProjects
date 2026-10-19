import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import RolexLogo from '@/components/template/RolexLogo'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import { useThemeStore } from '@/store/themeStore'
import { useSessionUser } from '@/store/authStore'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import navigationConfig from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import { Link } from 'react-router-dom'
import useAuth from '@/auth'
import { getInitials, formatRole } from '@/utils/userDisplay'
import { Tooltip } from 'antd'
import { PiSignOutDuotone } from 'react-icons/pi'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
} from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    contentClass?: string
    mode?: Mode
}

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
    translationSetup = true,
    background = true,
    className,
    contentClass,
}: SideNavProps) => {
    const direction = useThemeStore((state) => state.direction)
    const sideNavCollapse = useThemeStore(
        (state) => state.layout.sideNavCollapse,
    )

    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
    const user = useSessionUser((state) => state.user)
    const userAuthority = useSessionUser((state) => state.user.authority)
    const { signOut } = useAuth()

    const roleName = formatRole(user?.role || 'Admin')
    const username = user?.full_name || user?.userName || user?.username || 'Admin'
    const initials = getInitials(username)

    return (
        <aside
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav flex flex-col justify-between border-r border-line bg-surface',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <div className="flex flex-col flex-auto min-h-0">
                {/* Brand */}
                <Link
                    to={appConfig.authenticatedEntryPath}
                    className={classNames(
                        'side-nav-header flex items-center h-[60px] shrink-0 border-b border-line',
                        sideNavCollapse ? 'justify-center' : 'px-5',
                    )}
                >
                    <RolexLogo collapsed={sideNavCollapse} />
                </Link>

                {/* Signed-in user */}
                {!sideNavCollapse && (
                    <div className="mx-3 mt-4 mb-2 p-2.5 rounded-xl bg-surface-2 border border-line flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-subtle text-primary flex items-center justify-center text-[12px] font-bold shrink-0">
                            {initials}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 leading-tight">
                            <span className="text-[13px] font-semibold text-ink truncate">
                                {username}
                            </span>
                            <span className="text-[11px] font-medium text-ink-3 truncate mt-0.5">
                                {roleName}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className={classNames('side-nav-content flex-auto min-h-0 py-2', contentClass)}>
                    <ScrollBar style={{ height: '100%' }} direction={direction}>
                        <VerticalMenuContent
                            collapsed={sideNavCollapse}
                            navigationTree={navigationConfig}
                            routeKey={currentRouteKey}
                            direction={direction}
                            translationSetup={translationSetup}
                            userAuthority={userAuthority || []}
                        />
                    </ScrollBar>
                </div>
            </div>

            {/* Sign out */}
            <div className="p-3 border-t border-line">
                <Tooltip title={sideNavCollapse ? 'Sign out' : ''} placement="right">
                    <button
                        type="button"
                        onClick={() => signOut()}
                        className="w-full h-10 px-3 rounded-lg flex items-center justify-center gap-2 text-[13px] font-medium text-ink-2 hover:text-error hover:bg-error-subtle transition-colors"
                    >
                        <PiSignOutDuotone className="text-lg" />
                        {!sideNavCollapse && <span>Sign out</span>}
                    </button>
                </Tooltip>
            </div>
        </aside>
    )
}

export default SideNav
