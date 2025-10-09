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

class UniInitialization extends Function {
  private state: UniInitializationState

  promise: Promise<void>

  private logging: LoggingInterface

  constructor(logging?: LoggingInterface) {
    super('...args', `return this.init(...args)`)

    this.state = new UniInitializationState()

    this.promise = new Promise((resolve) => {
      this.state.promiseResolve = resolve
    })

    this.logging = logging ?? console

    const callable = () => {
      this.init()
    }

    Object.setPrototypeOf(callable, this)
    Object.assign(callable, this)

    return callable as any
  }

  private queue: InitializeObject[] = []

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

    for (const { fn: callback } of queue) {
      await callback()
    }

    this.state.promiseResolve()
  }

  register(fn: Initialize) {
    const task = typeof fn === 'function' ? { fn } : fn
    this.queue.push(task)
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    readonly $init: UniInitialization
  }
}

const instance = shallowRef({} as UniInitialization)

class Initialization {
  install(app: VueApp) {
    instance.value = new UniInitialization(app.config.globalProperties.$logging)
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
