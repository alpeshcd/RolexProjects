import React from 'react'
import classNames from 'classnames'
import { Tag } from 'antd'

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
            <div className={classNames('flex items-center justify-center py-2 select-none', className)}>
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    R
                </div>
            </div>
        )
    }

    return (
        <div className={classNames('flex flex-col items-center justify-center select-none py-1', className)}>
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                    R
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans">
                        Rolex
                    </span>
                    <Tag color="blue" className="text-[10px] font-semibold m-0 leading-none py-0.5 px-1.5 rounded">
                        Exchange
                    </Tag>
                </div>
            </div>
            {showSubtitle && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                    Sports & Gaming Portal
                </span>
            )}
        </div>
    )
}

export default RolexLogo
