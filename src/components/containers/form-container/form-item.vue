<template>
  <view :key="item.field" :class="itemClassNames" :style="itemStyles">
    <view class="relative">
      <view :class="requiredClassNames" :style="requiredStyles">*</view>

      <view
        class="absolute left-0 flex h-12 w-full items-center"
        :style="{ display: showLabel ? '' : 'none' }"
      >
        <view :class="labelClassNames" :style="labelStyle">
          <slot
            v-if="_slots[`${item.field.toString()}-label`]"
            :name="`${item.field.toString()}-label`"
          ></slot>
          <template v-else>{{ item.label }}</template>
        </view>
        <slot
          v-if="_slots[`${item.field.toString()}-label-suffix`]"
          :name="`${item.field.toString()}-label-suffix`"
        ></slot>
        <view v-else class="pointer-events-none flex-1"></view>
      </view>

      <view
        v-if="showLabel && labelPosition === 'top'"
        class="pointer-events-none h-12"
      ></view>

      <view class="flex min-h-12 w-full items-center">
        <view
          v-if="showLabel && labelPosition === 'left'"
          :class="labelClassNames"
          :style="labelStyle"
        ></view>
        <slot
          v-if="_slots[`${item.field.toString()}-prefix`]"
          :name="`${item.field.toString()}-prefix`"
        ></slot>
        <view :class="contnetClassNames" :style="contentStyles">
          <view class="flex-1">
            <slot
              v-if="_slots[item.field.toString()]"
              :name="item.field.toString()"
            ></slot>
            <field
              v-else
              :type="item.type"
              :field-props="{
                ...item,
                readonly: readonly,
                emptyValue: emptyValue,
                disabled: disabled,
              }"
              v-model="modelValue"
            ></field>
          </view>
        </view>
        <slot
          v-if="_slots[`${item.field.toString()}-suffix`]"
          :name="`${item.field.toString()}-suffix`"
        ></slot>
      </view>

      <view :class="errorMessageClassNames" :style="errorMessageStyles">
        {{ errorMessage?.message }}
      </view>
    </view>
  </view>
</template>

<script lang="ts">
/**
 * 获取指定类型的字段配置项
 */
type FieldItemWithType<T extends FieldType> = { type: T } & FieldItem[T]

/**
 * 表单字段
 */
type FieldFormItem = {
  [T in FieldType]: FieldItemWithType<T>
}[FieldType]

