import SideNav from '@/components/template/SideNav'
import Header from '@/components/template/Header'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import LayoutBase from '@/components/template/LayoutBase'
import useResponsive from '@/utils/hooks/useResponsive'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'
import { useSessionUser } from '@/store/authStore'
import Tag from '@/components/ui/Tag'
import { HiOutlineLightningBolt } from 'react-icons/hi'

const CollapsibleSide = ({ children }: CommonProps) => {
    const { larger, smaller } = useResponsive()
    const user = useSessionUser((state) => state.user)

    const balanceStr = user?.balance !== undefined
        ? Number(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '0.00'
    const uplineShareStr = user?.upline_share !== undefined
        ? Number(user.upline_share).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '0.00'

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col min-h-screen bg-slate-50/70 dark:bg-gray-900"
        >
            <div className="flex flex-auto min-w-0">
                {larger.lg && <SideNav />}
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    {/* Exact Rolex Panel Topbar Header */}
                    <Header
                        className="bg-[#008080] dark:bg-[#005a5a] text-white shadow-sm px-4 border-none !h-[48px]"
                        wrapperClass="flex items-center justify-between w-full !h-[48px]"
                        headerStart={
                            <div className="flex items-center gap-2">
                                {smaller.lg && <MobileNav />}
                                {larger.lg && (
                                    <SideNavToggle className="!text-white hover:!bg-white/10 rounded-md p-1 cursor-pointer" />
                                )}
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
