import appPagesConfig from '@/pages.json'
import type { InjectionKey } from 'vue'

declare global {
  interface UniRoute extends Omit<Required<UniPage>, 'path'> {
    isTabBar: boolean
    isHomePage: boolean
    isLoginPage: boolean
    fullPath: string
    route: string
    path: string
  }
}

interface UniRouterEachInterceptor {
  (to: UniRoute, from: UniRoute): void | Promise<void>
}

type UniRouterInterceptorAction = 'beforeEach' | 'afterEach'

interface PageInstance {
  $page: {
    fullPath: string
  }
}

type TabBarBadge = Record<number, boolean | string>
const tabBarBadgeKey = Symbol('tabBarBadge') as InjectionKey<Ref<TabBarBadge>>

class UniRouter {
  globalStyle: UniPageStyle

  pages: UniPage[]

  tabBar: UniTabBar

  uniIdRouter?: UniIdRouter

  private pagesMap: Record<string, UniPage | undefined> = {}

  homePageRoute: string

  loginPageRoute: string | undefined

  readonly init: Promise<void>

  badge: Ref<TabBarBadge>

  constructor(options: { appConfig: UniAppPagesConfig; init: Promise<void> }) {
    this.init = options.init
    const appConfig = options.appConfig
    this.globalStyle = appPagesConfig.globalStyle ?? {}
    this.pages = appConfig.pages ?? []
    this.tabBar = appConfig.tabBar ?? {
      color: 'black',
      selectedColor: 'black',
      list: [],
    }
    this.uniIdRouter = appConfig.uniIdRouter

    const $pagesMap: Record<string, UniPage | undefined> = {}
    for (const page of this.pages) {
      const route = page.path
      $pagesMap[route] = page
    }
    this.pagesMap = Object.freeze($pagesMap)

    this.homePageRoute = this.pages[0].path

    this.loginPageRoute = this.uniIdRouter?.loginPage

    this.badge = ref({})

    this.initialize()
  }

