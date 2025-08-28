interface Initialize {
  (): void | Promise<void>
}

class UniInitializationState {
  called: boolean = false
  promiseResolve: any
}

class UniInitialization extends Function {
  private state: UniInitializationState

  promise: Promise<void>

  constructor() {
    super('...args', `return this.init(...args)`)

    this.state = new UniInitializationState()

    this.promise = new Promise((resolve) => {
      this.state.promiseResolve = resolve
    })

    const callable = () => {
      this.init()
    }

    Object.setPrototypeOf(callable, this)
    Object.assign(callable, this)

    return callable as any
  }

  private queue: Initialize[] = []

  private async init() {
    if (this.state.called) {
      console.warn('[UniInitialization]', '请勿重复调用初始化方法')
      return
    }
    this.state.called = true

    for (const callback of this.queue) {
      await callback()
    }

    this.state.promiseResolve()
  }

  register(fn: Initialize) {
    this.queue.push(fn)
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
    instance.value = new UniInitialization()
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
