/**
 * Color schemes for the whole site.
 *
 * Each scheme sets the brand color and tints every neutral (background,
 * sidebar, cards, borders, text) toward its hue, so switching schemes
 * recolors the entire layout. The generated values feed both the CSS
 * variables (see useTheme) and Ant Design's theme tokens (see Theme.tsx).
 * The CSS defaults in src/assets/styles/tailwind/index.css are only a
 * first-paint fallback for the default scheme.
 */
import type { Mode } from '@/@types/theme'

export type Palette = {
    primary: string
    primaryDeep: string
    primaryMild: string
    primarySubtle: string
    accent: string
    accentSubtle: string
    canvas: string
    surface: string
    surface2: string
    surfaceHover: string
    elevated: string
    line: string
    lineStrong: string
    ink: string
    ink2: string
    ink3: string
    success: string
    error: string
    warning: string
    info: string
    grays: Record<GrayStep, string>
}

type GrayStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export type ColorScheme = {
    key: string
    label: string
    /** Brand color per mode (dark is lighter so it reads on dark surfaces) */
    primary: Record<Mode, string>
    /** Hue (0-360) the neutrals are tinted toward */
    neutralHue: number
    /** Neutral saturation multiplier: 1 = default tint, lower = greyer */
    tint: number
}

export const DEFAULT_COLOR_SCHEME = 'emerald'

export const colorSchemes: ColorScheme[] = [
    { key: 'emerald', label: 'Emerald', primary: { light: '#0b6b4d', dark: '#24996f' }, neutralHue: 110, tint: 1 },
    { key: 'blue', label: 'Sapphire', primary: { light: '#1d5fbf', dark: '#3d84e6' }, neutralHue: 215, tint: 1 },
    { key: 'indigo', label: 'Indigo', primary: { light: '#4338ca', dark: '#6b68ef' }, neutralHue: 235, tint: 1 },
    { key: 'violet', label: 'Violet', primary: { light: '#6d28d9', dark: '#8f63ee' }, neutralHue: 262, tint: 0.9 },
    { key: 'rose', label: 'Rose', primary: { light: '#be185d', dark: '#e2508f' }, neutralHue: 335, tint: 0.85 },
    { key: 'red', label: 'Crimson', primary: { light: '#b42335', dark: '#e0525f' }, neutralHue: 5, tint: 0.8 },
    { key: 'orange', label: 'Amber', primary: { light: '#c2570c', dark: '#ea7d32' }, neutralHue: 30, tint: 0.9 },
    { key: 'graphite', label: 'Graphite', primary: { light: '#334155', dark: '#7b8aa0' }, neutralHue: 215, tint: 0.55 },
]

/* ---------- color helpers ---------- */

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n))

const hslToHex = (h: number, s: number, l: number) => {
    const sat = clamp(s) / 100
    const lig = clamp(l) / 100
    const k = (n: number) => (n + h / 30) % 12
    const a = sat * Math.min(lig, 1 - lig)
    const f = (n: number) =>
        lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    const toHex = (x: number) =>
        Math.round(x * 255)
            .toString(16)
            .padStart(2, '0')
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

const hexToHsl = (hex: string): [number, number, number] => {
    const v = hex.replace('#', '')
    const r = parseInt(v.slice(0, 2), 16) / 255
    const g = parseInt(v.slice(2, 4), 16) / 255
    const b = parseInt(v.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    if (max === min) return [0, 0, l * 100]
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    return [h * 60, s * 100, l * 100]
}

const shade = (hex: string, deltaL: number) => {
    const [h, s, l] = hexToHsl(hex)
    return hslToHex(h, s, l + deltaL)
}

/* ---------- palette generation ---------- */

const status: Record<Mode, Pick<Palette, 'success' | 'error' | 'warning' | 'info'>> = {
    light: { success: '#2e8b57', error: '#c23b32', warning: '#b7791f', info: '#2c6cb0' },
    dark: { success: '#46b37a', error: '#eb6b62', warning: '#dda143', info: '#5f9fe3' },
}

const accent: Record<Mode, string> = { light: '#a8823a', dark: '#cfaa5e' }

export const getColorScheme = (key?: string) =>
    colorSchemes.find((s) => s.key === key) ??
    (colorSchemes.find((s) => s.key === DEFAULT_COLOR_SCHEME) as ColorScheme)

export const getPalette = (schemeKey: string | undefined, mode: Mode): Palette => {
    const scheme = getColorScheme(schemeKey)
    const h = scheme.neutralHue
    const t = scheme.tint
    const n = (sat: number, light: number) => hslToHex(h, sat * t, light)
    const primary = scheme.primary[mode]
    const isDark = mode === 'dark'

    const grays: Palette['grays'] = {
        50: n(16, 97.5),
        100: n(14, 95),
        200: n(12, 90),
        300: n(10, 84),
        400: n(7, 66),
        500: n(6, 47),
        600: n(7, 34),
        700: n(10, 19),
        800: n(13, 8.5),
        900: n(14, 7),
        950: n(16, 5.5),
    }

    const neutrals = isDark
        ? {
              canvas: n(16, 5.5),
              surface: n(13, 8.5),
              surface2: n(12, 10.5),
              surfaceHover: n(11, 13.5),
              elevated: n(12, 10.5),
              line: n(10, 16.5),
              lineStrong: n(9, 21.5),
              ink: n(12, 92),
              ink2: n(7, 70),
              ink3: n(5, 52),
          }
        : {
              canvas: n(16, 96),
              surface: '#ffffff',
              surface2: n(18, 97.8),
              surfaceHover: n(20, 95),
              elevated: '#ffffff',
              line: n(14, 90),
              lineStrong: n(11, 84),
              ink: n(20, 11),
              ink2: n(9, 30),
              ink3: n(7, 45),
          }

    return {
        primary,
        primaryDeep: shade(primary, -7),
        primaryMild: shade(primary, 6),
        primarySubtle: `${primary}${isDark ? '26' : '14'}`,
        accent: accent[mode],
        accentSubtle: `${accent[mode]}${isDark ? '1f' : '1a'}`,
        ...neutrals,
        ...status[mode],
        grays,
    }
}

/** CSS custom properties for a palette (consumed by Tailwind tokens). */
export const paletteToCssVars = (p: Palette): Record<string, string> => {
    const vars: Record<string, string> = {
        '--primary': p.primary,
        '--primary-deep': p.primaryDeep,
        '--primary-mild': p.primaryMild,
        '--primary-subtle': p.primarySubtle,
        '--accent': p.accent,
        '--accent-subtle': p.accentSubtle,
        '--canvas': p.canvas,
        '--surface': p.surface,
        '--surface-2': p.surface2,
        '--surface-hover': p.surfaceHover,
        '--line': p.line,
        '--line-strong': p.lineStrong,
        '--ink': p.ink,
        '--ink-2': p.ink2,
        '--ink-3': p.ink3,
        '--success': p.success,
        '--error': p.error,
        '--warning': p.warning,
        '--info': p.info,
    }
    Object.entries(p.grays).forEach(([step, value]) => {
        vars[`--gray-${step}`] = value
    })
    return vars
}
