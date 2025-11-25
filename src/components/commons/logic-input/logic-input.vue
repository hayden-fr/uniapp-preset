<template>
  <text v-if="readonly" class="">{{ renderedValue }}</text>
  <switch
    v-else
    :checked="checked"
    :type="mode"
    @change="handleChange"
  ></switch>
</template>

<script setup lang="ts">
type LogicValue = string | number | boolean

interface Props {
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
  onChange?: (value: LogicValue | undefined) => void
  /**
   * 图标
   */
  icon?: string
  /**
   * 是否显示清除按钮
   */
  allowClear?: boolean
  /**
   * 渲染模式
   */
  mode?: 'switch' | 'checkbox'
  /**
   * 真值
   */
  trueValue?: LogicValue
  /**
   * 真值显示文本
   */
  trueText?: string
  /**
   * 假值
   */
  falseValue?: LogicValue
  /**
   * 假值显示文本
   */
  falseText?: string
}

declare global {
  type FormItemLogicInput = GenericFormItem<'logic', Props>
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'switch',
  trueValue: true,
  trueText: '是',
  falseValue: false,
  falseText: '否',
})

const modelValue = defineModel<LogicValue>()

defineOptions({
  inheritAttrs: false,
})

const checked = computed(() => {
  return modelValue.value === props.trueValue
})

const renderedValue = computed(() => {
  return checked.value ? props.trueText : props.falseText
})

const handleChange = (e: any) => {
  const checked = e.detail.value
  modelValue.value = checked ? props.trueValue : props.falseValue
  props.onChange?.(modelValue.value)
}
</script>
