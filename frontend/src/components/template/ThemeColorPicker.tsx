import { useState } from 'react'
import { Popover, Segmented, Tooltip } from 'antd'
import { PiPaletteDuotone, PiCheckBold, PiSunDuotone, PiMoonDuotone } from 'react-icons/pi'
import classNames from '@/utils/classNames'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { useThemeStore } from '@/store/themeStore'
import { colorSchemes, getColorScheme } from '@/configs/palette.config'
import type { Mode } from '@/@types/theme'

type ThemeColorPickerProps = {
    className?: string
}

const PickerPanel = () => {
    const [isDark, setMode] = useDarkMode()
    const mode: Mode = isDark ? 'dark' : 'light'
    const activeKey = getColorScheme(useThemeStore((state) => state.themeSchema)).key
    const setSchema = useThemeStore((state) => state.setSchema)

    return (
        <div className="w-[272px]">
            <div className="text-sm font-semibold text-ink">Appearance</div>
            <div className="text-xs text-ink-3 mt-0.5">Pick a color, it applies across the site.</div>

            <div className="section-label mt-4 mb-2">Theme color</div>
            <div className="grid grid-cols-4 gap-2">
                {colorSchemes.map((scheme) => {
                    const active = scheme.key === activeKey
                    return (
                        <button
                            key={scheme.key}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSchema(scheme.key)}
                            className={classNames(
                                'flex flex-col items-center gap-1.5 rounded-lg py-2 border transition-colors',
                                active
                                    ? 'border-primary bg-primary-subtle'
                                    : 'border-transparent hover:bg-surface-hover',
                            )}
                        >
                            <span
                                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs shadow-sm ring-2 ring-surface"
                                style={{ backgroundColor: scheme.primary[mode] }}
                            >
                                {active && <PiCheckBold />}
                            </span>
                            <span
                                className={classNames(
                                    'text-[11px] font-medium',
                                    active ? 'text-ink' : 'text-ink-2',
                                )}
                            >
                                {scheme.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className="section-label mt-4 mb-2">Mode</div>
            <Segmented
                block
                value={mode}
                onChange={(value) => setMode(value as Mode)}
                options={[
                    {
                        value: 'light',
                        label: (
                            <span className="inline-flex items-center gap-1.5">
                                <PiSunDuotone /> Light
                            </span>
                        ),
                    },
                    {
                        value: 'dark',
                        label: (
                            <span className="inline-flex items-center gap-1.5">
                                <PiMoonDuotone /> Dark
                            </span>
                        ),
                    },
                ]}
            />
        </div>
    )
}

const ThemeColorPicker = ({ className }: ThemeColorPickerProps) => {
    const [open, setOpen] = useState(false)

    return (
        <Popover
            content={<PickerPanel />}
            trigger="click"
            placement="bottomRight"
            arrow={false}
            open={open}
            onOpenChange={setOpen}
        >
            <span>
                <Tooltip title="Theme color" open={open ? false : undefined}>
                    <button
                        type="button"
                        aria-label="Change theme color"
                        className={classNames(
                            'h-9 w-9 inline-flex items-center justify-center rounded-lg border border-line bg-surface text-primary hover:bg-surface-hover transition-colors',
                            className,
                        )}
                    >
                        <PiPaletteDuotone className="text-lg" />
                    </button>
                </Tooltip>
            </span>
        </Popover>
    )
}

export default ThemeColorPicker
