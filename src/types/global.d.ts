export {}

declare global {
  export type { StyleValue, UnwrapRef, App as VueApp } from 'vue'
  import('vue')
}

declare global {
  // prettier-ignore
  type ClassNameValue = false | null | undefined | string | Record<string, boolean> | Array<ClassNameValue>;

  type Semantic<S, V> = Partial<Record<S, V>>
  type RequiredSemantic<S, V> = Record<S, V>

  interface FormRuleItem<T = any> {
    len?: number
    min?: number
    max?: number
    required?: boolean
    message?: string
    pattern?: RegExp
    trigger?: string
    validator?: (
      rule: FormRuleItem<T>,
      value: T,
      throwError: (message: string) => void,
    ) => void | Promise<void>
  }

  type BaseFormItem<T extends Record<string> = any> = {
    field: keyof T | `_${string}`
    label?: string
    rules?: FormRuleItem[]
    required?: boolean
    disabled?: boolean
    labelPosition?: 'left' | 'top' | false
    labelWidth?: string
    labelAlign?: 'left' | 'center' | 'right'
    classNames?: Semantic<FormItemSemanticDOM, ClassNameValue>
    styles?: Semantic<FormItemSemanticDOM, StyleValue>
  }

  type FormItemSemanticDOM = 'item' | 'label' | 'required' | 'input'

  type FormItem<T extends Record<string> = any> = BaseFormItem<T> &
    (
      | FormItemCustom
      | FormItemTextInput
      | FormItemTextareaInput
      | FormItemPasswordInput
      | FormItemNumberInput
      | FormItemDatePicker
    )

  type GenericFormItem<
    Type extends string,
    Props extends Record<string>,
  > = Omit<Props, keyof BaseFormItem> & {
    type: Type
  }

  interface FormItemCustom {
    type: 'custom'
  }

  type Pagination = {
    current: number
    size: number
    total: number
  }

  interface ResponseStructure<T> {
    code: number
    message: string
    data: T
  }

  interface ListStructure<T> {
    records: T[]
    current: number
    size: number
    total: number
  }
}
