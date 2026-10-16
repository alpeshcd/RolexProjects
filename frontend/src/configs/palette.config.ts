/**
 * Rolex "Emerald & Gold" palette.
 * Mirrors the CSS variables in src/assets/styles/tailwind/index.css —
 * Ant Design needs concrete color values to derive hover/active states.
 */
export type Palette = {
    primary: string
    accent: string
    canvas: string
    surface: string
    surface2: string
    surfaceHover: string
    line: string
    lineStrong: string
    ink: string
    ink2: string
    ink3: string
    success: string
    error: string
    warning: string
    info: string
}

export const palette: Record<'light' | 'dark', Palette> = {
    light: {
        primary: '#0b6b4d',
        accent: '#a8823a',
        canvas: '#f5f6f3',
        surface: '#ffffff',
        surface2: '#f8f9f6',
        surfaceHover: '#f2f5f1',
        line: '#e6e9e4',
        lineStrong: '#d5dad3',
        ink: '#16201b',
        ink2: '#46524c',
        ink3: '#6e7973',
        success: '#2e8b57',
        error: '#c23b32',
        warning: '#b7791f',
        info: '#2c6cb0',
    },
    dark: {
        primary: '#24996f',
        accent: '#cfaa5e',
        canvas: '#0c100e',
        surface: '#141a17',
        surface2: '#19201c',
        surfaceHover: '#1f2823',
        line: '#262f2b',
        lineStrong: '#323d37',
        ink: '#e8ede9',
        ink2: '#aeb9b3',
        ink3: '#7f8b85',
        success: '#46b37a',
        error: '#eb6b62',
        warning: '#dda143',
        info: '#5f9fe3',
    },
}
