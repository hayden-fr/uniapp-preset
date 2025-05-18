import type { CSSEntry, PresetMiniTheme } from 'unocss'
import { definePreset } from 'unocss'

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

const presetApplet = definePreset<PresetMiniTheme>(() => {
  const ctx = new AppletContext()
  return {
    name: 'unocss-preset-applet',
    presets: [presetConditionCompilation()],
    theme: {
      preflightRoot: ['page,:before,:after', '::backdrop'],
    },
    rules: [[/^group(\/.*)?$/, () => ({ content: '""' })]],
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

export default presetApplet
