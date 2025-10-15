class RacingRequestTask {
  private static instance: RacingRequestTask

  private requestTaskMap: Map<string, UniApp.RequestTask> = new Map()

  static getInstance() {
    return this.instance ?? (this.instance = new RacingRequestTask())
  }

  add(url: string, requestTask: UniApp.RequestTask) {
    this.remove(url)
    this.requestTaskMap.set(url, requestTask)
  }

  remove(url: string) {
    if (this.requestTaskMap.has(url)) {
      const requestTask = this.requestTaskMap.get(url)
      requestTask?.abort()
      this.requestTaskMap.delete(url)
    }
  }
}

declare global {
  /**
   * UniHttpRequest 请求配置
   */
  interface UniHttpRequestOptions extends UniAppRequestOptionsWithoutCallback {
    /**
     * 基础请求路径
     */
    baseURL?: string
    /**
     * 查询参数，内置了一个简单的解析器，用于将参数对象转换为查询字符串
     */
    params?: AnyObject
    /**
     * 控制查询参数格式化数组索引的设置
     *
     * 允许设置的值：true | false
     *
     * - 未设置: foo=bar&foo=bar
     * - true: foo[0]=bar&foo[1]=bar
     * - false: foo[]=bar&foo[]=bar
     */
    paramsIndexes?: boolean
    /**
     * 使用 FormData 作为请求体
     */
    useMultipartFormData?: boolean
    /**
     * 请求拦截
     */
    interceptors?: InterceptOptions
    /**
     * 竞态条件，使用字符串作为竞态条件判断值，若同一时间存在相同条件，则取消较旧的请求
     *
     * 允许设置的值： string | boolean | undefined
     * - 直接设置字符串表示当前使用的竞态条件
     * - 设置为 true 表示使用当前 URL 作为竞态条件
     * - 设置为 false 表示当前请求不使用竞态条件
     * - undefined 表示跳过当前竞态条件判断，使用下一个竞态条件
     * - 可以传入一个函数，动态的返回设置值，返回值遵循上述规则
     */
    raceCondition?:
      | string
      | boolean
      | ((options: UniHttpRequestOptions) => string | boolean | undefined)
    /**
     * 日志输出实列
     */
    logging?: LoggingInterface
    /**
     * 初始化完成标识
     */
    init?: Promise<void>
    /**
     * 跳过初始化检查
     */
    skipInitialized?: boolean
  }

  /**
   * UniHttpRequest 请求响应
   */
  type UniHttpRequestResponse = UniApp.RequestSuccessCallbackResult

  /**
   * 请求拦截器
   */
  interface InterceptOptions {
    /**
     * 请求拦截
     */
    request?: (options: UniHttpRequestOptions) => UniHttpRequestOptions
    /**
     * 响应拦截
     */
    response?: (response: UniHttpRequestResponse) => UniHttpRequestResponse
  }

  type UniAppRequestOptionsWithoutCallback = Omit<
    UniApp.RequestOptions,
    'success' | 'fail' | 'complete'
  >
}

/**
 * 快捷请求配置
 */
type QuickRequestOptions = Omit<UniHttpRequestOptions, 'method'>

type ExcludeFormUniHttpRequestOptions<K extends keyof UniHttpRequestOptions> =
  Omit<UniHttpRequestOptions, K>

type UniHttpRequestConstructorOptions = ExcludeFormUniHttpRequestOptions<
  'url' | 'method' | 'data' | 'skipInitialized'
>

class UniHttpRequest {
  private racingRequestTask: RacingRequestTask

  private logging: LoggingInterface

  private init: Promise<void>

  constructor(private config: UniHttpRequestConstructorOptions = {}) {
    this.racingRequestTask = new RacingRequestTask()
    this.logging = config.logging ?? window.console
    this.init = config.init ?? Promise.resolve()
  }

  /**
   * 动态修改 request 配置
   * @param config
   */
  setConfig(config: AnyObject) {
    this.config = _.merge({}, this.config, _.cloneDeep(config))
  }

  private parseMultipartFormData(requestOptions: UniHttpRequestOptions) {
    const fields = requestOptions.data as AnyObject

    const boundary = '--------' + Math.random().toString(16).substring(2)
    let body = ''

    // 添加普通字段
    for (const [name, value] of Object.entries(fields)) {
      body +=
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        `${value}\r\n`
    }

    // 结束边界
    body += `--${boundary}--\r\n`

    const contentType = `multipart/form-data; boundary=${boundary}`

    requestOptions.data = body
    requestOptions.header['Content-Type'] = contentType
  }

  private parseRaceCondition(requestOptions: UniHttpRequestOptions) {
    let raceCondition = requestOptions.raceCondition
    if (typeof raceCondition === 'function') {
      raceCondition = raceCondition(requestOptions)
    }
    if (typeof raceCondition === 'boolean') {
      raceCondition = raceCondition ? requestOptions.url : false
    }

    if (
      typeof raceCondition === 'string' ||
      typeof raceCondition === 'undefined' ||
      raceCondition === false
    ) {
      return raceCondition
    }

    this.logging.warn(
      `[UniHttpRequest] 竞态条件值类型错误，期待类型 string | false | undefined ，实际类型 %s ，跳过当前竞态条件`,
      typeof raceCondition,
    )
    return undefined
  }

