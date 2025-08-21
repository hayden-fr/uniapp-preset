class UniCache {
  constructor(private prefix: string = 'uni_') {}

  getStorageKey(key: string) {
    return `${this.prefix}${key}`
  }

  set(key: string, value: any) {
    uni.setStorageSync(this.getStorageKey(key), value)
  }

  get<T = any>(key: string): T | null
  get<T = any>(key: string, defaultValue: T): T
  get<T = any>(key: string, defaultValue?: T) {
    return uni.getStorageSync(this.getStorageKey(key)) ?? defaultValue
  }

  remove(key: string) {
    uni.removeStorageSync(this.getStorageKey(key))
  }

  clear() {
    uni.clearStorageSync()
  }
}

const instance = shallowRef({} as UniCache)

export function getUniCacheInstance() {
  return new Proxy(instance.value, {
    get(target, p, receiver) {
      return Reflect.get(instance.value, p, receiver)
    },
  })
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $cache: UniCache
  }
}

interface CacheOptions {
  prefix?: string
}

class Cache {
  install(app: VueApp, options: CacheOptions = {}) {
    instance.value = new UniCache(options.prefix)
    app.config.globalProperties.$cache = instance.value
  }
}

export function createCache() {
  return new Cache()
}
