import { Tooltip } from 'antd'
import { PiSunDuotone, PiMoonDuotone } from 'react-icons/pi'
import classNames from '@/utils/classNames'
import useDarkMode from '@/utils/hooks/useDarkMode'

type ThemeToggleProps = {
    className?: string
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
    const [isDark, setMode] = useDarkMode()
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

    return (
        <Tooltip title={label}>
            <button
                type="button"
                aria-label={label}
                onClick={() => setMode(isDark ? 'light' : 'dark')}
                className={classNames(
                    'relative h-9 w-9 inline-flex items-center justify-center rounded-lg border border-line bg-surface text-ink-2 hover:text-ink hover:bg-surface-hover transition-colors',
                    className,
                )}
            >
                <PiSunDuotone
                    className={classNames(
                        'absolute text-lg text-accent transition-all duration-300',
                        isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50',
                    )}
                />
                <PiMoonDuotone
                    className={classNames(
                        'absolute text-lg transition-all duration-300',
                        isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100',
                    )}
                />
            </button>
        </Tooltip>
    )
}

export default ThemeToggle
