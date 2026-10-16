import ConfigProvider from '@/components/ui/ConfigProvider'
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd'
import { themeConfig } from '@/configs/theme.config'
import { palette } from '@/configs/palette.config'
import useDarkMode from '@/utils/hooks/useDarkMode'
import useTheme from '@/utils/hooks/useTheme'
import useLocale from '@/utils/hooks/useLocale'
import useDirection from '@/utils/hooks/useDirection'
import type { CommonProps } from '@/@types/common'

const Theme = (props: CommonProps) => {
    useTheme()
    const [isDark] = useDarkMode()
    useDirection()

    const { locale } = useLocale()

    const p = isDark ? palette.dark : palette.light
    const softShadow = isDark
        ? '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04)'
        : '0 8px 24px rgba(22, 32, 27, 0.08), 0 1px 2px rgba(22, 32, 27, 0.06)'

    return (
        <ConfigProvider
            value={{
                locale: locale,
                ...themeConfig,
            }}
        >
            <AntdConfigProvider
                theme={{
                    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                    token: {
                        colorPrimary: p.primary,
                        colorLink: p.primary,
                        colorInfo: p.info,
                        colorSuccess: p.success,
                        colorError: p.error,
                        colorWarning: p.warning,
                        colorBgLayout: p.canvas,
                        colorBgContainer: p.surface,
                        colorBgElevated: isDark ? '#19201c' : '#ffffff',
                        colorFillAlter: p.surface2,
                        colorBorder: p.lineStrong,
                        colorBorderSecondary: p.line,
                        colorSplit: p.line,
                        colorText: p.ink,
                        colorTextHeading: p.ink,
                        colorTextSecondary: p.ink2,
                        colorTextTertiary: p.ink3,
                        colorTextDescription: p.ink3,
                        borderRadius: 8,
                        borderRadiusLG: 12,
                        borderRadiusSM: 6,
                        boxShadow: softShadow,
                        boxShadowSecondary: softShadow,
                        boxShadowTertiary: 'none',
                        fontSize: 13,
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    },
                    components: {
                        Layout: {
                            bodyBg: p.canvas,
                            headerBg: p.surface,
                            siderBg: p.surface,
                        },
                        Card: {
                            paddingLG: 16,
                            headerHeight: 46,
                            headerHeightSM: 42,
                            headerFontSize: 13,
                            headerFontSizeSM: 13,
                            boxShadowTertiary: 'none',
                        },
                        Table: {
                            headerBg: p.surface2,
                            headerColor: p.ink3,
                            headerSplitColor: 'transparent',
                            headerBorderRadius: 10,
                            borderColor: p.line,
                            rowHoverBg: p.surfaceHover,
                            footerBg: p.surface2,
                            fontSize: 12,
                            cellPaddingBlock: 10,
                            cellPaddingInline: 12,
                            cellPaddingBlockSM: 8,
                            cellPaddingInlineSM: 10,
                        },
                        Button: {
                            borderRadius: 8,
                            controlHeight: 34,
                            fontWeight: 500,
                            primaryShadow: 'none',
                            defaultShadow: 'none',
                            dangerShadow: 'none',
                        },
                        Input: {
                            controlHeight: 34,
                            borderRadius: 8,
                            activeShadow: `0 0 0 3px ${p.primary}1f`,
                        },
                        InputNumber: {
                            controlHeight: 34,
                            borderRadius: 8,
                            activeShadow: `0 0 0 3px ${p.primary}1f`,
                        },
                        Select: {
                            controlHeight: 34,
                            borderRadius: 8,
                            optionSelectedBg: `${p.primary}14`,
                            activeOutlineColor: `${p.primary}1f`,
                        },
                        DatePicker: {
                            controlHeight: 34,
                            borderRadius: 8,
                            activeShadow: `0 0 0 3px ${p.primary}1f`,
                        },
                        Modal: {
                            borderRadiusLG: 14,
                            contentBg: isDark ? '#19201c' : '#ffffff',
                            headerBg: isDark ? '#19201c' : '#ffffff',
                            footerBg: 'transparent',
                        },
                        Drawer: {
                            colorBgElevated: p.surface,
                        },
                        Tabs: {
                            horizontalMargin: '0 0 14px 0',
                            inkBarColor: p.primary,
                            itemSelectedColor: p.primary,
                            itemHoverColor: p.primary,
                            itemColor: p.ink2,
                        },
                        Tag: {
                            defaultBg: p.surface2,
                            defaultColor: p.ink2,
                            borderRadiusSM: 6,
                        },
                        Statistic: {
                            titleFontSize: 12,
                            contentFontSize: 22,
                        },
                        Progress: {
                            remainingColor: p.line,
                        },
                        Breadcrumb: {
                            itemColor: p.ink3,
                            lastItemColor: p.ink2,
                            linkColor: p.ink3,
                            linkHoverColor: p.primary,
                            separatorColor: p.lineStrong,
                        },
                        Descriptions: {
                            labelBg: p.surface2,
                        },
                        Segmented: {
                            itemSelectedBg: p.surface,
                            trackBg: p.surface2,
                        },
                        Menu: {
                            itemSelectedBg: `${p.primary}14`,
                            itemSelectedColor: p.primary,
                        },
                    },
                }}
            >
                {props.children}
            </AntdConfigProvider>
        </ConfigProvider>
    )
}

export default Theme
