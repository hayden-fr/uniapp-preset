import type { DynamicShortcut, PresetWindTheme } from 'unocss'
import { definePreset, entriesToCss, escapeRegExp } from 'unocss'

const appletPreflights = definePreset<object, PresetWindTheme>(() => {
  return {
    name: 'unocss-applet:preflights',
    theme: {
      preflightRoot: ['page,:before,:after', '::backdrop'],
      fontSize: {
        xxs: ['0.625rem', '0.75'],
      },
    },
    preflights: [
      {
        layer: 'preflights',
        getCSS: ({ theme }) => {
          type CSSProperties = Record<string, string>
          type CSSEntry = [string, CSSProperties]
          type CSSEntires = CSSEntry[]

          const getColor = (color: string, alias: string = 'DEFAULT') => {
            const colorValue = theme.colors?.[color]

            type Colors = typeof colorValue
            const resolveColors = (value: Colors): string | undefined => {
              if (typeof value === 'string') {
                return value
              }
              return value ? resolveColors(value[alias]) : undefined
            }
            return resolveColors(colorValue)
          }

          const currPlatform = (process.env.UNI_PLATFORM ?? '').toLowerCase()

          const cssEntries: CSSEntires = [
            ['page', { height: '100%' }],
            [
              'view, image',
              {
                'border-style': 'solid',
                'border-width': '0',
                'border-color': getColor('gray', '300') ?? '#d1d5db',
                'box-sizing': 'border-box',
              },
            ],
          ]

          if (currPlatform === 'h5' || currPlatform === 'web') {
            cssEntries.push([
              '.uni-input-input::-ms-reveal',
              {
                display: 'none',
              },
            ])
          }

          const resolveCSS = ([selector, properties]: CSSEntry) => {
            const entries = Object.entries(properties)
            const css = entriesToCss(entries)
            return `${selector} {${css}}`
          }

          return cssEntries.map(resolveCSS).join('')
        },
      },
    ],
  }
})

const appletLegacyCompact = definePreset<object, PresetWindTheme>(() => {
  return {
    name: 'unocss-applet:legacy-compact',
    postprocess: [
      (util) => {
        // @see https://unocss.dev/presets/legacy-compat
        // 小程序不支持一些新的 CSS 特性，需要使用 @unocss/preset-legacy-compat 进行转换
        // 这里直接将功能复制了过来，源码：https://github.com/unocss/unocss/blob/main/packages-presets/preset-legacy-compat/src/index.ts
        for (const entry of util.entries) {
          let value = entry[1]
          if (typeof value !== 'string') {
            return
          }

          // 微信小程序不支持颜色函数的空白分隔符
          value = value.replace(
            /((?:rgb|hsl)a?)\(([^)]+)\)/g,
            (_, fn: string, v: string) => {
              const [rgb, alpha] = v.split(/\//g).map((i) => i.trim())
              if (alpha && !fn.endsWith('a')) fn += 'a'

              const parts = rgb.split(/,?\s+/).map((i) => i.trim())
              if (alpha) parts.push(alpha)

              return `${fn}(${parts.filter(Boolean).join(', ')})`
            },
          )

          // 微信小程序不支持 oklch 和 oklab
          value = value.replace(/\s*in (oklch|oklab)/g, '')

          entry[1] = value
        }
      },
    ],
  }
})

class AppletInvalidCharacterContext {
  private invalidCharacters = '~!@#$%^&*(){}[]|\\:;"\',.?/'

  /**
   * 过滤出带有无效字符的选择器
   */
  filterInValidCharacter(selectors: ArrayLike<string> | Set<string>) {
    const escapeInvalidCharacters = escapeRegExp(this.invalidCharacters)
    const filterPattern = new RegExp(`[${escapeInvalidCharacters}]`)
    const matchWholeWord = new RegExp(`^[${escapeInvalidCharacters}]$`)
    return Array.from(selectors).filter((selector) => {
      return filterPattern.test(selector) && !matchWholeWord.test(selector)
    })
  }

