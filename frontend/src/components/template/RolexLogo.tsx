import React from 'react'
import classNames from 'classnames'

interface RolexLogoProps {
    collapsed?: boolean
    className?: string
    showSubtitle?: boolean
    /** 'light' renders white text, for use on dark/brand backgrounds */
    variant?: 'default' | 'light'
}

const LogoMark = ({ size = 32, light = false }: { size?: number; light?: boolean }) => (
    <div
        className={classNames(
            'rounded-[10px] flex items-center justify-center shrink-0 ring-1 ring-inset',
            light ? 'bg-white/10 ring-white/20' : 'bg-primary ring-white/10',
        )}
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
    variant = 'default',
}) => {
    const isLight = variant === 'light'

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
                <LogoMark size={34} light={isLight} />
                <div className="flex flex-col leading-none">
                    <span
                        className={classNames(
                            'text-[17px] font-bold tracking-tight',
                            isLight ? 'text-white' : 'text-ink',
                        )}
                    >
                        Rolex
                    </span>
                    <span
                        className={classNames(
                            'text-[10px] font-semibold uppercase tracking-[0.18em] mt-1',
                            isLight ? 'text-[#e8cf94]' : 'text-accent',
                        )}
                    >
                        Admin
                    </span>
                </div>
            </div>
            {showSubtitle && (
                <span
                    className={classNames(
                        'text-[11px] font-medium mt-2',
                        isLight ? 'text-white/70' : 'text-ink-3',
                    )}
                >
                    Central Management System
                </span>
            )}
        </div>
    )
}

export default RolexLogo
