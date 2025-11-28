import * as Pinia from 'pinia'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { defineOptions } from './config'
import * as Cache from './plugins/cache'
import * as Initialization from './plugins/init'
import * as Logging from './plugins/logging'
import * as Request from './plugins/request'
import * as Router from './plugins/router'
import * as Store from './plugins/store'
import * as Theme from './plugins/theme'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())

  const options = defineOptions(app)
  // 缓存组件
  app.use(Cache.createCache(), options.cache)
  // 日志组件
  app.use(Logging.createLogging())
  // 初始化组件
  app.use(Initialization.createInit(), options.init)
  // 状态组件
  app.use(Store.createStore(), options.store)
  // 请求组件
  app.use(Request.createRequest(), options.request)
  // 路由组件
  app.use(Router.createRouter(), options.router)
  // 主题组件
  app.use(Theme.createTheme())

  app.config.globalProperties.$init()

  return {
    app,
    Pinia,
  }
}
