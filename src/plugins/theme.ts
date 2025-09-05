import { unocssPresetColors } from '@/constants/colors'

declare global {
  type PresetColors = (typeof unocssPresetColors)[number]
}

interface ThemeConfig {
  presetColors: PresetColors[]
}

const injectKey = Symbol() as InjectionKey<ThemeConfig>

class ThemeProvider {
  install(app: VueApp) {
    const presetColors = Array.from(new Set<PresetColors>(unocssPresetColors))

    app.provide(injectKey, { presetColors })
  }
}

export function createTheme() {
  return new ThemeProvider()
}

export function useTheme() {
  const themeConfig = inject<ThemeConfig>(injectKey)!

  const isPresetColor = (color: string): color is PresetColors => {
    return themeConfig.presetColors.includes(color as PresetColors)
  }

  return {
    ...themeConfig,
    isPresetColor,
  }
}
