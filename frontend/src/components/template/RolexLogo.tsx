import React from 'react'
import classNames from 'classnames'

interface RolexLogoProps {
    collapsed?: boolean
    className?: string
    showSubtitle?: boolean
}

const LogoMark = ({ size = 32 }: { size?: number }) => (
    <div
        className="rounded-[10px] bg-primary flex items-center justify-center shrink-0 ring-1 ring-inset ring-white/10"
        style={{ width: size, height: size }}
    >
        <span
            className="font-serif font-bold text-[#e8cf94] leading-none"
            style={{ fontSize: size * 0.56 }}
        >
            R
        </span>
    </div>
)

const RolexLogo: React.FC<RolexLogoProps> = ({
    collapsed = false,
    className,
    showSubtitle = false,
}) => {
    if (collapsed) {
        return (
            <div className={classNames('flex items-center justify-center select-none', className)}>
                <LogoMark size={34} />
            </div>
        )
    }

    return (
        <div className={classNames('flex flex-col select-none', className)}>
            <div className="flex items-center gap-2.5">
                <LogoMark size={34} />
                <div className="flex flex-col leading-none">
                    <span className="text-[17px] font-bold tracking-tight text-ink">
                        Rolex
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent mt-1">
                        Admin
                    </span>
                </div>
            </div>
            {showSubtitle && (
                <span className="text-[11px] text-ink-3 font-medium mt-2">
                    Central Management System
                </span>
            )}
        </div>
    )
}

export default RolexLogo
