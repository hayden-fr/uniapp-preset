/// <reference types="typescript-builtins-extended" />

export {}

declare global {
  export type { StyleValue, UnwrapRef, App as VueApp } from 'vue'
  import('vue')
}

declare global {
  /**
   * 响应结构
   */
  interface ResponseStructure<T> {
    code: number
    message: string
    data: T
  }

  /**
   * 分页结构
   */
  type Pagination = {
    current: number
    size: number
    total: number
  }

  /**
   * 列表结构
   */
  interface ListStructure<T> {
    records: T[]
    current: number
    size: number
    total: number
  }
}

declare global {
  /**
   * 日志接口
   */
  interface LoggingInterface {
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    debug: (...args: any[]) => void
    log: (...args: any[]) => void
  }

  // prettier-ignore
  type ClassNameValue = false | null | undefined | string | Record<string, boolean> | Array<ClassNameValue>;

  /**
   * 语义化对象
   */
  type Semantic<S, V> = Partial<Record<S, V>>

  /**
   * 必填语义化对象
   */
  type RequiredSemantic<S, V> = Record<S, V>

  /**
   * 组件尺寸
   */
  type ComponentSize = 'mini' | 'small' | 'medium' | 'large'

  /**
   * 文本对齐方式
   */
  type TextAlignType = 'left' | 'center' | 'right'
}
