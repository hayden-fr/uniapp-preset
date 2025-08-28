import * as Pinia from 'pinia'
import { createSSRApp } from 'vue'
import App from './App.vue'
import * as Auth from './plugins/auth'
import * as Cache from './plugins/cache'
import * as Logging from './plugins/logging'
import * as Request from './plugins/request'
import * as Router from './plugins/router'

const config = {
  accessTokenCacheName: 'access_token',
}

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())

  app.use(Cache.createCache())

  app.use(Logging.createLogging())

  app.use(Auth.createAuth(), {
    initialAccessToken() {
      const $cache = app.config.globalProperties.$cache

      // 从本地缓存中获取 accessToken
      const accessToken = $cache.get<string>(config.accessTokenCacheName)
      return accessToken
    },
    onChange(accessToken) {
      const $cache = app.config.globalProperties.$cache
      $cache.set(config.accessTokenCacheName, accessToken)

      const $$router = app.config.globalProperties.$$router
      const { loginPageRoute } = $$router

      if (!accessToken) {
        uni.reLaunch({
          url: `/${loginPageRoute}`,
        })
      }
    },
  })

  app.use(Request.createRequest(), {
    baseURL: import.meta.env.APP_BASE_URL,
    interceptors: {
      request(options) {
        const accessToken = app.config.globalProperties.$accessToken

        if (accessToken) {
          options.header['Authorization'] = `Bearer ${accessToken}`
        }

        return options
      },
      response(response) {
        // 统一处理响应数据，将返回数据进行解包
        const responseData = response.data as AnyObject
        response.data = responseData.data

        // 当 response.errMsg 不等于 'request:ok' 时，会视为请求错误
        // 可以根据 response 的状态码，响应数据等信息，设置 response.errMsg 阻止响应完成
        // response.errMsg = '自定义错误信息'

        return response
      },
    },
  })

  app.use(Router.createRouter(), {
    beforeEach(to) {
      const accessToken = app.config.globalProperties.$accessToken
      const $$router = app.config.globalProperties.$$router
      const { loginPageRoute } = $$router

      if (to.needLogin && !accessToken) {
        to.fullPath = `/${loginPageRoute}?redirect=${encodeURIComponent(to.fullPath)}`
      }
    },
  })

  return {
    app,
    Pinia,
  }
}
