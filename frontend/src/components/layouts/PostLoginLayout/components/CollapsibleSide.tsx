import { useNavigate } from 'react-router-dom'
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
import { PiMagnifyingGlassDuotone } from 'react-icons/pi'

const CollapsibleSide = ({ children }: CommonProps) => {
    const navigate = useNavigate()
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
                                <button
                                    type="button"
                                    onClick={() => navigate('/global-search')}
                                    className="hidden sm:flex items-center gap-2 h-9 w-64 lg:w-80 px-3 rounded-lg border border-line bg-surface-2 text-ink-3 text-[13px] hover:border-line-strong transition-colors"
                                >
                                    <PiMagnifyingGlassDuotone className="text-base" />
                                    <span className="flex-1 text-left">Search clients, UTR, accounts…</span>
                                </button>
                            </div>
                        }
                        headerEnd={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                    type="button"
                                    aria-label="Search"
                                    onClick={() => navigate('/global-search')}
                                    className="sm:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-line bg-surface text-ink-2"
                                >
                                    <PiMagnifyingGlassDuotone className="text-lg" />
                                </button>
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
