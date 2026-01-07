import { type CacheOptions } from '../plugins/cache'
import { type InitializationCallback } from '../plugins/init'
import { type RequestOptions } from '../plugins/request'
import { type RouterOptions } from '../plugins/router'
import { type StoreOptions } from '../plugins/store'

declare global {
  type AppConfigOptions = {
    // 缓存配置
    cache?: CacheOptions

    // 初始化配置
    init?: InitializationCallback

    // 状态管理配置
    store?: StoreOptions

    // 请求配置
    request?: RequestOptions

    // 路由配置
    router?: RouterOptions
  }

  type AppConfigOptionsDefine = (app: VueApp<Element>) => AppConfigOptions
}
