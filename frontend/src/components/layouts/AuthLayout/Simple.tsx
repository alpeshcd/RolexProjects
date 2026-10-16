import { cloneElement } from 'react'
import Container from '@/components/shared/Container'
import ThemeToggle from '@/components/template/ThemeToggle'
import type { ReactNode, ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

interface SimpleProps extends CommonProps {
    content?: ReactNode
}

const Simple = ({ children, content, ...rest }: SimpleProps) => {
    return (
        <div className="relative min-h-screen w-full bg-canvas flex flex-col justify-center items-center py-10 px-4 overflow-hidden">
            {/* Soft brand glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
                style={{
                    background:
                        'radial-gradient(60% 60% at 50% 0%, var(--primary-subtle) 0%, transparent 70%)',
                }}
            />
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <ThemeToggle />
            </div>
            <Container className="relative z-10 flex flex-col flex-auto items-center justify-center min-w-0 w-full max-w-[420px]">
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
