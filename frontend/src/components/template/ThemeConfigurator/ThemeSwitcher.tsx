import classNames from '@/utils/classNames'
import { TbCheck } from 'react-icons/tb'
import { colorSchemes, getColorScheme } from '@/configs/palette.config'
import { useThemeStore } from '@/store/themeStore'

const ThemeSwitcher = () => {
    const schema = useThemeStore((state) => state.themeSchema)
    const setSchema = useThemeStore((state) => state.setSchema)
    const mode = useThemeStore((state) => state.mode)

    return (
        <div className="inline-flex items-center gap-2">
            {colorSchemes.map(({ key }) => (
                <button
                    key={key}
                    className={classNames(
                        'h-8 w-8 rounded-full flex items-center justify-center border-2 border-white',
                        getColorScheme(schema).key === key && 'ring-2 ring-primary',
                    )}
                    style={{ backgroundColor: getColorScheme(key).primary[mode] }}
                    onClick={() => setSchema(key)}
                >
                    {getColorScheme(schema).key === key ? (
                        <TbCheck className="text-neutral text-lg" />
                    ) : (
                        <></>
                    )}
                </button>
            ))}
        </div>
    )
}

export default ThemeSwitcher
