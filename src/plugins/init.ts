type InitializeFn = () => void | Promise<void>
type InitializeObject = {
  order?: number
  fn: InitializeFn
}
type Initialize = InitializeFn | InitializeObject

class UniInitializationState {
  called: boolean = false
  promiseResolve: any
}

interface UniInitializationOptions {
  logging?: LoggingInterface
}

class UniInitialization extends Function {
  private state: UniInitializationState

  promise: Promise<void>

  private logging: LoggingInterface

  constructor(options: UniInitializationOptions = {}) {
    super('...args', `return this.init(...args)`)

    this.state = new UniInitializationState()

    this.promise = new Promise((resolve) => {
      this.state.promiseResolve = resolve
    })

    this.logging = options.logging ?? window.console

    const callable = () => {
      this.init()
    }

    Object.setPrototypeOf(callable, this)
    Object.assign(callable, this)

    return callable as any
  }

  private queue: (InitializeObject & { cause: Error })[] = []

  private async init() {
    if (this.state.called) {
      this.logging.warn('[UniInitialization]', '请勿重复调用初始化方法')
      return
    }
    this.state.called = true
    const queue = this.queue.sort((a, b) => {
      const beforeOrder = a.order ?? 0
      const afterOrder = b.order ?? 0
      return beforeOrder - afterOrder
    })

    for (const { fn: callback, cause } of queue) {
      try {
        await callback()
      } catch (e) {
        const caused = e instanceof Error ? e : new Error(String(e))
        cause.cause = caused
        const message = '[UniInitialization] 初始化运行错误'
        const error = new Error(message, { cause: cause })
        this.logging.error(error)
      }
    }

    this.state.promiseResolve()
  }

  register(fn: Initialize) {
    const task = typeof fn === 'function' ? { fn } : fn
    const cause = new Error()
    cause.name = 'UniInitializeError'
    this.queue.push({ ...task, cause })
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    readonly $init: UniInitialization
  }
}

const instance = shallowRef({} as UniInitialization)

class Initialization {
  install(app: VueApp, init?: () => void | Promise<void>) {
    instance.value = new UniInitialization({
      logging: app.config.globalProperties.$logging,
    })

    instance.value.register(async () => {
      await init?.()
    })
    Object.defineProperty(app.config.globalProperties, '$init', {
      get() {
        return instance.value
      },
      enumerable: true,
      configurable: false,
    })
  }
}

export function createInit() {
  return new Initialization()
}

export function useInit() {
  const init = async () => {
    return instance.value.promise
  }

  return {
    init,
  }
}