  private async httpRequest<T>(options: UniHttpRequestOptions) {
    const skipInitialized = options.skipInitialized ?? false
    if (!skipInitialized) {
      await this.init
    }
    const config = _.cloneDeep(this.config)
    const custom = _.cloneDeep(options)
    let requestOptions: UniHttpRequestOptions = _.merge({}, config, custom)
    requestOptions.header ??= {}
    // 类似于洋葱中间件拦截器，顺序如下：
    // 全局请求拦截 -> 独立请求拦截 -> 请求 -> 独立响应拦截 -> 全局响应拦截
    if (config.interceptors?.request) {
      requestOptions = config.interceptors.request(requestOptions)
    }
    if (custom.interceptors?.request) {
      requestOptions = custom.interceptors.request(requestOptions)
    }
    // 解析 url 查询参数
    let requestUrl = requestOptions.url
    const [relativeUrl, searchString] = requestUrl.split('?')
    const searchParams = searchString ? searchString.split('&') : []

    const { params = {}, useMultipartFormData } = requestOptions

    const indexes = requestOptions.paramsIndexes
    // 解析 params 查询参数
    for (const [key, value] of Object.entries(params)) {
      const isArrayValue = Array.isArray(value)
      const arrayValues = isArrayValue ? value : [value]

      for (const [index, param] of arrayValues.entries()) {
        if (isArrayValue === false || typeof indexes !== 'boolean') {
          // 非数组类型或无需索引的查询参数
          searchParams.push(`${key}=${encodeURIComponent(param)}`)
        } else if (indexes === true) {
          // 设置数组元素索引
          searchParams.push(`${key}[${index}]=${encodeURIComponent(param)}`)
        } else if (indexes === false) {
          // 设置数组元素索引，但设置为空索引
          searchParams.push(`${key}[]=${encodeURIComponent(param)}`)
        }
      }
    }
    // 添加 url 查询参数
    const queryString = searchParams.filter(Boolean).join('&')
    requestUrl = [relativeUrl, queryString].filter(Boolean).join('?')

    const baseUrl = config.baseURL ?? ''
    const absoluteUrlRegexp = /^(https?|ftp|file|wss?):\/\//i
    const prefixUrl = absoluteUrlRegexp.test(requestUrl) ? '' : baseUrl
    requestOptions.url = `${prefixUrl}${requestUrl}`
    if (useMultipartFormData) {
      this.parseMultipartFormData(requestOptions)
    }
    return new Promise<T>((resolve, reject) => {
      // 解析竞态条件
      const raceCondition =
        this.parseRaceCondition({
          ...requestOptions,
          raceCondition: custom.raceCondition,
        }) ??
        this.parseRaceCondition({
          ...requestOptions,
          raceCondition: config.raceCondition,
        })
      const requestTask = uni.request({
        ...requestOptions,
        success: (res) => {
          let response = _.cloneDeep(res)
          if (custom.interceptors?.response) {
            response = custom.interceptors.response(response)
          }
          if (config.interceptors?.response) {
            response = config.interceptors.response(response)
          }
          if (response.errMsg === 'request:ok') {
            const responseData = response.data as T
            resolve(responseData)
          } else {
            reject(new Error(response.errMsg || '请求失败，未知错误'))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '请求失败，程序错误'))
        },
        complete: (err) => {
          if (raceCondition && err.errMsg !== 'request:fail abort') {
            this.racingRequestTask.remove(raceCondition)
          }
        },
      })
      if (raceCondition) {
        this.racingRequestTask.add(raceCondition, requestTask)
      }
    })
  }

  async get<T>(options: QuickRequestOptions) {
    return this.httpRequest<T>({ ...options, method: 'GET' })
  }

  async post<T>(options: QuickRequestOptions) {
    return this.httpRequest<T>({ ...options, method: 'POST' })
  }

  async put<T>(options: QuickRequestOptions) {
    return this.httpRequest<T>({ ...options, method: 'PUT' })
  }

  async delete<T>(options: QuickRequestOptions) {
    return this.httpRequest<T>({ ...options, method: 'DELETE' })
  }
}

const instance = shallowRef({} as UniHttpRequest)

export function getUniHttpRequestInstance() {
  return new Proxy(instance.value, {
    get(target, p, receiver) {
      return Reflect.get(instance.value, p, receiver)
    },
  })
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $request: UniHttpRequest
  }
}

type UniRequestOptions = UniHttpRequestConstructorOptions

class Request {
  install(app: VueApp, options: UniRequestOptions = {}) {
    instance.value = new UniHttpRequest({
      ...options,
      init: options.init ?? app.config.globalProperties.$init.promise,
      logging: options.logging ?? app.config.globalProperties.$logging,
    })
    app.config.globalProperties.$request = instance.value
  }
}

export function createRequest() {
  return new Request()
}
