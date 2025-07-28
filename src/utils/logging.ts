class StackError extends Error {
  constructor(error: Error) {
    super()

    const messages = [`${error.message}`]
    this.name = error.name

    let level = 1
    let causeError = error.cause

    while (causeError) {
      if (causeError instanceof Error) {
        const stackLine = `${' '.repeat(level * 2)}  ${causeError.name}: ${causeError.message}`
        messages.push(stackLine)
        level++
        causeError = causeError.cause
      } else {
        causeError = undefined
      }
    }

    messages.push('\nStack:')

    this.message = messages.join('\n')
  }
}

type LoggingType = 'info' | 'warn' | 'error' | 'debug' | 'log'

class Logging {
  private static instance: Logging
  public static getInstance() {
    if (!Logging.instance) {
      Logging.instance = new Logging()
    }
    return Logging.instance
  }

  private printer(type: LoggingType, message?: any, ...optionalParams: any[]) {
    if (message instanceof Error) {
      message = new StackError(message)
    }
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

export const logging = Logging.getInstance()
