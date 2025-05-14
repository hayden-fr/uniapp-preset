export const accountLogin = async (params: {
  username: string
  password: string
}) => {
  return request.post({
    url: '/admin/oauth2/token',
    // 设置查询字符串
    params: {
      username: params.username,
      grant_type: 'password',
      scope: 'server',
    },
    // 设置 body 请求体
    data: {
      password: params.password,
    },
    // 添加自定义请求头
    header: {
      skipToken: 'true',
    },
    // 使用 FormData 作为请求体而不是 json 类型
    useMultipartFormData: true,
    // 请求拦截器
    // 与 config 定义的拦截器共存，执行顺序为：
    // config.interceptors.request
    // options.interceptors.request
    // options.interceptors.response
    // config.interceptors.response
    interceptors: {
      request(options) {
        // 拦截请求，修改请求头
        options.header['Authorization'] = 'Basic bW9iaWxl'
        return options
      },
      response(response) {
        const responseData = response.data as AnyObject
        const { code, msg, ...resData } = responseData
        const ok = msg === 'ok'
        response.data = { ok, code, msg, data: resData }
        return response
      },
    },
    // 设置当前请求为竞态条件
    raceCondition: true,
  })
}
