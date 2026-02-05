declare global {
  interface GlobalConfig {}
}

type PartialConfig = DeepOptional<GlobalConfig>

const configKey = Symbol('ConfigProvider') as InjectionKey<PartialConfig>

export type ConfigProviderOptions = PartialConfig

class ConfigProvider {
  install(app: VueApp, options: ConfigProviderOptions = {}) {
    app.provide(configKey, options)
  }
}

export function createConfigProvider() {
  return new ConfigProvider()
}

type ConfigField = keyof GlobalConfig

// prettier-ignore
type WithDefaults<T, Defaults extends DeepOptional<T>> = T extends (...args: any[]) => any
  ? T
  : Prettify<
      {
        readonly [K in keyof T as K extends keyof Defaults ? K : never]-?: [T[K], Defaults[K]] extends [infer U, infer D]
          ? D extends DeepOptional<U>
            ? WithDefaults<U, D>
            : U
          : never
      } & {
        readonly [K in keyof T as K extends keyof Defaults ? never : K]: T[K]
      }
    >

export function useConfigProvider(): PartialConfig
// prettier-ignore
export function useConfigProvider<DefaultConfig extends DeepOptional<PartialConfig>>(config: DefaultConfig): WithDefaults<PartialConfig, DefaultConfig>
// prettier-ignore
export function useConfigProvider<Key extends ConfigField>(key: Key): DeepOptional<GlobalConfig[Key]> | undefined
// prettier-ignore
export function useConfigProvider<Key extends ConfigField, DefaultConfig extends DeepOptional<GlobalConfig[Key]>>(key: Key, defaultValue: DefaultConfig): WithDefaults<GlobalConfig[Key], DefaultConfig>
export function useConfigProvider<Key extends ConfigField>(
  keyOrConfig?: ConfigField | PartialConfig,
  defaultValue?: GlobalConfig[Key],
) {
  const config = inject(configKey, {})

  let defaultConfig: PartialConfig = {}
  let customConfig: PartialConfig = {}

  if (typeof keyOrConfig === 'string') {
    defaultConfig = { [keyOrConfig]: defaultValue }
  } else {
    customConfig = keyOrConfig || {}
  }

  const mergedConfig = _.defaultsDeep({}, customConfig, config)
  const returnConfig = _.defaultsDeep({}, mergedConfig, defaultConfig)

  provide(configKey, mergedConfig)

  return typeof keyOrConfig === 'string'
    ? returnConfig[keyOrConfig]
    : returnConfig
}
