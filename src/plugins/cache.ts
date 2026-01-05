class UniCache {
  constructor(private options?: CacheOptions) {}

  getStorageKey(key: string) {
    const delimiter = this.options?.delimiter ?? '-'
    const prefix = this.options?.prefix
    return prefix ? `${prefix}${delimiter}${key}` : key
  }

  set(key: string, value: any, expire?: number) {
    const type = typeof value
    const data = {
      type: type,
      value: value,
      expire: expire ? Date.now() + expire : null,
    }
    uni.setStorageSync(this.getStorageKey(key), data)
  }

  get<T = any>(key: string): T | undefined {
    const storageKey = this.getStorageKey(key)
    if (this.has(key)) {
      const content = uni.getStorageSync(storageKey)
      try {
        const data = typeof content === 'string' ? JSON.parse(content) : content
        const { value, expire } = data
        if (expire && expire < Date.now()) {
          this.remove(key)
          return undefined
        }
        return value
      } catch {
        return content
      }
    }
    return undefined
  }

  has(key: string): boolean {
    const storageKey = this.getStorageKey(key)
    const storageInfo = uni.getStorageInfoSync()
    return storageInfo.keys.includes(storageKey)
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

export interface CacheOptions {
  prefix?: string
  delimiter?: string
}

class Cache {
  install(app: VueApp, options: CacheOptions = {}) {
    instance.value = new UniCache(options)
    app.config.globalProperties.$cache = instance.value
  }
}

export function createCache() {
  return new Cache()
}