declare global {
  /**
   * 表单项语义化结构
   */
  type FormItemSemanticDOM =
    | 'item'
    | 'label'
    | 'content'
    | 'required'
    | 'errorMessage'

  /**
   * 表单项标签位置
   */
  type FormItemLabelPositionType = 'left' | 'top' | false

  /**
   * 表单项校验规则
   */
  interface FormRuleItem<Data extends AnyObject = any> {
    /**
     * string 类型时为字符串长度；number 类型时为确定数字； array 类型时为数组长度
     */
    len?: number
    /**
     * string 类型为字符串最小长度；number 类型时为最小值；array 类型时为数组最小长度
     */
    min?: number
    /**
     * string 类型为字符串最大长度；number 类型时为最大值；array 类型时为数组最大长度
     */
    max?: number
    /**
     * 是否为必选字段
     */
    required?: boolean
    /**
     * 错误信息，不设置时会通过模板自动生成
     */
    message?: string
    /**
     * 正则表达式匹配
     */
    pattern?: RegExp
    /**
     * 自定义校验，接收 Promise 作为返回值。
     *
     * @param rule
     * @param value
     */
    validator?: (rule: FormRuleItem<Data>, value: Data) => Promise<void>
  }

  /**
   * 表单项错误提示信息
   */
  interface FormItemErrorMessage {
    message?: string
  }

  /**
   * 通过表单组件提供的通用配置
   */
  interface FormContainerProviderProps {
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
    labelAlign?: TextAlignType
    /**
     * 表单项内容对齐方式
     */
    contentAlign?: TextAlignType
    /**
     * 是否显示边框
     */
    border?: boolean
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
   * 表单项配置 -- 通用属性
   */
  interface BaseFormItem<Data extends AnyObject = any>
    extends FormContainerProviderProps {
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
  }

  /**
   * 表单项配置
   */
  type FormItem<Data extends AnyObject = any> = BaseFormItem<Data> &
    FieldFormItem
}
</script>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import field from '@/components/field/field.vue'

interface Props {
  /**
   * 表单项配置
   */
  item: FormItem<Data>
  /**
   * 表单配置
   */
  config: FormContainerProviderProps
  /**
   * 表单错误信息
   */
  errorMessage?: FormItemErrorMessage
}

const props = withDefaults(defineProps<Props>(), {
  item: () => ({}) as FormItem<Data>,
  config: () => ({}) as FormContainerProviderProps,
})

const modelValue = defineModel<any>()

defineOptions({
  inheritAttrs: false,
})

const slots = useSlots()
const attrs = useAttrs()

type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
type Slots = Mutable<ReturnType<typeof useSlots>>

const _slots = computed(() => {
  const $field = attrs.field as string | undefined
  const $slots = attrs.slots as Slots | undefined
  if (!_.isNil($field) && $slots) {
    const slotsname = new RegExp(
      `^${$field}(-label|-label-suffix|-prefix|-suffix)?$`,
    )
    const _slots: Slots = {}
    for (const key of Object.keys($slots)) {
      if (slotsname.test(key)) {
        _slots[key] = $slots[key]
      }
    }
    return _slots
  }
  return slots
})

const disabled = computed(() => props.item.disabled ?? props.config.disabled)

const readonly = computed(() => props.item.readonly ?? props.config.readonly)

const emptyValue = computed(
  () => props.item.emptyValue ?? props.config.emptyValue,
)

/**
 * 表单项 class
 */
const itemClassNames = computed(() => {
  const classNames: ClassNameValue = ['relative min-h-12 px-4']

  const itemBorder = props.item.border ?? props.config.border
  if (itemBorder) {
    classNames.push('border-b')
  }

  if (props.item.classNames?.item) {
    classNames.push(props.item.classNames.item)
  }
  if (props.config.classNames?.item) {
    classNames.push(props.config.classNames.item)
  }

  return classNames
})

/**
 * 表单项样式
 */
const itemStyles = computed(() => {
  const style: StyleValue = {}
  const styles: StyleValue = [style]

  if (props.item.styles?.item) {
    styles.push(props.item.styles.item)
  }
  if (props.config.styles?.item) {
    styles.push(props.config.styles.item)
  }

  return styles
})

/**
 * 必填标签 class
 */
const requiredClassNames = computed(() => {
  const classNames: ClassNameValue = [
    'absolute text-red h-12 flex items-center top-0 -left-3',
  ]
  if (props.item.classNames?.required) {
    classNames.push(props.item.classNames.required)
  }
  if (props.config.classNames?.required) {
    classNames.push(props.config.classNames.required)
  }
  return classNames
})

/**
 * 必填标签样式
 */
const requiredStyles = computed(() => {
  const style: StyleValue = {
    display: props.item.required ? '' : 'none',
  }
  const styles: StyleValue = [style]
  if (props.item.styles?.required) {
    styles.push(props.item.styles.required)
  }
  if (props.config.styles?.required) {
    styles.push(props.config.styles.required)
  }
  return styles
})

/**
 * 是否显示标签
 */
const showLabel = computed(() => {
  return props.item.label !== false
})

/**
 * 表单标签位置
 */
const labelPosition = computed(
  () => props.item.labelPosition ?? props.config.labelPosition,
)

/**
 * 表单标签 class
 */
const labelClassNames = computed(() => {
  const classNames: ClassNameValue = ['shrink-0']
  if (props.item.classNames?.label) {
    classNames.push(props.item.classNames.label)
  }
  if (props.config.classNames?.label) {
    classNames.push(props.config.classNames.label)
  }
  return classNames
})

/**
 * 表单标签样式，合并了配置属性和自定义属性
 */
const labelStyle = computed(() => {
  const style: StyleValue = {}
  const styles: StyleValue = [style]

  const width = props.item.labelWidth ?? props.config.labelWidth
  if (width) {
    style.width = width
  }
  const textAlign = props.item.labelAlign ?? props.config.labelAlign
  if (textAlign) {
    style.textAlign = textAlign
  }
  // 添加自定义样式
  if (props.item.styles?.label) {
    styles.push(props.item.styles.label)
  }
  if (props.config.styles?.label) {
    styles.push(props.config.styles.label)
  }
  return styles
})

const contentAlign = computed(() => {
  const defaultAlign = labelPosition.value === 'left' ? 'right' : 'left'
  return props.item.contentAlign ?? props.config.contentAlign ?? defaultAlign
})

/**
 * 表单内容 class
 */
const contnetClassNames = computed(() => {
  const classNames: ClassNameValue = ['flex-1 flex items-center']

  if (props.item.classNames?.content) {
    classNames.push(props.item.classNames.content)
  }
  if (props.config.classNames?.content) {
    classNames.push(props.config.classNames.content)
  }
  return classNames
})

/**
 * 表单内容样式，合并了配置属性和自定义属性
 */
const contentStyles = computed(() => {
  const style: StyleValue = {
    textAlign: contentAlign.value,
  }
  const styles: StyleValue = [style]

  if (props.item.styles?.content) {
    styles.push(props.item.styles.content)
  }
  if (props.config.styles?.content) {
    styles.push(props.config.styles.content)
  }
  return styles
})

/**
 * 错误提示信息 class
 */
const errorMessageClassNames = computed(() => {
  const classNames: ClassNameValue = [
    'text-red text-xs absolute bottom-0 w-full',
  ]

  if (props.item.classNames?.errorMessage) {
    classNames.push(props.item.classNames.errorMessage)
  }
  if (props.config.classNames?.errorMessage) {
    classNames.push(props.config.classNames.errorMessage)
  }
  return classNames
})

/**
 * 错误提示信息 style
 */
const errorMessageStyles = computed(() => {
  const style: StyleValue = {
    textAlign: contentAlign.value,
  }
  const styles: StyleValue = [style]

  if (props.item.styles?.errorMessage) {
    styles.push(props.item.styles.errorMessage)
  }
  if (props.config.styles?.errorMessage) {
    styles.push(props.config.styles.errorMessage)
  }
  return styles
})
</script>
