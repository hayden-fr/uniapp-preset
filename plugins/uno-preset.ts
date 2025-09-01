import type { CSSEntry, PresetMiniTheme } from 'unocss'
import { definePreset, entriesToCss, mergeConfigs } from 'unocss'

class AppletContext {
  rules: Record<string, string> = {}

  constructor() {
    this.rules = {
      '.': '_d_',
      '/': '_s_',
      ':': '_c_',
      '%': '_p_',
      '!': '_e_',
      '#': '_h_',
      '(': '_lp_',
      ')': '_rp_',
      '[': '_ls_',
      ']': '_rs_',
      ',': '_m_',
      '|': '_o_',
      '&': '_a_',
    }
  }

  createRegExp(patter: string, flags?: string, escape?: boolean) {
    return new RegExp(`${escape ? '\\\\' : ''}\\${patter}`, flags)
  }

  transformClassnames(selector: string, escape?: boolean) {
    let result = selector
    for (const [patter, replacement] of Object.entries(this.rules)) {
      const patterReg = this.createRegExp(patter, 'g', escape)
      result = result.replace(patterReg, replacement)
    }
    return result
  }

  filterReplacements(replacements: string[]) {
    return Array.from(replacements).filter((replacement) => {
      return Object.keys(this.rules).some((patter) => {
        return this.createRegExp(patter).test(replacement)
      })
    })
  }

  transformRem(entry: CSSEntry) {
    const value = entry[1]
    const remReg = /(-?[.\d]+)rem/g
    if (typeof value === 'string' && remReg.test(value)) {
      entry[1] = value.replace(remReg, (_, size) => {
        return `${size * 32}rpx`
      })
    }
  }
}

const presetTransformInvalidCharacter = definePreset(() => {
  const ctx = new AppletContext()
  return {
    name: 'unocss-preset-applet:transform-invalid-character',
    postprocess: [
      (util) => {
        if (util.selector) {
          util.selector = ctx.transformClassnames(util.selector, true)
          util.selector = util.selector.replace(/\\./g, '_a_')
        }
        for (const entry of util.entries) {
          ctx.transformRem(entry)
        }
      },
    ],
    transformers: [
      {
        name: 'transformer-applet-classnames',
        enforce: 'pre',

        async transform(code, _, { uno }) {
          let token = code.toString()

          const { matched } = await uno.generate(token, { preflights: false })
          const replacements = ctx.filterReplacements(Array.from(matched))
          for (let replace of replacements) {
            let replaced = ctx.transformClassnames(replace)

            // 删除负数前缀
            // 负数前缀的 CSS 由 variant 生成
            // 所以带负数前缀的类名不在 rules 范围内
            replace = replace.replace(/^-+/g, '')
            replaced = replaced.replace(/^-+/g, '')

            uno.config.shortcuts.push([replaced, replace, {}])
            token = token.replaceAll(replace, replaced)
          }
          code.overwrite(0, code.original.length, token)
        },
      },
    ],
  }
})

class ConditionCompilation {
  private conditionRegexp = /^ifn?def-\[?(?<platform>[A-Za-z0-9-|]+?)\]?:/i

  isValidConditionCompileString(str: string) {
    return this.conditionRegexp.test(str)
  }

  matchCurrentPlatform(conditionStr: string) {
    const match = conditionStr.match(this.conditionRegexp)
    if (!match) throw new Error(`"${conditionStr}" 不是有效的条件编译`)

    const platform = match.groups!.platform
    const uniPlatform = process.env.UNI_PLATFORM ?? ''
    const currPlatform = uniPlatform.toLowerCase()

    const platforms = platform.toLowerCase().split('|').filter(Boolean)
    const matchedPlatform = platforms.some((name) => {
      if (name === 'app') {
        return currPlatform === 'app' || currPlatform.startsWith('app-')
      }
      if (name === 'mp') {
        return currPlatform === 'mp' || currPlatform.startsWith('mp-')
      }
      if (name === 'h5' || name === 'web') {
        return currPlatform === 'h5' || currPlatform === 'web'
      }
      return name === currPlatform
    })

    const isIfdef = conditionStr.toLowerCase().startsWith('ifdef-')

    return {
      condition: match[0],
      conditionPlatforms: platforms,
      isMatched: matchedPlatform === isIfdef,
    }
  }
}

const presetConditionCompilation = definePreset(() => {
  const ctx = new ConditionCompilation()
  return {
    name: 'unocss-preset-applet:condition-compilation',
    variants: [
      {
        name: 'uniapp-condition-compilation',
        order: 0,
        match: (matcher) => {
          if (ctx.isValidConditionCompileString(matcher)) {
            const { condition, isMatched } = ctx.matchCurrentPlatform(matcher)
            const newMatcher = matcher.replace(condition, '')

            if (isMatched) {
              return { matcher: newMatcher }
            }
            return { matcher: newMatcher, selector: () => '' }
          }
        },
      },
    ],
    transformers: [
      {
        name: 'remove-invalid-classnames',
        enforce: 'pre',

        async transform(code, _, { uno }) {
          let token = code.toString()

          const { matched } = await uno.generate(token, { preflights: false })
          for (const contentStr of matched) {
            if (ctx.isValidConditionCompileString(contentStr)) {
              const { isMatched } = ctx.matchCurrentPlatform(contentStr)
              if (!isMatched) {
                token = token.replaceAll(contentStr, '')
              }
            }
          }
          code.overwrite(0, code.original.length, token)
        },
      },
    ],
  }
})

const presetAppletPreflights = definePreset<object, Record<string, any>>(() => {
  return {
    name: 'unocss-preset-applet:preflights',
    theme: {
      preflightRoot: ['page,:before,:after', '::backdrop'],
    },
    preflights: [
      {
        layer: 'preflights',
        getCSS: ({ theme }) => {
          type CSSProperties = Record<string, string>
          type CSSEntires = [string, CSSProperties][]
          const cssEntries: CSSEntires = [
            [
              'view, image',
              {
                'border-style': 'solid',
                'border-width': '0',
                'border-color': theme.colors?.light[700],
              },
            ],
            ['view, image', { 'box-sizing': 'border-box' }],
            ['page', { height: '100%' }],
          ]

          return cssEntries
            .map(([selector, properties]) => {
              const entries = Object.entries(properties)
              const css = entriesToCss(entries)
              return `${selector} {${css}}`
            })
            .join('')
        },
      },
    ],
  }
})

const presetStylingBasedOnParentState = definePreset(() => {
  return {
    name: 'unocss-preset-applet:styling-based-on-parent-sate',
    rules: [[/^group(\/.*)?$/, () => ({ content: '""' })]],
  }
})

const presetLegacyCompact = definePreset(() => {
  return {
    name: 'unocss-preset-applet:legacy-compact',
    postprocess: [
      (util) => {
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

const presetApplet = definePreset<PresetMiniTheme>(() => {
  return {
    ...mergeConfigs([
      presetAppletPreflights(),
      presetConditionCompilation(),
      presetStylingBasedOnParentState(),
      presetTransformInvalidCharacter(),
      presetLegacyCompact(),
    ]),
    name: 'unocss-preset-applet',
  }
})

export default presetApplet
