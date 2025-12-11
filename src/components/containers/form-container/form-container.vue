<template>
  <view class="form-container" :class="classNames?.root" :style="styles?.root">
    <form-item
      v-for="item in items"
      :key="item.field"
      :item="item"
      :config="formConfig"
      v-model="formData[item.field]"
    >
      <template #[item.field]>
        <slot
          :name="item.field"
          :readonly="readonly"
          :empty-value="emptyValue"
          :disabled="disabled"
          :item="item"
        ></slot>
      </template>
      <template #[`${item.field.toString()}-suffix`]>
        <slot :name="`${item.field.toString()}-suffix`"></slot>
      </template>
    </form-item>
  </view>
</template>

<script lang="ts">
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

  type FormContainerSemanticDOM = 'root' | FormItemSemanticDOM
}
</script>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import formItem from './form-item.vue'

interface FormContainerProps<Data extends AnyObject = any> {
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
  classNames?: Semantic<FormContainerSemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<FormContainerSemanticDOM, StyleValue>
}

const formData = defineModel<Data>({ default: reactive({}) })

const props = withDefaults(defineProps<FormContainerProps<Data>>(), {
  items: () => [],
  itemsValidation: () => ({}),
  disabled: false,
  readonly: false,
  emptyValue: '-',
  labelPosition: 'left',
  labelWidth: '4rem',
  labelAlign: 'left',
  border: true,
  classNames: () => ({}),
  styles: () => ({}),
})

const formConfig = computed<any>(() => {
  return _.omit(props, 'items')
})
</script>
