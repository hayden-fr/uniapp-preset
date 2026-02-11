import { type CacheOptions } from '../plugins/cache'
import { type InitializationCallback } from '../plugins/init'
import { type ConfigProviderOptions } from '../plugins/provider'
import { type RequestOptions } from '../plugins/request'
import { type RouterOptions } from '../plugins/router'
import { type StoreOptions } from '../plugins/store'

declare global {
  type AppConfigOptions = {
    /**
     * 全局缓存配置
     */
    cache?: CacheOptions

    /**
     * 应用初始化设置
     */
    init?: InitializationCallback

    /**
     * 全局状态管理
     */
    store?: StoreOptions

    /**
     * 全局请求配置
     */
    request?: RequestOptions

    /**
     * 路由配置
     */
    router?: RouterOptions

    /**
     * 全局组件配置
     */
    config?: ConfigProviderOptions
  }

  type AppConfigOptionsDefine = (app: VueApp<Element>) => AppConfigOptions
}
