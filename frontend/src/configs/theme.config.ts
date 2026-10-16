import { THEME_ENUM } from '@/constants/theme.constant'
import { DEFAULT_COLOR_SCHEME } from '@/configs/palette.config'
import { Direction, Mode, ControlSize, LayoutType } from '@/@types/theme'

export type ThemeConfig = {
    themeSchema: string
    direction: Direction
    mode: Mode
    panelExpand: boolean
    controlSize: ControlSize
    layout: {
        type: LayoutType
        sideNavCollapse: boolean
    }
}

// First visit follows the OS setting; afterwards the persisted choice wins.
const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches

/**
 * Since some configurations need to be match with specific themes,
 * we recommend to use the configuration that generated from demo.
 */
export const themeConfig: ThemeConfig = {
    themeSchema: DEFAULT_COLOR_SCHEME,
    direction: THEME_ENUM.DIR_LTR,
    mode: prefersDark ? THEME_ENUM.MODE_DARK : THEME_ENUM.MODE_LIGHT,
    panelExpand: false,
    controlSize: 'md',
    layout: {
        type: THEME_ENUM.LAYOUT_COLLAPSIBLE_SIDE,
        sideNavCollapse: false,
    },
}
