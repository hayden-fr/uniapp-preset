type AccessToken = string | undefined | null

interface UniAccessConfig {
  /**
   * 初始化 token
   */
  initialAccessToken?: () => AccessToken | Promise<AccessToken>
  /**
   * token 更新时触发
   *
   * @param accessToken
   * @returns
   */
  onChange?: (accessToken: AccessToken) => void
}

class UniAccess {
  accessToken: AccessToken

  constructor(options: UniAccessConfig = {}) {
    this.onUpdate = options.onChange?.bind(this)
    this.init = async () => {
      this.accessToken = await options.initialAccessToken?.()
    }
  }

  async init() {}

  private onUpdate: UniAccessConfig['onChange']

  update(accessToken: AccessToken) {
    this.accessToken = accessToken
    this.onUpdate?.(accessToken)
  }
}

const instance = shallowRef({} as UniAccess)

type AuthOptions = UniAccessConfig & {}

declare module 'vue' {
  interface ComponentCustomProperties {
    readonly $accessToken: AccessToken
  }
}

class Auth {
  install(app: VueApp, options: AuthOptions = {}) {
    instance.value = new UniAccess(options)

    Object.defineProperty(app.config.globalProperties, '$accessToken', {
      get() {
        return instance.value.accessToken
      },
      enumerable: true,
      configurable: false,
    })

    app.config.globalProperties.$init.register(async () => {
      await instance.value.init()
    })
  }
}

export function createAuth() {
  return new Auth()
}

export function useAuth() {
  const accessToken = computed(() => instance.value.accessToken)

  return {
    accessToken: accessToken,
    update: (accessToken: AccessToken) => {
      instance.value.update(accessToken)
    },
  }
}
