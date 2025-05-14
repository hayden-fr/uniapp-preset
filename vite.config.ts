import uni from '@dcloudio/vite-plugin-uni'
import easycomTypes from 'uniapp-easycom-types'
import autoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import UnoCSSApplet from './plugins/uno-applet'

export default defineConfig(async () => {
  const UnoCSS = (await import('unocss/vite')).default

  const envPrefix = 'APP_'

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
  }
})
