import { useNavigate } from 'react-router-dom'
import SideNav from '@/components/template/SideNav'
import Header from '@/components/template/Header'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import LayoutBase from '@/components/template/LayoutBase'
import Notification from '@/components/template/Notification'
import useResponsive from '@/utils/hooks/useResponsive'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'
import { Button, Tooltip } from 'antd'
import {
    SearchOutlined,
    SunOutlined,
    MoonOutlined
} from '@ant-design/icons'

const CollapsibleSide = ({ children }: CommonProps) => {
    const navigate = useNavigate()
    const { larger, smaller } = useResponsive()
    const [isDark, setIsDark] = useDarkMode()

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col min-h-screen bg-[#f5f5f5] dark:bg-[#141414] text-gray-800 dark:text-gray-200 transition-colors duration-200"
        >
            <div className="flex flex-auto min-w-0">
                {larger.lg && <SideNav />}
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    {/* Clean Ant Design Pro Style Header */}
                    <Header
                        className="bg-white dark:bg-[#1f1f1f] border-b border-[#f0f0f0] dark:border-[#303030] px-4 sticky top-0 z-30 transition-all !h-[56px] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        wrapperClass="flex items-center justify-between w-full !h-[56px]"
                        headerStart={
                            <div className="flex items-center gap-3">
                                {smaller.lg && <MobileNav />}
                                {larger.lg && (
                                    <SideNavToggle className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1.5 transition-colors cursor-pointer text-base" />
                                )}
                            </div>
                        }
                        headerEnd={
                            <div className="flex items-center gap-2">
                                <Button
                                    type="text"
                                    icon={<SearchOutlined />}
                                    onClick={() => navigate('/global-search')}
                                    className="text-gray-500 hover:text-gray-800 text-xs hidden sm:flex items-center"
                                >
                                    Search...
                                </Button>

                                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                                    <Button
                                        type="text"
                                        shape="circle"
                                        icon={isDark ? <SunOutlined className="text-amber-400 text-base" /> : <MoonOutlined className="text-gray-500 text-base" />}
                                        onClick={() => setIsDark(isDark ? 'light' : 'dark')}
                                    />
                                </Tooltip>

                                <Notification />

                                <UserProfileDropdown />
                            </div>
                        }
                    />
                    <main className="h-full flex flex-auto flex-col overflow-x-hidden p-4 sm:p-6 bg-[#f5f5f5] dark:bg-[#141414]">
                        {children}
                    </main>
                </div>
            </div>
        </LayoutBase>
    )
}

export default CollapsibleSide
