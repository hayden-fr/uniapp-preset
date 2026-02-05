const config = {
  accessTokenCacheName: 'access_token',
}

declare global {
  interface UniGlobalStoreValue {
    /**
     * 用户登录凭证
     */
    accessToken?: string
    /**
     * 租户ID
     */
    tenantId?: string
  }

  /**
   * 自定义列表数据类型
   */
  interface DefineListContainerType<Data extends AnyObject = AnyObject> {
    pagination: {
      current: number
      size: number
      total: number
    }
    response: {
      records: Data[]
      current: number
      size: number
      total: number
    }
  }
}

export const defineOptions: AppConfigOptionsDefine = (app) => {
  return {
    // 缓存配置
    cache: {
      prefix: 'app',
    },

    // 初始化配置
    init: async () => {
      const $cache = app.config.globalProperties.$cache
      const $store = app.config.globalProperties.$store

      // 获取当前租户
      $store.tenantId = $cache.get('tenantId') ?? '1'

      let accessToken: string | undefined = undefined

      // 获取缓存的 accessToken
      accessToken = $cache.get(config.accessTokenCacheName)

      // 从 url 中获取 accessToken
      const { query } = uni.getLaunchOptionsSync()
      if (query.access_token) {
        accessToken = query.access_token
      }

      const $request = app.config.globalProperties.$request
      if (!accessToken) {
        // 如果没有访问令牌，则取消所有等待发出的请求
        $request.cancel()
      }

      $store.accessToken = accessToken
    },

    // 状态管理配置
    store: {
      onUpdate(value, oldValue) {
        const $cache = app.config.globalProperties.$cache
        const $$router = app.config.globalProperties.$$router

        const { loginPageRoute } = $$router

        // 当访问令牌更新，缓存当前访问令牌
        const originalAccessToken = oldValue.accessToken
        const accessToken = value.accessToken
        if (accessToken != originalAccessToken) {
          $cache.set(config.accessTokenCacheName, accessToken)

          // 当访问令牌无效时，跳转到登录页面
          if (!accessToken) {
            uni.reLaunch({
              url: `/${loginPageRoute}`,
            })
          }
        }
      },
    },

    // 请求配置
    request: {
      baseURL: import.meta.env.APP_BASE_URL,
      interceptors: {
        request(options) {
          const $store = app.config.globalProperties.$store
          const { accessToken, tenantId } = $store

          if (accessToken) {
            options.header['Authorization'] ??= `Bearer ${accessToken}`
          }

          if (tenantId) {
            options.header['Tenant-Id'] ??= tenantId
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
    },

    // 路由配置
    router: {
      beforeEach(to) {
        const $$router = app.config.globalProperties.$$router
        const $store = app.config.globalProperties.$store
        const accessToken = $store.accessToken
        const { loginPageRoute } = $$router

        if (to.needLogin && !accessToken) {
          const redirect = encodeURIComponent(to.fullPath)
          to.fullPath = `/${loginPageRoute}?redirect=${redirect}`
        }
        if (to.isLoginPage && accessToken) {
          to.fullPath = `/pages/demo/home`
        }
        if (to.isHomePage) {
          to.fullPath = `/pages/demo/home`
        }
      },
    },

    config: {
      listContainerHook: {
        resolvePagination: (pagination) => {
          return {
            current: pagination.page,
            size: pagination.size,
            total: pagination.total,
          }
        },
        resolveResponse: (response) => {
          return {
            records: response.records,
            pagination: {
              current: response.current,
              size: response.size,
              total: response.total,
            },
          }
        },
      },
    },
  }
}
