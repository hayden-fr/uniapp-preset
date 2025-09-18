import type { PresetWindTheme, UserConfig } from 'unocss'

type UnoCSSConfig = NonNullable<UserConfig<PresetWindTheme>>

export const theme = {
  colors: {
    primary: {
      DEFAULT: '#1677ff',
      light: '#e6f4ff',
      active: '#0958d9',
    },
    success: {
      DEFAULT: '#52c41a',
      active: '#389e0d',
    },
    warning: {
      DEFAULT: '#faad14',
      active: '#d48806',
    },
    danger: {
      DEFAULT: '#ff4d4f',
      active: '#f5222d',
    },
  },
} as PresetWindTheme

export const rules = [] as UnoCSSConfig['rules']

export const variants = [] as UnoCSSConfig['variants']

export const shortcuts = [
  /**
   * active color shortcuts
   */
  [
    /^(?<prefix>bg|text|border)-(?<color>.*)-active$/,
    (match, ctx) => {
      const { prefix, color } = match.groups!
      const colors = ctx.theme.colors![color]
      if (typeof colors === 'object') {
        if (!Object.prototype.hasOwnProperty.call(colors, 'active')) {
          return `${prefix}-${color}-600`
        }
      }
    },
  ],
] as UnoCSSConfig['shortcuts']

export const preflights = [] as UnoCSSConfig['preflights']

export const safelist = [
  /**
   * 支持 easycom-button 预设颜色
   */
  (context) => {
    const list = new Set<string>()
    const colors = context.theme.colors as PresetWindTheme['colors'] & {}
    for (const color of Object.keys(colors)) {
      // Solid
      list.add('text-white')
      list.add(`bg-${color}`)
      list.add(`after:border-${color}`)
      list.add(`active:bg-${color}-active`)
      list.add(`active:border-${color}-active`)
      // Outlined | Dashed
      list.add('bg-white')
      list.add(`text-${color}`)
      list.add(`after:border-${color}`)
      list.add(`active:text-${color}-active`)
      list.add(`active:after:border-${color}-active`)
      // Filled
      list.add('after:border-none')
      list.add(`text-${color}`)
      list.add(`bg-${color}/10`)
      list.add(`active:text-${color}-active`)
      list.add(`active:bg-${color}/50`)
    }
    return Array.from(list)
  },
] as UnoCSSConfig['safelist']
