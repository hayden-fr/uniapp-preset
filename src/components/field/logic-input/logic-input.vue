<template>
  <text v-if="readonly" class="">{{ renderedValue }}</text>
  <view v-else class="inline-block" @click="handleChange">
    <view :class="inputClassNames.wrapper">
      <view :class="inputClassNames.inner"></view>
    </view>
  </view>
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
  mode?: 'switch' | 'checkbox' | 'radio'
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
  interface FieldItem {
    logic: Props
  }
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

const inputClassNames = computed(() => {
  const wrapper: ClassNameValue = [
    'relative flex items-center transition-all border',
  ]
  const inner: ClassNameValue = ['transition-all']

  if (props.mode === 'switch') {
    wrapper.push('rounded-full h-8 w-13 bg-gray-1/20')
    inner.push('rounded-full h-8 w-8 border shadow bg-white')

    if (checked.value) {
      wrapper.push('bg-primary border-primary')
      inner.push('translate-x-5 border-1 border-primary')
    } else {
      inner.push('translate-x-0')
    }
  } else if (props.mode === 'checkbox') {
    wrapper.push('rounded h-6 w-6 justify-center')
    inner.push('i-tabler-check text-white text-xl')
    if (checked.value) {
      wrapper.push('bg-primary border-primary')
    }
  } else if (props.mode === 'radio') {
    wrapper.push('rounded-full h-6 w-6 justify-center')
    inner.push('i-tabler-check text-white text-xl')
    if (checked.value) {
      wrapper.push('bg-primary border-primary')
    }
  }

  return { wrapper, inner }
})

const handleChange = () => {
  modelValue.value = checked.value ? props.falseValue : props.trueValue
  props.onChange?.(modelValue.value)
}
</script>
