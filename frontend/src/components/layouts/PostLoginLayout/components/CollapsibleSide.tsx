import SideNav from '@/components/template/SideNav'
import Header from '@/components/template/Header'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import LayoutBase from '@/components/template/LayoutBase'
import useResponsive from '@/utils/hooks/useResponsive'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'
import Tag from '@/components/ui/Tag'
import { HiOutlineLightningBolt } from 'react-icons/hi'

const CollapsibleSide = ({ children }: CommonProps) => {
    const { larger, smaller } = useResponsive()

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col min-h-screen bg-slate-50/70 dark:bg-gray-900"
        >
            <div className="flex flex-auto min-w-0">
                {larger.lg && <SideNav />}
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    {/* Modern Ecme Topbar Header */}
                    <Header
                        className="bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 shadow-sm px-4"
                        wrapperClass="flex items-center justify-between w-full"
                        headerStart={
                            <div className="flex items-center gap-3">
                                {smaller.lg && <MobileNav />}
                                {larger.lg && <SideNavToggle className="text-gray-700 dark:text-gray-200" />}
                                <div className="hidden sm:flex items-center gap-2">
                                    <Tag className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        ROLEX EXCHANGE
                                    </Tag>
                                </div>
                            </div>
                        }
                        headerMiddle={
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-full text-xs border border-slate-200 dark:border-gray-700">
                                    <span className="text-gray-400 font-medium">Bal:</span>
                                    <span className="font-extrabold text-teal-700 dark:text-teal-400 font-mono">143,418.00</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-400 font-medium">Upline:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">25,589.00</span>
                                </div>
                            </div>
                        }
                        headerEnd={
                            <div className="flex items-center gap-3">
                                <UserProfileDropdown hoverable={false} />
                            </div>
                        }
                    />
                    <div className="h-full flex flex-auto flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </LayoutBase>
    )
}

export default CollapsibleSide
