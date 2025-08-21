import * as Pinia from 'pinia'
import { createSSRApp } from 'vue'
import App from './App.vue'
import * as Cache from './plugins/cache'
import * as Logging from './plugins/logging'
import * as Request from './plugins/request'
import * as Router from './plugins/router'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())

  app.use(Cache.createCache())

  app.use(Logging.createLogging())

  app.use(Request.createRequest(), {
    baseURL: import.meta.env.APP_BASE_URL,
    interceptors: {
      request(options) {
        // 修改请求参数
        // 例如添加 Authorization
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

  app.use(Router.createGuard())

  return {
    app,
    Pinia,
  }
}