  private resolvePath(fullPath: string) {
    const path = fullPath.split('?')[0]
    const route = path.replace(/^\//, '')

    // 修复 h5 首页的兼容路由地址
    if (route === '') {
      const route = this.homePageRoute
      return { route, path, fullPath }
    }
    return { route, path, fullPath }
  }

  getRoute(routePath: string | string.PageURIString) {
    const fullPath = routePath.toString()
    const { route, path } = this.resolvePath(fullPath)
    const page = this.pagesMap[route]

    const tabbarItems = this.tabBar?.list ?? []
    const tabBarRoutes = tabbarItems.map((item) => item.pagePath)
    const needLoginPaths = this.uniIdRouter?.needLogin ?? []

    const needLogin = page?.needLogin ?? needLoginPaths.includes(route)
    const homePageRoute = this.homePageRoute
    const loginPageRoute = this.loginPageRoute

    const pageRoute: UniRoute = {
      path: path,
      route: route,
      fullPath: fullPath,
      needLogin: needLogin ?? false,
      style: Object.assign({}, this.globalStyle, page?.style),
      isTabBar: tabBarRoutes.includes(route),
      isHomePage: route === homePageRoute,
      isLoginPage: route === loginPageRoute,
    }
    return pageRoute
  }

  interceptors: Record<UniRouterInterceptorAction, UniRouterEachInterceptor[]> =
    {
      beforeEach: [],
      afterEach: [],
    }

  async apply(name: UniRouterInterceptorAction, to: UniRoute, from: UniRoute) {
    const interceptors = this.interceptors[name]

    for (const interceptor of interceptors) {
      await interceptor(to, from)
    }
  }

  register(name: UniRouterInterceptorAction, fn: UniRouterEachInterceptor) {
    this.interceptors[name].push(fn)
  }

  getCurrentRoute() {
    const currentPages = getCurrentPages<PageInstance>()
    const currentPage = currentPages[currentPages.length - 1]
    const fullPath = currentPage.$page?.fullPath ?? `/${currentPage.route}`
    return this.getRoute(fullPath)
  }

  private initialize() {
    const homePageRoute = this.homePageRoute

    const uni_navigateTo = uni.navigateTo.bind(uni)
    const uni_redirectTo = uni.redirectTo.bind(uni)
    const uni_reLaunch = uni.reLaunch.bind(uni)
    const uni_switchTab = uni.switchTab.bind(uni)
    const uni_navigateBack = uni.navigateBack.bind(uni)

    // navigateTo 与 redirectTo 不能跳转到 tabBar 页面只能使用 switchTab 跳转
    // 而 switchTab 也不能跳转到非 tabBar 页面
    // 拦截路由后，可能造成目标页面与跳转方法不符的情况，做一个兼容性增强
    // 而拦截路由需要在实际调用之前拦截，因此需要使用代理模式

    const getRoute = this.getRoute.bind(this)
    const getCurrentRoute = this.getCurrentRoute.bind(this)

    const beforeEach = this.apply.bind(this, 'beforeEach')
    const afterEach = this.apply.bind(this, 'afterEach')

    interface UniNavigateOptions {
      url: string | string.PageURIString
      fail?: (...args: any[]) => void
      success?: (...args: any[]) => void
      complete?: (...args: any[]) => void
    }

    const createInterceptor = <T extends UniNavigateOptions>(
      callback: (options: T) => UniNamespace.PromisifySuccessResult<T, T>,
    ) => {
      return function (options: T) {
        const { url, success } = options
        const to = getRoute(url)
        const from = getCurrentRoute()

        if (typeof success === 'function') {
          Object.assign(options, {
            success: async (res: any) => {
              await afterEach(to, from)
              success(res)
            },
          })
        }

        const result = beforeEach(to, from).then(() => {
          options.url = to.fullPath
          return callback(options)
        })

        if (typeof success === 'function') {
          return void 0
        }
        return result.then((result) => {
          return afterEach(to, from).then(() => result)
        })
      }
    }

    const commonOptionsFields = ['url', 'success', 'fail', 'complete'] as const

    uni.navigateTo = createInterceptor<UniNamespace.NavigateToOptions>(
      (options) => {
        const route = this.getRoute(options.url as string)
        return route.isTabBar
          ? uni_switchTab(_.pick(options, commonOptionsFields))
          : uni_navigateTo(options)
      },
    )
    uni.redirectTo = createInterceptor<UniNamespace.RedirectToOptions>(
      (options) => {
        const route = this.getRoute(options.url as string)
        return route.isTabBar
          ? uni_switchTab(_.pick(options, commonOptionsFields))
          : uni_redirectTo(_.pick(options, commonOptionsFields))
      },
    )
    uni.reLaunch = createInterceptor<UniNamespace.ReLaunchOptions>(
      (options) => {
        const route = this.getRoute(options.url as string)
        return route.isTabBar
          ? uni_switchTab(_.pick(options, commonOptionsFields))
          : uni_reLaunch(_.pick(options, commonOptionsFields))
      },
    )
    uni.switchTab = createInterceptor<UniNamespace.SwitchTabOptions>(
      (options) => {
        const route = this.getRoute(options.url as string)
        return route.isTabBar
          ? uni_switchTab(_.pick(options, commonOptionsFields))
          : uni_navigateTo(_.pick(options, commonOptionsFields))
      },
    )

    // 某些特殊情况下，无法返回上一个页面
    // 比如分享详情页面，用户打开后无其他页面栈信息，导致使用 uni.navigateBack 失败
    // 模仿原生返回按钮功能，实现当无返回页面栈信息时，reLaunch 到首页
    uni.navigateBack = function <
      T extends
        UniNamespace.NavigateBackOptions = UniNamespace.NavigateBackOptions,
    >(options: T) {
      const currentPages = getCurrentPages()
      if (currentPages.length > 1) {
        return uni_navigateBack(options)
      }
      return uni.reLaunch({ ...options, url: `/${homePageRoute}` })
    }

    const badge = ref<TabBarBadge>({})
    this.badge = badge

    // 拦截 tabBar 徽章设置
    if (this.tabBar.custom) {
      uni.setTabBarBadge = function (
        options: UniNamespace.SetTabBarBadgeOptions,
      ) {
        badge.value[options.index] = options.text

        if (options.success) {
          options.success(void 0)
          return
        }
        return Promise.resolve(void 0)
      }

      uni.removeTabBarBadge = function (
        options: UniNamespace.RemoveTabBarBadgeOptions,
      ) {
        delete badge.value[options.index]
        if (options.success) {
          options.success(void 0)
          return
        }
        return Promise.resolve(void 0)
      }

      uni.showTabBarRedDot = function (
        options: UniNamespace.ShowTabBarRedDotOptions,
      ) {
        badge.value[options.index] = true
        if (options.success) {
          options.success(void 0)
          return
        }
        return Promise.resolve(void 0)
      }

      uni.hideTabBarRedDot = function (
        options: UniNamespace.HideTabBarRedDotOptions,
      ) {
        delete badge.value[options.index]
        if (options.success) {
          options.success(void 0)
          return
        }
        return Promise.resolve(void 0)
      }
    }
  }
}

const instance = shallowRef({} as UniRouter)

declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * 增强的路由实列，与 web 端的路由实列做区分
     */
    $$router: UniRouter
  }
}

