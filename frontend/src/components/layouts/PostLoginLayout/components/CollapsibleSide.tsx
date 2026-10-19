import SideNav from '@/components/template/SideNav'
import Header from '@/components/template/Header'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import LayoutBase from '@/components/template/LayoutBase'
import Notification from '@/components/template/Notification'
import ThemeToggle from '@/components/template/ThemeToggle'
import ThemeColorPicker from '@/components/template/ThemeColorPicker'
import useResponsive from '@/utils/hooks/useResponsive'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'

const CollapsibleSide = ({ children }: CommonProps) => {
    const { larger, smaller } = useResponsive()

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col min-h-screen bg-canvas text-ink"
        >
            <div className="flex flex-auto min-w-0">
                {larger.lg && <SideNav />}
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        className="bg-surface border-b border-line sticky top-0 z-30 !h-[60px]"
                        wrapperClass="flex items-center justify-between w-full !h-[60px] px-4 sm:px-6"
                        headerStart={
                            <div className="flex items-center gap-2">
                                {smaller.lg && <MobileNav />}
                                {larger.lg && (
                                    <SideNavToggle className="text-ink-2 hover:text-ink hover:bg-surface-hover rounded-lg p-1.5 transition-colors cursor-pointer" />
                                )}
                            </div>
                        }
                        headerEnd={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <ThemeColorPicker />
                                <ThemeToggle />
                                <Notification />
                                <div className="w-px h-6 bg-line mx-1 hidden sm:block" />
                                <UserProfileDropdown />
                            </div>
                        }
                    />
                    <main className="h-full flex flex-auto flex-col overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </LayoutBase>
    )
}

export default CollapsibleSide
