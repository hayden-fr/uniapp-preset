declare global {
  interface GlobalConfig {}
}

type PartialConfig = InferDefaults<GlobalConfig>

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

type Primitive = string | number | boolean | bigint | symbol | null | undefined
type ObjectLike = Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>
type BuiltIn = Primitive | AnyFunction | AnyArray | Date | RegExp | ObjectLike

type InferDefaults<T> = T extends BuiltIn
  ? T
  : {
      [K in keyof T]?: InferDefaults<T[K]>
    }

type WithDefaults<T, Defaults extends InferDefaults<T>> = T extends BuiltIn
  ? NonNullable<Defaults>
  : Readonly<Omit<T, keyof Defaults>> & {
      readonly [K in keyof Defaults &
        keyof T]-?: Defaults[K] extends InferDefaults<T[K]>
        ? WithDefaults<T[K], Defaults[K]>
        : Defaults[K]
    }

export function useConfigProvider(): PartialConfig
// prettier-ignore
export function useConfigProvider<DefaultConfig extends InferDefaults<PartialConfig>>(config: DefaultConfig): WithDefaults<PartialConfig, DefaultConfig>
// prettier-ignore
export function useConfigProvider<Key extends ConfigField>(key: Key): InferDefaults<GlobalConfig[Key]> | undefined
// prettier-ignore
export function useConfigProvider<Key extends ConfigField, DefaultConfig extends InferDefaults<GlobalConfig[Key]>>(key: Key, defaultValue: DefaultConfig): WithDefaults<GlobalConfig[Key], DefaultConfig>
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
