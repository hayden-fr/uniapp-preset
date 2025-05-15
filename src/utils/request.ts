import config from '@/config'

declare global {
  interface CustomConfig {
    request: Omit<UniHttpRequestOptions, 'url'>
  }

  /**
   * UniHttpRequest 请求配置
   */
  interface UniHttpRequestOptions extends UniAppRequestOptionsWithoutCallback {
    /**
     * 基础请求路径
     */
    baseURL?: string
    /**
     * 查询字符串
     */
    params?: AnyObject
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
  }

  /**
   * UniHttpRequest 请求响应
   */
  type UniHttpRequestResponse = UniApp.RequestSuccessCallbackResult
}

type UniAppRequestOptionsWithoutCallback = Omit<
  UniApp.RequestOptions,
  'success' | 'fail' | 'complete'
>

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

/**
 * 快捷请求配置
 */
type QuickRequestOptions = Omit<UniHttpRequestOptions, 'method'>

class UniHttpRequest {
  private static instance: UniHttpRequest

  static getInstance() {
    if (!UniHttpRequest.instance) {
      UniHttpRequest.instance = new UniHttpRequest(config.request)
    }
    return UniHttpRequest.instance
  }

  private racingRequestTask: RacingRequestTask

  private constructor(private config: Partial<UniHttpRequestOptions> = {}) {
    this.racingRequestTask = new RacingRequestTask()
  }

  /**
   * 动态修改 request 配置
   * @param config
   */
  setConfig(config: AnyObject) {
    this.config = { ...this.config, ...config }
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

    console.warn(
      `[UniHttpRequest] 竞态条件值类型错误，期待类型 string | false | undefined ，实际类型 %s ，跳过当前竞态条件`,
      typeof raceCondition,
    )
    return undefined
  }

  private async request<T>(options: UniHttpRequestOptions) {
    const config = _.cloneDeep(this.config)
    const custom = _.cloneDeep(options)
    let requestOptions: UniHttpRequestOptions = _.merge({}, config, custom)

    if (config.interceptors?.request) {
      requestOptions = config.interceptors.request(requestOptions)
    }

    if (custom.interceptors?.request) {
      requestOptions = custom.interceptors.request(requestOptions)
    }

    const { params = {}, useMultipartFormData } = requestOptions
    const [relativeUrl, queryString] = requestOptions.url.split('?')
    const searchParams = new SearchParams(queryString)
    searchParams.merge(params)

    const baseUrl = config.baseURL ?? ''
    const absoluteUrlRegexp = /^(https?|ftp|file|wss?):\/\//i
    const prefixUrl = absoluteUrlRegexp.test(relativeUrl) ? '' : baseUrl

    const url = `${prefixUrl}${relativeUrl}?${searchParams.toString()}`
    requestOptions.url = url

    if (useMultipartFormData) {
      this.parseMultipartFormData(requestOptions)
    }

    return new Promise((resolve, reject) => {
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
    return this.request<T>({ ...options, method: 'GET' })
  }

  async post<T>(options: QuickRequestOptions) {
    return this.request<T>({ ...options, method: 'POST' })
  }

  async put<T>(options: QuickRequestOptions) {
    return this.request<T>({ ...options, method: 'PUT' })
  }

  async delete<T>(options: QuickRequestOptions) {
    return this.request<T>({ ...options, method: 'DELETE' })
  }
}

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

class SearchParams {
  private params: [string, string][] = []

  constructor(init?: string | AnyObject) {
    if (init) {
      this.merge(init)
    }
  }

  private parseString(init: string) {
    for (const item of init.split('&')) {
      const [key, value] = item.split('=')
      this.append(key, value)
    }
  }

  private parseObject(init: AnyObject) {
    for (const [key, value] of Object.entries(init)) {
      const values = Array.isArray(value) ? value : [value]
      for (const val of values) {
        this.append(key, val)
      }
    }
  }

  merge(init: string | AnyObject) {
    if (typeof init === 'string') {
      this.parseString(init)
    }
    if (typeof init === 'object') {
      this.parseObject(init)
    }
  }

  append(key: string, value: string) {
    this.params.push([key, value])
  }

  toString() {
    return this.params
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
  }
}

export const request = UniHttpRequest.getInstance()