  /**
   * 将无效字符转换为受支持的类名字符
   *
   * @param selector 选择器
   * @param escape 是否包含转义符，设置为 true 时，会将 \\[char] 视为一个整体进行转换
   */
  transformClassnames(selector: string, escape?: boolean) {
    const legacyMap: Record<string, string> = { '#': 'hex_', '!': 'i_' }
    const pattern = escapeRegExp(this.invalidCharacters)
    const escapeCharacter = escape ? '\\\\' : ''
    const replacePattern = new RegExp(`${escapeCharacter}[${pattern}]`, 'g')
    return selector.replace(replacePattern, (match) => {
      return match in legacyMap ? legacyMap[match] : '_'
    })
  }
}

const appletTransformerInvalidCharacter = definePreset(() => {
  const ctx = new AppletInvalidCharacterContext()
  return {
    name: 'unocss-applet:transformer-invalid-character',
    transformers: [
      {
        name: 'transformer-invalid-character',
        enforce: 'pre',
        transform: async (code, id, { uno }) => {
          let token = code.toString()

          const { matched } = await uno.generate(token, { preflights: false })
          const replacements = ctx.filterInValidCharacter(matched)
          for (let replace of replacements) {
            let replaced = ctx.transformClassnames(replace)

            // navigate 由专用的 variants 进行转化
            replace = replace.replace(/^-+/, '')
            replaced = replaced.replace(/^-+/, '')

            // 将替换后的类名添加到快捷类名中
            // 实现替换类名的映射关系
            uno.config.shortcuts.push([replaced, replace, {}])
            // 对源码进行全局替换
            const escapeReplace = new RegExp(escapeRegExp(replace), 'g')
            token = token.replace(escapeReplace, replaced)
          }
          code.overwrite(0, code.original.length, token)
        },
      },
    ],
    postprocess: [
      (util) => {
        if (util.selector) {
          // 这里的转换器只转换带有转义符号的字符，例如会将 \\. 转换成 _ 而不会将 . 转换成 _
          // eg:
          // 源码类名 group-hover/item:bg-red
          // 被 transformer 转换后的选择器 .group\\/item:hover .group-hover_item_bg-red
          // 使用了转码后字符进行转换后的选择器 .group_item:hover .group-hover_item_bg-red
          util.selector = ctx.transformClassnames(util.selector, true)
        }
      },
    ],
  }
})

/**
 * 对于 group peer 等变体选择器，当指定具体名称时，变体选择器中的 \/ 对小程序来说为非法字符。
 * 添加一个 rule 和 shortcuts 将具名选择器视为一个 class 类名。
 * 方便 appletTransformerInvalidCharacter 的 transformer 识别并进行转换。
 * 在 postprocess 阶段对于具名选择器进行删除。
 */
const appletSpecialPseudoName = definePreset(() => {
  const placeholder = '_'
  const pseudoPrefix = ['group', 'peer', 'parent', 'previous']
  const createPseudoShortcut = (pseudo: string): DynamicShortcut => {
    return [new RegExp(`^${pseudo}\\/(.*)?$`), () => placeholder, {}]
  }

  return {
    name: 'unocss-applet:pseudo-placeholder',
    rules: [[placeholder, { content: '' }]],
    shortcuts: pseudoPrefix.map((pseudo) => createPseudoShortcut(pseudo)),
    postprocess: [
      (util) => {
        for (const pseudo of pseudoPrefix) {
          const pattern = new RegExp(`^\\.${pseudo}_(.*)?$`)
          if (pattern.test(util.selector)) {
            util.entries = []
            break
          }
        }
      },
    ],
  }
})

export const presetApplet = definePreset(() => {
  return {
    name: 'unocss-applet',
    presets: [
      appletPreflights(),
      appletLegacyCompact(),
      appletSpecialPseudoName(),
      appletTransformerInvalidCharacter(),
    ],
  }
})
