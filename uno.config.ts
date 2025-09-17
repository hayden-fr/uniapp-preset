import { defineConfig, presetIcons, presetWind3 } from 'unocss'
import { presetApplet } from './plugins/uno-preset'
import { presetTheme } from './plugins/uno-theme'

export default defineConfig({
  presets: [presetWind3(), presetIcons(), presetApplet(), presetTheme()],
})
