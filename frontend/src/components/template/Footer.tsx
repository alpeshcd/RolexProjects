import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { APP_NAME } from '@/constants/app.constant'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'

export type FooterPageContainerType = 'gutterless' | 'contained'

type FooterProps = {
    pageContainerType: FooterPageContainerType
    className?: string
}

const FooterContent = () => {
    return (
        <div className="flex items-center justify-between flex-auto w-full text-xs text-ink-3">
            <span>
                Copyright &copy; {`${new Date().getFullYear()}`}{' '}
                <span className="font-semibold text-ink-2">{`${APP_NAME}`}</span>. All
                rights reserved.
            </span>
            <div className="">
                <a
                    className="hover:text-primary transition-colors"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    Terms & Conditions
                </a>
                <span className="mx-2 text-line-strong">·</span>
                <a
                    className="hover:text-primary transition-colors"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    Privacy Policy
                </a>
            </div>
        </div>
    )
}

export default function Footer({
    pageContainerType = 'contained',
    className,
}: FooterProps) {
    return (
        <footer
            className={classNames(
                `footer flex flex-auto items-center h-16 ${PAGE_CONTAINER_GUTTER_X}`,
                className,
            )}
        >
            {pageContainerType === 'contained' ? (
                <Container>
                    <FooterContent />
                </Container>
            ) : (
                <FooterContent />
            )}
        </footer>
    )
}
