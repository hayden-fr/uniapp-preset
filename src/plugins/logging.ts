type LoggingType = 'info' | 'warn' | 'error' | 'debug' | 'log'

class UniLogging implements LoggingInterface {
  private printer(type: LoggingType, message?: any, ...optionalParams: any[]) {
    console[type](message, ...optionalParams)
  }

  info(message?: any, ...optionalParams: any[]) {
    this.printer('info', message, ...optionalParams)
  }

  warn(message?: any, ...optionalParams: any[]) {
    this.printer('warn', message, ...optionalParams)
  }

  error(message?: any, ...optionalParams: any[]) {
    this.printer('error', message, ...optionalParams)
  }

  debug(message?: any, ...optionalParams: any[]) {
    this.printer('debug', message, ...optionalParams)
  }

  log(message?: any, ...optionalParams: any[]) {
    this.printer('log', message, ...optionalParams)
  }
}

const instance = shallowRef({} as UniLogging)

export function getUniLoggingInstance() {
  return new Proxy(instance.value, {
    get(target, p, receiver) {
      return Reflect.get(instance.value, p, receiver)
    },
  })
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $logging: UniLogging
  }
}

class Logging {
  install(app: VueApp) {
    instance.value = new UniLogging()
    app.config.globalProperties.$logging = instance.value
  }
}

export function createLogging() {
  return new Logging()
}
