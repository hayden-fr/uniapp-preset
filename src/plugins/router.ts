import appPagesConfig from '@/pages.json'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'

const NAVIGATE_METHOD = [
  'navigateTo',
  'redirectTo',
  'reLaunch',
  'switchTab',
] as const

type NavigateMethod = (typeof NAVIGATE_METHOD)[number]

interface Route extends Omit<UniPage, 'path'> {
  type: NavigateMethod
  isTabBar: boolean
  fullPath: string
  route: string
  path: string
}

interface RouterGuardOptions {
  beforeEach?: (to: Route, from: Route) => void
  afterEach?: (to: Route, from: Route) => void
}

interface UniNavigateResult {
  url: string
  [x: string]: string
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $appPagesConfig: DeepReadonly<UnwrapNestedRefs<UniAppPagesConfig>>
  }
}

class RouterGuard {
  install(app: VueApp, options: RouterGuardOptions = {}) {
    const { beforeEach, afterEach } = options

    const globalProperties = app.config.globalProperties

    globalProperties.$appPagesConfig = readonly(appPagesConfig)

    const pages = appPagesConfig.pages ?? []
    const tabbarConfig = appPagesConfig.tabBar
    const tabbarItems = tabbarConfig?.list ?? []
    const tabBarRoutes = tabbarItems.map((item) => item.pagePath)
    const needLoginPaths = appPagesConfig.uniIdRouter?.needLogin ?? []

    const $pages: Record<string, UniPage | undefined> = {}
    for (const page of pages) {
      const route = page.path
      $pages[route] = page
    }

    const getRoute = (type: NavigateMethod, fullPath: string): Route => {
      const path = fullPath.split('?')[0]
      const route = path.replace(/^\//, '')
      const routePage = $pages[route]

      const needLogin = routePage?.needLogin ?? needLoginPaths.includes(route)

      const pageRoute: Route = {
        type: type,
        path: path,
        route: route,
        fullPath: fullPath,
        needLogin: needLogin ?? false,
        isTabBar: tabBarRoutes.includes(route),
        style: routePage?.style,
      }
      return pageRoute
    }

    const createInterceptor = (method: NavigateMethod) => {
      interface InvokeCache {
        to?: Route
        from?: Route
      }

      const invokeCache: { value: InvokeCache } = { value: {} }

      const options: UniNamespace.InterceptorOptions = {
        invoke(result: UniNavigateResult) {
          const to = getRoute(method, result.url)

          const currentPages = getCurrentPages()
          const currentPage = currentPages[currentPages.length - 1]
          const from = getRoute(method, currentPage.$vm.$page.fullPath)

          beforeEach?.(to, from)
          result.url = to.fullPath
          invokeCache.value = { to, from }
        },
        success() {
          afterEach?.(invokeCache.value.to!, invokeCache.value.from!)
        },
        complete() {
          invokeCache.value = {}
        },
      }
      return options
    }

    for (const method of NAVIGATE_METHOD) {
      uni.addInterceptor(method, createInterceptor(method))
    }
  }
}

export function createGuard(): RouterGuard {
  return new RouterGuard()
}