export interface RouterOptions {
  beforeEach?: UniRouterEachInterceptor
  afterEach?: UniRouterEachInterceptor
}

class Router {
  install(app: VueApp, options: RouterOptions = {}) {
    const { beforeEach, afterEach } = options

    instance.value = new UniRouter({
      appConfig: appPagesConfig,
      init: app.config.globalProperties.$init.promise,
    })
    if (beforeEach) {
      instance.value.register('beforeEach', beforeEach)
    }
    if (afterEach) {
      instance.value.register('afterEach', afterEach)
    }
    app.config.globalProperties.$$router = instance.value
    app.provide(tabBarBadgeKey, instance.value.badge)

    // 等待页面初始化完成
    app.config.globalProperties.$init.register({
      order: -1,
      fn: async () => {
        let currentPage: any
        while (!currentPage) {
          await new Promise((resolve) => setTimeout(resolve, 200))
          const currentPages = getCurrentPages<PageInstance>()
          currentPage = currentPages[currentPages.length - 1]
        }
      },
    })
  }
}

/**
 * 实际上是针对 uniapp 路由的增强封装，并非实际路由。
 * 实际路由任然由 uniapp 提供。
 */
export function createRouter() {
  return new Router()
}

const mountedRouter = ref(false)

export function useRoute() {
  const pages = computed(() => {
    return instance.value.pages
  })

  const badge = inject(tabBarBadgeKey, ref<TabBarBadge>({}))

  const tabBar = computed(() => {
    const list = instance.value.tabBar.list.map((item, index) => {
      return Object.assign({}, item, { badge: badge.value[index] })
    })
    return Object.assign({}, instance.value.tabBar, { list })
  })

  const uniIdRouter = computed(() => {
    return instance.value.uniIdRouter
  })

  const homePageRoute = computed(() => {
    return instance.value.homePageRoute
  })

  const loginPageRoute = computed(() => {
    return instance.value.loginPageRoute
  })

  const route = computed(() => {
    return instance.value.getCurrentRoute()
  })

  onBeforeMount(async () => {
    if (!mountedRouter.value) {
      mountedRouter.value = true
      await instance.value.init
      const originalFullPath = route.value.fullPath
      await instance.value.apply('beforeEach', toValue(route), toValue(route))
      if (originalFullPath !== route.value.fullPath) {
        await uni.navigateTo({ url: route.value.fullPath })
      }
      await instance.value.apply('afterEach', toValue(route), toValue(route))
    }
  })

  return {
    route,
    pages,
    tabBar,
    uniIdRouter,
    homePageRoute,
    loginPageRoute,
  }
}
