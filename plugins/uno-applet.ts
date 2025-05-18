import type { Plugin } from 'vite'

export default function UnoCSSApplet(): Plugin[] {
  return [
    {
      name: 'uno-css-applet:virtual-entry',
      enforce: 'pre',

      transform(code, id) {
        // 动态引入 unocss 占位符
        // 不能直接在 src/main.ts 中引入
        // 当前框架出于未知原因会重复解析入口文件，触发 unocss 警告
        if (id.endsWith('/src/main.ts')) {
          return `import 'virtual:uno.css'\n${code}`
        }
      },
    },
    {
      name: 'uno-css-applet:css-to-wxss',
      enforce: 'post',

      generateBundle(_, bundle) {
        // 解决加入 unocss 后，uniapp 无法生成 .wxss 的问题
        const platform = process.env.UNI_PLATFORM
        const specialCssSuffix: Record<string, string> = {
          'mp-alipay': 'acss',
          'mp-lark': 'ttss',
          'mp-qq': 'qss',
          'mp-toutiao': 'ttss',
          'mp-weixin': 'wxss',
        }
        const specialPlatform = Object.keys(specialCssSuffix).join('|')
        const platformRegexp = new RegExp(`(${specialPlatform})`, 'i')
        if (platform && platformRegexp.test(platform)) {
          for (const chunk in bundle) {
            if (chunk.endsWith('.css')) {
              const suffix = `.${specialCssSuffix[platform]}`
              const cssName = chunk.replace('.css', suffix)
              bundle[cssName] = bundle[chunk]
              bundle[cssName].fileName = cssName
              delete bundle[chunk]
            }
          }
        }
      },
    },
  ]
}
