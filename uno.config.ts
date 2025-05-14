import { defineConfig, presetWind3 } from 'unocss'
import presetApplet from './plugins/uno-preset'

export default defineConfig({
  presets: [presetWind3(), presetApplet()],
})
