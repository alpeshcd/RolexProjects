import React from 'react'
import classNames from 'classnames'
import { useSessionUser } from '@/store/authStore'

interface RolexLogoProps {
    collapsed?: boolean
    className?: string
}

const RolexLogo: React.FC<RolexLogoProps> = ({ collapsed = false, className }) => {
    const user = useSessionUser((state) => state.user)
    const username = user?.userName || (user as any)?.username || 'MASTAN99M'

    if (collapsed) {
        return (
            <div className={classNames("flex flex-col items-center justify-center py-2", className)}>
                <span className="text-xl font-black text-[#104c64] tracking-wider">R</span>
            </div>
        )
    }

    return (
        <div className={classNames("flex flex-col items-center justify-center py-3 select-none", className)}>
            {/* ROLEX PANEL Logo Header */}
            <div className="relative inline-flex items-center">
                <span className="text-[26px] font-black tracking-wider text-[#104c64] leading-none">
                    ROLEX
                </span>
                <span className="ml-1 text-[10px] font-bold bg-[#06b6d4] text-white px-1.5 py-[1px] rounded-full uppercase tracking-tight shadow-sm">
                    PANEL
                </span>
            </div>
            
            {/* Active Username (e.g. MASTAN99M) */}
            <div className="mt-2 text-xs font-bold tracking-wide text-[#008080] uppercase">
                {username}
            </div>
        </div>
    )
}

export default RolexLogo
