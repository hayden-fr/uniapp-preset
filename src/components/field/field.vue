<template>
  <text-input
    v-if="type === 'text'"
    v-model="modelValue"
    v-bind="mergedProps"
  ></text-input>

  <textarea-input
    v-else-if="type === 'textarea'"
    v-model="modelValue"
    v-bind="mergedProps"
  ></textarea-input>

  <password-input
    v-else-if="type === 'password'"
    v-model="modelValue"
    v-bind="mergedProps"
  ></password-input>

  <number-input
    v-else-if="type === 'number'"
    v-model="modelValue"
    v-bind="mergedProps"
  ></number-input>

  <date-picker
    v-else-if="type === 'date'"
    v-model="modelValue"
    v-bind="mergedProps"
  ></date-picker>

  <option-picker
    v-else-if="type === 'option'"
    v-model="modelValue"
    v-bind="mergedProps"
  ></option-picker>

  <logic-input
    v-else-if="type === 'logic'"
    v-model="modelValue"
    v-bind="mergedProps"
  ></logic-input>

  <empty-content
    v-else
    v-model="modelValue"
    v-bind="mergedProps"
  ></empty-content>
</template>

<script lang="ts">
declare global {
  /**
   * 字段类型参数集合
   */
  interface FieldItem {}

  /**
   * 字段类型
   */
  type FieldType = keyof FieldItem
}
</script>

<script setup lang="ts" generic="Type extends FieldType">
import datePicker from './date-picker/date-picker.vue'
import emptyContent from './empty-content/empty-content.vue'
import logicInput from './logic-input/logic-input.vue'
import numberInput from './number-input/number-input.vue'
import optionPicker from './option-picker/option-picker.vue'
import passwordInput from './password-input/password-input.vue'
import textInput from './text-input/text-input.vue'
import textareaInput from './textarea-input/textarea-input.vue'

interface FieldCommonProps {
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
   * 提示文字
   */
  placeholder?: string
  /**
   * 值改变时回调
   */
  onChange?: (value: any) => void
}

interface Props extends FieldCommonProps {
  /**
   * 字段类型
   */
  type?: Type

  /**
   * 字段透传属性，会覆盖 FieldCommonProps 中的字段值
   */
  fieldProps?: FieldItem[Type]
}

const props = withDefaults(defineProps<Props>(), {
  fieldProps: () => ({}),
})

const modelValue = defineModel<any>()

defineOptions({
  inheritAttrs: false,
})

const mergedProps = computed<any>(() => {
  return Object.assign(
    {},
    {
      disabled: props.disabled,
      readonly: props.readonly,
      emptyValue: props.emptyValue,
      placeholder: props.placeholder,
      onChange: props.onChange,
    },
    props.fieldProps,
  )
})
</script>
