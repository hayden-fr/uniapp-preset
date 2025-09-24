<template>
  <view class="form-container" :class="classNames?.root" :style="styles?.root">
    <view
      v-for="item in items"
      :key="item.field"
      class="border-light-900 relative min-h-12 px-4"
      :class="[{ 'border-b': border }, classNames?.item, item.classNames?.item]"
      :style="[styles?.item, item.styles?.item]"
    >
      <view
        class="border-light absolute left-0 flex h-12 w-full items-center px-4"
        :class="{ 'border-b': (item.labelPosition ?? labelPosition) === 'top' }"
      >
        <view
          v-if="item.required ?? item.rules?.some((rule) => rule.required)"
          class="absolute left-1 text-red-500"
          :class="[classNames?.required, item.classNames?.required]"
          :style="[styles?.required, item.styles?.required]"
        >
          *
        </view>
        <view
          v-show="(item.labelPosition ?? labelPosition) !== false"
          class="min-w-16 shrink-0"
          :class="[classNames?.label, item.classNames?.label]"
          :style="[
            { width: item.labelWidth ?? labelWidth },
            styles?.label,
            item.styles?.label,
          ]"
        >
          {{ item.label }}
        </view>
        <view class="pointer-events-none flex-1"></view>
      </view>

      <view
        v-if="(item.labelPosition ?? labelPosition) === 'top'"
        class="h-12"
      ></view>

      <view class="flex min-h-12 w-full items-center gap-2">
        <view
          v-if="(item.labelPosition ?? labelPosition) === 'left'"
          class="min-w-16 shrink-0"
          :class="[classNames?.label, item.classNames?.label]"
          :style="[
            { width: item.labelWidth ?? labelWidth },
            styles?.label,
            item.styles?.label,
          ]"
        ></view>
        <view
          class="flex-1 overflow-hidden"
          :class="[
            { 'text-right': (item.labelPosition ?? labelPosition) === 'left' },
            classNames?.input,
            item.classNames?.input,
          ]"
          :style="[styles?.input, item.styles?.input]"
        >
          <template v-if="item.type === 'custom'">
            <slot :name="item.field"></slot>
          </template>

          <date-picker
            v-else-if="item.type === 'date'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></date-picker>

          <number-input
            v-else-if="item.type === 'number'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></number-input>

          <password-input
            v-else-if="item.type === 'password'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></password-input>

          <textarea-input
            v-else-if="item.type === 'textarea'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></textarea-input>

          <text-input
            v-else
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></text-input>
        </view>
        <slot :name="item.field.toString() + '_suffix'"></slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
type FormItemSemanticDOM = 'item' | 'label' | 'required' | 'input'

type SemanticDOM = 'root' | FormItemSemanticDOM

type BaseFormItem<Data extends AnyObject = any> = {
  /**
   * 字段名
   */
  field: keyof Data | `_${string}`
  /**
   * 表单项标签
   */
  label?: string
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
</script>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import datePicker from '@/components/commons/date-picker/date-picker.vue'
import numberInput from '@/components/commons/number-input/number-input.vue'
import passwordInput from '@/components/commons/password-input/password-input.vue'
import textInput from '@/components/commons/text-input/text-input.vue'
import textareaInput from '@/components/commons/textarea-input/textarea-input.vue'

const formData = defineModel<Data>({ default: () => ({}) })

interface Props {
  /**
   * 表单数据项
   */
  items?: FormItem<Data>[]
  /**
   * 是否只读
   */
  readonly?: boolean
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

withDefaults(defineProps<Props>(), {
  items: () => [],
  labelPosition: 'left',
  labelWidth: '4rem',
  labelAlign: 'left',
  border: true,
})
</script>
