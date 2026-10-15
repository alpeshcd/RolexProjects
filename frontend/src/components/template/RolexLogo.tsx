import React from 'react'
import classNames from 'classnames'

interface RolexLogoProps {
    collapsed?: boolean
    className?: string
    showSubtitle?: boolean
}

const RolexLogo: React.FC<RolexLogoProps> = ({
    collapsed = false,
    className,
    showSubtitle = false,
}) => {
    if (collapsed) {
        return (
            <div
                className={classNames(
                    'flex items-center justify-center py-2 select-none',
                    className,
                )}
            >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#144865] to-[#25739b] text-white flex items-center justify-center font-black text-lg shadow-sm">
                    R
                </div>
            </div>
        )
    }

    return (
        <div
            className={classNames(
                'flex flex-col items-center justify-center select-none',
                className,
            )}
        >
            {/* Authentic Rolex Panel Brandmark */}
            <div className="relative inline-flex items-center justify-center">
                <span className="text-4xl sm:text-[42px] font-black tracking-[0.08em] text-[#1b4e6d] dark:text-[#67b5e0] leading-none font-sans drop-shadow-sm">
                    ROLEX
                </span>
                <span
                    className="absolute text-[13px] sm:text-[14px] font-extrabold tracking-[0.22em] text-[#42b7cf] dark:text-[#38d8f5] uppercase pointer-events-none select-none drop-shadow"
                    style={{
                        letterSpacing: '0.24em',
                        transform: 'translateY(1px)',
                    }}
                >
                    PANEL
                </span>
            </div>

            {showSubtitle && (
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5">
                    Sports & Gaming Exchange
                </span>
            )}
        </div>
    )
}

export default RolexLogo
