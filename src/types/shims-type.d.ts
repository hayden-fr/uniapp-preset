/// <reference types="typescript-builtins-extended" />

export {}

declare global {
  import { StyleValue as VueStyleValue } from 'vue'
  /**
   * Style CSSproperties
   */
  type StyleValue = VueStyleValue

  /**
   * ClasName 基础类型
   */
  type ClassNameBaseType = string | false | undefined | null
  /**
   * ClassName 对象类型
   */
  type ClassNameRecord = Record<string, boolean>
  /**
   * ClassName 数组类型
   */
  type ClassNameArray = Array<ClassNameValue>
  /**
   * ClassName
   */
  type ClassNameValue = ClassNameBaseType | ClassNameRecord | ClassNameArray

  import { UnwrapRef as VueUnwrapRef } from 'vue'
  /**
   * 对 Ref 类型进行解包
   */
  type UnwrapRef<T> = VueUnwrapRef<T>

  import { App as VueApplication } from 'vue'
  /**
   * Vue 应用程序
   */
  type VueApp<HostElement = any> = VueApplication<HostElement>

  /**
   * 任意类型的函数
   */
  type AnyFunction = (...args: any[]) => any

  /**
   * 任意类型的数组
   */
  type AnyArray = Array<any>

  type GetValue<O, K, V = undefined> = K extends keyof O ? O[K] : V

  type NotUndefined<T> = T extends undefined ? never : T

  type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

  /**
   * 日志接口
   */
  interface LoggingInterface {
    /**
     * 信息日志
     */
    info: (...args: any[]) => void
    /**
     * 警告日志
     */
    warn: (...args: any[]) => void
    /**
     * 错误日志
     */
    error: (...args: any[]) => void
    /**
     * 调试日志
     */
    debug: (...args: any[]) => void
    /**
     * 普通日志
     */
    log: (...args: any[]) => void
  }

  /**
   * 语义化对象
   */
  type Semantic<S, V, R = false> = R extends true
    ? Record<S, V>
    : Partial<Record<S, V>>

  /**
   * 组件尺寸
   */
  type ComponentSize = 'mini' | 'small' | 'medium' | 'large'

  /**
   * 文本对齐方式
   */
  type TextAlignType = 'left' | 'center' | 'right'
}
