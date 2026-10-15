import { cloneElement } from 'react'
import Container from '@/components/shared/Container'
import type { ReactNode, ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

interface SimpleProps extends CommonProps {
    content?: ReactNode
}

const Simple = ({ children, content, ...rest }: SimpleProps) => {
    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-slate-950 flex flex-col justify-center items-center py-10 px-4">
            {/* Ambient Luxury Lighting Orbs */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[140px] pointer-events-none"></div>

            <Container className="relative z-10 flex flex-col flex-auto items-center justify-center min-w-0 w-full max-w-[460px]">
                <div className="w-full">
                    {content}
                    {children
                        ? cloneElement(children as ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </Container>
        </div>
    )
}

export default Simple
