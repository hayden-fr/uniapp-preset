import * as plugins_auth from '@/plugins/auth'
import * as plugins_cache from '@/plugins/cache'
import * as plugins_init from '@/plugins/init'
import * as plugins_logging from '@/plugins/logging'
import * as plugins_request from '@/plugins/request'
import * as plugins_router from '@/plugins/router'
import * as plugins_theme from '@/plugins/theme'

export const useAuth: typeof plugins_auth.useAuth = () => {
  return plugins_auth.useAuth()
}
export const useInit: typeof plugins_init.useInit = () => {
  return plugins_init.useInit()
}
export const useRoute: typeof plugins_router.useRoute = () => {
  return plugins_router.useRoute()
}
export const useTheme: typeof plugins_theme.useTheme = () => {
  return plugins_theme.useTheme()
}
export const cache = plugins_cache.getUniCacheInstance()
export const logging = plugins_logging.getUniLoggingInstance()
export const request = plugins_request.getUniHttpRequestInstance()
