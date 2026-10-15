import { cloneElement } from 'react'
import Container from '@/components/shared/Container'
import type { ReactNode, ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

interface SimpleProps extends CommonProps {
    content?: ReactNode
}

const Simple = ({ children, content, ...rest }: SimpleProps) => {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-100 via-[#e9edf3] to-slate-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col justify-center items-center py-10 px-4">
            <Container className="flex flex-col flex-auto items-center justify-center min-w-0 w-full max-w-[440px]">
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
