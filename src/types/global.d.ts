export {}

declare global {
  interface RuleItem<T = any> {
    min?: number
    max?: number
    required?: boolean
    message?: string
    pattern?: RegExp
    trigger?: string
    validator?: (rule: RuleItem<T>, value: T) => void | Promise<void>
  }

  type BaseFormItem<T extends Record<string> = any> = {
    field: keyof T
    label?: string
    rules?: RuleItem[]
    required?: boolean
    disabled?: boolean
    labelPosition?: 'left' | 'top'
    labelWidth?: string
    labelAlign?: 'left' | 'center' | 'right'
  }

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
}
