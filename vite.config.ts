import uni from '@dcloudio/vite-plugin-uni'
import easycomTypes from 'uniapp-easycom-types'
import autoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uni(),
    easycomTypes({
      dts: 'src/types/easycom.d.ts',
    }),
    autoImport({
      imports: ['vue', 'pinia', 'uni-app'],
      dts: 'src/types/auto-imports.d.ts',
    }),
  ],
})
