import { getUniCacheInstance } from '@/plugins/cache'
import { getUniLoggingInstance } from '@/plugins/logging'
import { getUniHttpRequestInstance } from '@/plugins/request'

export { useAuth } from '@/plugins/auth'
export { useInit } from '@/plugins/init'
export { useRoute } from '@/plugins/router'

export const cache = getUniCacheInstance()
export const logging = getUniLoggingInstance()
export const request = getUniHttpRequestInstance()
