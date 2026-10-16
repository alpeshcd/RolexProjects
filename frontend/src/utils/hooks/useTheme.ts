import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { getPalette, paletteToCssVars } from '@/configs/palette.config'

/** localStorage key read by the inline script in index.html before first paint */
export const THEME_VARS_CACHE_KEY = 'theme-vars'

/** Applies the selected color scheme (for the current mode) as CSS variables. */
function useThemeSchema() {
    const themeSchema = useThemeStore((state) => state.themeSchema)
    const mode = useThemeStore((state) => state.mode)

    useEffect(() => {
        const vars = paletteToCssVars(getPalette(themeSchema, mode))
        const root = document.documentElement

        Object.entries(vars).forEach(([property, value]) => {
            root.style.setProperty(property, value)
        })

        try {
            localStorage.setItem(THEME_VARS_CACHE_KEY, JSON.stringify(vars))
        } catch {
            // Storage unavailable (private mode); only first paint is affected.
        }
    }, [themeSchema, mode])
}

export default useThemeSchema
