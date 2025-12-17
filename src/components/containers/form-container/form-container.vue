<template>
  <view class="form-container" :class="classNames?.root" :style="styles?.root">
    <form-item
      v-for="item in items"
      :key="item.field"
      :item="item"
      :config="formConfig"
      :error-message="itemsValidation[item.field]"
      v-model="formData[item.field]"
      :field="item.field"
      :slots="$slots"
    >
      <template #[`${item.field.toString()}-label`]>
        <slot :name="`${item.field.toString()}-label`"></slot>
      </template>
      <template #[`${item.field.toString()}-label-suffix`]>
        <slot :name="`${item.field.toString()}-label-suffix`"></slot>
      </template>
      <template #[`${item.field.toString()}-prefix`]>
        <slot :name="`${item.field.toString()}-prefix`"></slot>
      </template>
      <template #[`${item.field.toString()}`]>
        <slot :name="`${item.field.toString()}`"></slot>
      </template>
      <template #[`${item.field.toString()}-suffix`]>
        <slot :name="`${item.field.toString()}-suffix`"></slot>
      </template>
    </form-item>
  </view>
</template>

<script lang="ts">
declare global {
  type FormItemError<Data extends AnyObject = AnyObject> = {
    [k in FormItem<Data>['field']]?: FormItemErrorMessage
  }

  type FormContainerSemanticDOM = 'root' | FormItemSemanticDOM
}
</script>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import formItem from './form-item.vue'

interface FormItemInjectProps {
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
   * 语义化结构 class
   */
  classNames?: Semantic<FormContainerSemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<FormContainerSemanticDOM, StyleValue>
}

interface Props extends FormItemInjectProps {
  /**
   * 表单数据项
   */
  items?: FormItem<Data>[]
  /**
   * 表单项验证结果
   */
  itemsValidation?: FormItemError<Data>
}

const formData = defineModel<Data>({ default: reactive({}) })

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  itemsValidation: () => ({}),
  disabled: false,
  readonly: false,
  emptyValue: '-',
  labelPosition: 'left',
  border: true,
  classNames: () => ({}),
  styles: () => ({}),
})

const formConfig = computed<any>(() => {
  return _.omit(props, 'items', 'itemsValidation')
})
</script>
