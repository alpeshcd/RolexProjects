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
import { Avatar, Tag, Button } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
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

    const roleName = ((user as any)?.role || 'Admin').toUpperCase()
    const username = user?.full_name || user?.userName || (user as any)?.username || 'Admin'

    return (
        <aside
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav flex flex-col justify-between border-r border-[#f0f0f0] dark:border-[#303030] bg-white dark:bg-[#1f1f1f] shadow-[1px_0_2px_0_rgba(0,0,0,0.02)] transition-all duration-200',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <div className="flex flex-col flex-auto min-h-0">
                {/* Brand Header */}
                <Link
                    to={appConfig.authenticatedEntryPath}
                    className="side-nav-header flex flex-col items-center justify-center border-b border-[#f0f0f0] dark:border-[#303030] py-3.5 px-3"
                >
                    <RolexLogo
                        collapsed={sideNavCollapse}
                        className={classNames(
                            sideNavCollapse
                                ? SIDE_NAV_CONTENT_GUTTER
                                : LOGO_X_GUTTER,
                        )}
                    />
                </Link>

                {/* Clean User Profile Capsule (when expanded) */}
                {!sideNavCollapse && (
                    <div className="mx-3 mt-3 mb-1 p-2.5 rounded-lg bg-[#fafafa] dark:bg-[#141414] border border-[#f0f0f0] dark:border-[#303030] flex items-center gap-2.5">
                        <Avatar
                            size={32}
                            icon={<UserOutlined />}
                            className="bg-blue-600 text-white font-bold shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                {username}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Tag color="blue" className="text-[10px] m-0 py-0 px-1 leading-none">
                                    {roleName}
                                </Tag>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <div className={classNames('side-nav-content flex-auto min-h-0 py-2 px-1', contentClass)}>
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

            {/* Clean Logout Button */}
            <div className="p-3 border-t border-[#f0f0f0] dark:border-[#303030] bg-[#fafafa] dark:bg-[#141414]">
                <Button
                    block
                    danger
                    type="text"
                    onClick={() => signOut()}
                    icon={<LogoutOutlined />}
                    className="text-xs font-medium !h-9 flex items-center justify-center gap-1.5"
                >
                    {!sideNavCollapse && <span>Sign Out</span>}
                </Button>
            </div>
        </aside>
    )
}

export default SideNav
