import { defineConfig, presetWind3 } from 'unocss'
import presetApplet from './build/uno-preset'

export default defineConfig({
  presets: [presetWind3(), presetApplet()],
})
