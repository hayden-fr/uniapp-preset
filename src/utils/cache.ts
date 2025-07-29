import config from '@/config'

declare global {
  interface CustomConfig {
    cache?: {
      prefix?: string
    }
  }
}

class UniCache {
  private static instance: UniCache | null = null
  public static getInstance() {
    if (!UniCache.instance) {
      UniCache.instance = new UniCache()
    }
    return UniCache.instance
  }

  private prefix: string = config.cache?.prefix || 'uni_'

  private constructor() {}

  private getKey(key: string) {
    return `${this.prefix}${key}`
  }

  set(key: string, value: any) {
    uni.setStorageSync(this.getKey(key), value)
  }

  get<T = any>(key: string): T | null
  get<T = any>(key: string, defaultValue: T): T
  get<T = any>(key: string, defaultValue?: T) {
    return uni.getStorageSync(this.getKey(key)) ?? defaultValue
  }

  remove(key: string) {
    uni.removeStorageSync(this.getKey(key))
  }

  clear() {
    uni.clearStorageSync()
  }
}

export const uniCache = UniCache.getInstance()
