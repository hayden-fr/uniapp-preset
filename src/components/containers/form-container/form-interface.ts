type FormItemSemanticDOM =
  | 'item'
  | 'label'
  | 'required'
  | 'input'
  | 'validation'

export type SemanticDOM = 'root' | FormItemSemanticDOM

type BaseFormItem<Data extends AnyObject = any> = {
  /**
   * 字段名
   */
  field: keyof Data | `_${string}`
  /**
   * 表单项标签，如果设置为 false，则不显示标签
   */
  label?: string | false
  /**
   * 表单项验证规则
   */
  rules?: FormRuleItem[]
  /**
   * 是否必填
   */
  required?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readonly?: boolean
  /**
   * 只读模式下，当值为空时的占位符
   */
  emptyValue?: string
  /**
   * 表单项标签位置
   */
  labelPosition?: FormItemLabelPositionType
  /**
   * 表单项标签宽度
   */
  labelWidth?: string
  /**
   * 表单项标签对齐方式
   */
  labelAlign?: FormItemLabelAlignType
  /**
   * 表单项语义化结构 class
   */
  classNames?: Semantic<FormItemSemanticDOM, ClassNameValue>
  /**
   * 表单项语义化结构 style
   */
  styles?: Semantic<FormItemSemanticDOM, StyleValue>
}

/**
 * 自定义项
 */
interface FormItemCustom {
  type: 'custom'
}

type ComponentFormItem =
  | FormItemCustom
  | FormItemTextInput
  | FormItemTextareaInput
  | FormItemPasswordInput
  | FormItemNumberInput
  | FormItemDatePicker
  | FormItemOptionPicker
  | FormItemLogicInput

declare global {
  /**
   * 表单校验规则
   */
  interface FormRuleItem<data extends AnyObject = any> {
    len?: number
    min?: number
    max?: number
    required?: boolean
    message?: string
    pattern?: RegExp
    trigger?: string
    validator?: (
      rule: FormRuleItem<data>,
      value: data,
      throwError: (message: string) => void,
    ) => void | Promise<void>
  }

  type FormItemError<Data extends AnyObject = AnyObject> = {
    [k in FormItem<Data>['field']]?: {
      message?: string
    }
  }

  /**
   * 表单项标签位置
   */
  type FormItemLabelPositionType = 'left' | 'top' | false

  /**
   * 表单项标签对齐方式
   */
  type FormItemLabelAlignType = 'left' | 'center' | 'right'

  /**
   * 生成表单项参数
   */
  type GenericFormItem<
    Type extends string,
    Props extends Record<string, any>,
  > = Omit<Props, keyof BaseFormItem> & {
    type: Type
  }

  /**
   * 表单项
   */
  type FormItem<Data extends AnyObject = any> = BaseFormItem<Data> &
    ComponentFormItem
}

export interface FormContainerProps<Data extends AnyObject = any> {
  /**
   * 表单数据项
   */
  items?: FormItem<Data>[]
  /**
   * 表单项验证结果
   */
  itemsValidation?: MaybeRefOrGetter<FormItemError<Data>>
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readonly?: boolean
  /**
   * 只读模式下，当值为空时的占位符
   */
  emptyValue?: string
  /**
   * 表单项标签位置
   */
  labelPosition?: FormItemLabelPositionType
  /**
   * 表单项标签宽度
   */
  labelWidth?: string
  /**
   * 表单项标签对齐方式
   */
  labelAlign?: FormItemLabelAlignType
  /**
   * 是否显示边框
   */
  border?: boolean
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<SemanticDOM, StyleValue>
}

export type FormConfig = Omit<FormContainerProps, 'items'>
