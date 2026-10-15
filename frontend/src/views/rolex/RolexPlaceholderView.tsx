import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import { MdArrowBack } from 'react-icons/md'

interface RolexPlaceholderProps {
    title: string
    subtitle?: string
}

const RolexPlaceholderView: React.FC<RolexPlaceholderProps> = ({ 
    title, 
    subtitle = "This screen will be populated based on your provided screenshot." 
}) => {
    const navigate = useNavigate()

    return (
        <div className="flex-1 w-full p-4 sm:p-6 bg-slate-50/70 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
            {/* Top Bar Row: Title & Breadcrumbs */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-black tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                        {title}
                    </h1>
                    <Tag className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-bold text-[10px]">
                        MODULE READY
                    </Tag>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    <span className="hover:text-teal-700 cursor-pointer" onClick={() => navigate('/home')}>Home</span>
                    <span className="mx-1.5 text-gray-400">/</span>
                    <span className="text-teal-700 dark:text-teal-400 font-semibold">{title}</span>
                </div>
            </div>

            {/* Content Container using Theme Card */}
            <Card className="shadow-sm border-gray-200/80 dark:border-gray-800 rounded-2xl text-center py-8">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-teal-500/10 to-cyan-500/10 text-teal-700 dark:text-teal-400 mb-4 text-2xl font-black">
                    ROLEX PANEL
                </div>
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-2">
                    {title} Module
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    {subtitle}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Tag className="px-3 py-1 bg-teal-50 border-teal-200 text-teal-700 text-xs font-mono">
                        Awaiting Screenshot Specification
                    </Tag>
                    <Button
                        size="sm"
                        variant="plain"
                        onClick={() => navigate('/home')}
                        icon={<MdArrowBack />}
                        className="text-xs font-bold"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default RolexPlaceholderView
