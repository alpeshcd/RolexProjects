import classNames from '@/utils/classNames'
import Badge from '@/components/ui/Badge'
import { PiBellDuotone } from 'react-icons/pi'

const NotificationToggle = ({
    className,
    dot,
}: {
    className?: string
    dot: boolean
}) => {
    return (
        <div
            className={classNames(
                'h-9 w-9 !p-0 inline-flex items-center justify-center !rounded-lg border border-line bg-surface text-ink-2 text-lg',
                className,
            )}
        >
            {dot ? (
                <Badge badgeStyle={{ top: '1px', right: '2px' }}>
                    <PiBellDuotone />
                </Badge>
            ) : (
                <PiBellDuotone />
            )}
        </div>
    )
}

export default NotificationToggle
