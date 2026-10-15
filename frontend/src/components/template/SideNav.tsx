import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import RolexLogo from '@/components/template/RolexLogo'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import Button from '@/components/ui/Button'
import { useThemeStore } from '@/store/themeStore'
import { useSessionUser } from '@/store/authStore'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import navigationConfig from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import { Link } from 'react-router-dom'
import useAuth from '@/auth'
import { HiOutlineLogout } from 'react-icons/hi'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_CONTENT_GUTTER,
    LOGO_X_GUTTER,
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

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav flex flex-col justify-between border-r border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <div className="flex flex-col flex-auto min-h-0">
                <Link
                    to={appConfig.authenticatedEntryPath}
                    className="side-nav-header flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-800 py-3"
                >
                    <RolexLogo
                        collapsed={sideNavCollapse}
                        className={classNames(
                            sideNavCollapse
                                ? SIDE_NAV_CONTENT_GUTTER
                                : LOGO_X_GUTTER,
                        )}
                    />
                    {!sideNavCollapse && (
                        <div className="text-center mt-1">
                            <span className="text-xs font-black text-[#008080] dark:text-[#2dd4bf] tracking-wide font-mono uppercase">
                                {user?.userName || (user as any)?.username || 'MASTAN99M'}
                            </span>
                        </div>
                    )}
                </Link>
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

            {/* Rolex Solid Teal Logout Action Button */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <Button
                    block
                    variant="solid"
                    onClick={() => signOut()}
                    icon={<HiOutlineLogout className="text-base text-white" />}
                    className="!bg-[#008080] hover:!bg-[#006e6e] text-white text-xs font-bold rounded-lg shadow-sm !h-9 flex items-center justify-center gap-1.5"
                >
                    {!sideNavCollapse && <span>Logout</span>}
                </Button>
            </div>
        </div>
    )
}

export default SideNav
