import appPagesConfig from '@/pages.json'

interface Route extends Omit<UniPage, 'path'> {
  isTabBar: boolean
  fullPath: string
  route: string
  path: string
}

interface UniRouterEachInterceptor {
  (to: Route, from: Route): void
}

class UniRouter {
  readonly pages: readonly UniPage[]

  readonly tabBar?: UniTabBar

  readonly uniIdRouter?: UniIdRouter

  private readonly pagesMap: Record<string, UniPage | undefined> = {}

  readonly homePageRoute: string

  readonly loginPageRoute: string | undefined

  constructor(appConfig: UniAppPagesConfig) {
    this.pages = Object.freeze(appConfig.pages ?? [])
    this.tabBar = Object.freeze(appConfig.tabBar)
    this.uniIdRouter = Object.freeze(appConfig.uniIdRouter)

    const $pagesMap: Record<string, UniPage | undefined> = {}
    for (const page of this.pages) {
      const route = page.path
      $pagesMap[route] = page
    }
    this.pagesMap = Object.freeze($pagesMap)

    this.homePageRoute = this.pages[0].path

    this.loginPageRoute = this.uniIdRouter?.loginPage

    this.enhancementUniNavigate()
    this.interceptedUniNavigate()
  }

  private resolvePath(fullPath: string) {
    const path = fullPath.split('?')[0]
    const route = path.replace(/^\//, '')

    // 首页的兼容路由地址
    if (route === '') {
      const route = this.homePageRoute
      return { route, path, fullPath }
    }
    return { route, path, fullPath }
  }

  getRoute(fullPath: string) {
    const { route, path } = this.resolvePath(fullPath)
    const page = this.pagesMap[route]

    const tabbarItems = this.tabBar?.list ?? []
    const tabBarRoutes = tabbarItems.map((item) => item.pagePath)
    const needLoginPaths = this.uniIdRouter?.needLogin ?? []

    const needLogin = page?.needLogin ?? needLoginPaths.includes(route)

    const pageRoute: Route = {
      path: path,
      route: route,
      fullPath: fullPath,
      needLogin: needLogin ?? false,
      isTabBar: tabBarRoutes.includes(route),
      style: page?.style,
    }
    return pageRoute
  }

  /**
   * 增强路由导航
   */
  private enhancementUniNavigate() {
    const getRoute = this.getRoute.bind(this)
    const pages = this.pages

    // navigateTo 与 redirectTo 不能跳转到 tabBar 页面只能使用 switchTab 跳转
    // 而 switchTab 也不能跳转到非 tabBar 页面
    // 拦截路由后，可能造成目标页面与跳转方法不符的情况，做一个兼容性增强

    const uni_navigateTo = uni.navigateTo
    const uni_redirectTo = uni.redirectTo
    const uni_reLaunch = uni.reLaunch
    const uni_switchTab = uni.switchTab

    uni.navigateTo = function <
      T extends UniNamespace.NavigateToOptions = UniNamespace.NavigateToOptions,
    >(options: T) {
      const { url } = options
      const route = getRoute(url as string)
      if (route.isTabBar) {
        return uni_switchTab(options)
      }
      return uni_navigateTo(options)
    }

    uni.redirectTo = function <
      T extends UniNamespace.RedirectToOptions = UniNamespace.RedirectToOptions,
    >(options: T) {
      const { url } = options
      const route = getRoute(url as string)
      if (route.isTabBar) {
        return uni_switchTab(options)
      }
      return uni_redirectTo(options)
    }

    uni.switchTab = function <
      T extends UniNamespace.SwitchTabOptions = UniNamespace.SwitchTabOptions,
    >(options: T) {
      const { url } = options
      const route = getRoute(url as string)
      if (route.isTabBar) {
        return uni_switchTab(options)
      }
      return uni_navigateTo(options)
    }

    // 某些特殊情况下，无法返回上一个页面
    // 比如分享详情页面，用户打开后无其他页面栈信息，导致使用 uni.navigateBack 失败
    // 模仿原生返回按钮功能，实现当无返回页面栈信息时，reLaunch 到首页
    const uni_navigateBack = uni.navigateBack
    const homePagePath = pages[0]?.path ?? ''

    uni.navigateBack = function <
      T extends
        UniNamespace.NavigateBackOptions = UniNamespace.NavigateBackOptions,
    >(options: T) {
      const currentPages = getCurrentPages()
      if (currentPages.length > 1) {
        return uni_navigateBack(options)
      }

      return uni_reLaunch({
        url: `/${homePagePath}`,
        success: options.success,
        fail: options.fail,
        complete: options.complete,
      })
    }
  }

  private beforeEachInterceptors: UniRouterEachInterceptor[] = []

  beforeEach(interceptor: UniRouterEachInterceptor) {
    this.beforeEachInterceptors.push(interceptor)
  }

  private afterEachInterceptors: UniRouterEachInterceptor[] = []

  afterEach(interceptor: UniRouterEachInterceptor) {
    this.afterEachInterceptors.push(interceptor)
  }

  /**
   * 拦截路由导航
   */
  private interceptedUniNavigate() {
    const getRoute = this.getRoute.bind(this)
    const beforeEachInterceptors = this.beforeEachInterceptors
    const afterEachInterceptors = this.afterEachInterceptors

    const uniNavigateMethods = [
      'navigateTo',
      'redirectTo',
      'reLaunch',
      'switchTab',
    ]

    const createInterceptor = () => {
      interface InvokeCache {
        to: Route
        from: Route
      }

      const invokeCache: { value?: InvokeCache } = {}

      const options: UniNamespace.InterceptorOptions = {
        invoke(result) {
          const to = getRoute(result.url)

          interface PageInstance {
            $page: {
              fullPath: string
            }
          }

          const currentPages = getCurrentPages<PageInstance>()
          const currentPage = currentPages[currentPages.length - 1]
          const from = getRoute(currentPage.$page.fullPath)

          for (const interceptor of beforeEachInterceptors) {
            interceptor(to, from)
          }
          result.url = to.fullPath

          invokeCache.value = { to, from }
        },
        success() {
          const { to, from } = invokeCache.value!
          for (const interceptor of afterEachInterceptors) {
            interceptor(to, from)
          }
        },
        complete() {
          invokeCache.value = undefined
        },
      }

      return options
    }

    for (const method of uniNavigateMethods) {
      uni.addInterceptor(method, createInterceptor())
    }
  }
}

const instance = shallowRef({} as UniRouter)

declare module 'vue' {
  interface ComponentCustomProperties {
    $uniRouter: UniRouter
  }
}

interface RouterOptions {
  beforeEach?: UniRouterEachInterceptor
  afterEach?: UniRouterEachInterceptor
}

class Router {
  install(app: VueApp, options: RouterOptions = {}) {
    const { beforeEach, afterEach } = options

    instance.value = new UniRouter(appPagesConfig)
    if (beforeEach) {
      instance.value.beforeEach(beforeEach)
    }
    if (afterEach) {
      instance.value.afterEach(afterEach)
    }
    app.config.globalProperties.$uniRouter = instance.value
  }
}

/**
 * 实际上是针对 uniapp 路由的增强封装，并非实际路由。
 * 实际路由任然由 uniapp 提供。
 */
export function createRouter() {
  return new Router()
}
