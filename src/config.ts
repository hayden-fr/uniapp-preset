declare global {
  // 扩展请求配置
  interface UniHttpRequestOptions {
    // 存储全局 token，通过 request.setConfig({ token }) 设置
    token?: string
  }
}

const config: CustomConfig = {
  request: {
    baseURL: import.meta.env.APP_BASE_URL,
    token: uni.getStorageSync('uniapp_token'),
    interceptors: {
      request(options) {
        if (options.token) {
          options.header['Authorization'] = `Bearer ${options.token}`
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
}

export default config
