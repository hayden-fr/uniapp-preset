import uni from '@dcloudio/vite-plugin-uni'
import easycomTypes from 'uniapp-easycom-types'
import autoImport from 'unplugin-auto-import/vite'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import { UnoCSSApplet } from './plugins/uno-applet'

export default defineConfig(async ({ mode }) => {
  const UnoCSS = (await import('unocss/vite')).default

  const envPrefix = 'APP_'
  const env = loadEnv(mode, process.cwd(), envPrefix)

  const proxy: Record<string, string | ProxyOptions> = {}
  if (env.APP_BASE_URL && env.APP_PROXY_URL) {
    proxy[env.APP_BASE_URL] = {
      target: env.APP_PROXY_URL,
      changeOrigin: true,
      rewrite: (path) => path.replace(new RegExp(`^${env.APP_BASE_URL}`), ''),
    }
  }

  return {
    envPrefix: envPrefix,
    plugins: [
      uni(),
      UnoCSS(),
      UnoCSSApplet(),
      easycomTypes({
        dts: 'src/types/easycom.d.ts',
      }),
      autoImport({
        imports: ['vue', 'pinia', 'uni-app', { 'lodash-es': [['*', '_']] }],
        dts: 'src/types/auto-imports.d.ts',
        dirs: ['src/hooks', 'src/stores', 'src/utils'],
      }),
    ],
    server: {
      proxy: proxy,
    },
  }
})
