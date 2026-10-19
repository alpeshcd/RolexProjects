import { cloneElement } from 'react'
import Container from '@/components/shared/Container'
import ThemeToggle from '@/components/template/ThemeToggle'
import ThemeColorPicker from '@/components/template/ThemeColorPicker'
import RolexLogo from '@/components/template/RolexLogo'
import { PiUsersThreeDuotone, PiArrowsLeftRightDuotone, PiChartLineUpDuotone, PiLockKeyDuotone } from 'react-icons/pi'
import type { ReactNode, ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

interface SimpleProps extends CommonProps {
    content?: ReactNode
}

const highlights = [
    {
        icon: PiUsersThreeDuotone,
        title: 'Clients & accounts',
        description: 'Manage every client and account from one place.',
    },
    {
        icon: PiArrowsLeftRightDuotone,
        title: 'Deposits & withdrawals',
        description: 'Track deposits, UTR entries and withdrawals as they happen.',
    },
    {
        icon: PiChartLineUpDuotone,
        title: 'Statements & stats',
        description: 'Account statements and user stats, always up to date.',
    },
]

const BrandPanel = () => (
    <aside
        className="relative hidden lg:flex w-[46%] max-w-[640px] shrink-0 flex-col justify-between overflow-hidden p-12 xl:p-14 text-white"
        style={{
            background: 'linear-gradient(160deg, var(--primary) 0%, var(--primary-deep) 100%)',
        }}
    >
        {/* Dark mode uses a brighter primary; shade it so the panel stays rich */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden dark:block bg-black/45" />
        {/* Dot grid texture */}
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                maskImage: 'linear-gradient(180deg, #000 0%, transparent 75%)',
                WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 75%)',
            }}
        />
        {/* Soft glows */}
        <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -bottom-32 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #e8cf94 0%, transparent 65%)' }}
        />
        <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 65%)' }}
        />

        <RolexLogo variant="light" className="relative" />

        <div className="relative max-w-[440px]">
            <h1 className="text-[34px] xl:text-[40px] leading-[1.15] font-bold tracking-tight text-white">
                Your entire operation,
                <br />
                <span className="text-[#e8cf94]">one secure panel.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/75 font-normal">
                Sign in to manage clients, accounts and transactions with full visibility and control.
            </p>

            <ul className="mt-10 space-y-5">
                {highlights.map(({ icon: Icon, title, description }) => (
                    <li key={title} className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                            <Icon className="text-xl text-[#e8cf94]" />
                        </span>
                        <div>
                            <div className="text-[14px] font-semibold text-white">{title}</div>
                            <div className="mt-0.5 text-[13px] text-white/65 font-normal">
                                {description}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        <div className="relative flex items-center justify-between text-[12px] text-white/60 font-normal">
            <span className="inline-flex items-center gap-1.5">
                <PiLockKeyDuotone className="text-sm" />
                Secured with 256-bit SSL
            </span>
            <span>© {new Date().getFullYear()} Rolex Admin</span>
        </div>
    </aside>
)

const Simple = ({ children, content, ...rest }: SimpleProps) => {
    return (
        <div className="relative min-h-screen w-full bg-canvas flex">
            <BrandPanel />

            <main className="relative flex-1 min-w-0 flex flex-col overflow-hidden">
                {/* Soft brand glow (small screens, where the brand panel is hidden) */}
                <div
                    aria-hidden
                    className="lg:hidden pointer-events-none absolute inset-x-0 top-0 h-[360px] opacity-70"
                    style={{
                        background:
                            'radial-gradient(60% 60% at 50% 0%, var(--primary-subtle) 0%, transparent 70%)',
                    }}
                />
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
                    <ThemeColorPicker />
                    <ThemeToggle />
                </div>
                <Container className="relative z-10 flex flex-col flex-auto items-center justify-center min-w-0 w-full max-w-[420px] px-4 py-16">
                    <div className="w-full">
                        {content}
                        {children
                            ? cloneElement(children as ReactElement, {
                                  ...rest,
                              })
                            : null}
                    </div>
                </Container>
            </main>
        </div>
    )
}

export default Simple
