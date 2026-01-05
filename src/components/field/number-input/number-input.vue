<template>
  <view :class="wrapperClassNames">
    <view v-if="icon" :class="[icon]"></view>
    <view v-if="readonly" :class="contentClassNames">
      {{ modelValue ?? emptyValue }}
    </view>
    <input
      v-else
      :type="decimal ? 'digit' : 'number'"
      :class="contentClassNames"
      :value="modelValue"
      @input="handleChange"
      :placeholder="placeholder"
      :disabled="disabled"
      @focus="bindEvent('onFocus', $event)"
      @blur="bindEvent('onBlur', $event)"
    />
    <view
      v-if="showClearBtn"
      v-show="modelValue"
      :class="allowClearClassNames"
      @click="handleClear"
    ></view>
  </view>
</template>

<script setup lang="ts">
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
   * 同一表单或同一行的数据信息
   */
  fieldDatas?: AnyObject
  /**
   * 图标
   */
  icon?: string
  /**
   * 是否显示清除按钮
   */
  allowClear?: boolean
  /**
   * 值改变时回调
   */
  onChange?: (value: number | undefined) => void
  /**
   * 输入时回调
   */
  onInput?: (event: UniEvent) => void
  /**
   * 获取焦点时回调
   */
  onFocus?: (event: UniEvent) => void
  /**
   * 失去焦点时回调
   */
  onBlur?: (event: UniEvent) => void
  /**
   * 是否允许输入小数
   */
  decimal?: boolean
}

declare global {
  interface FieldItem {
    number: Props
  }
}

const props = defineProps<Props>()

const modelValue = defineModel<string | number>()

defineOptions({
  inheritAttrs: false,
})

const wrapperClassNames = computed(() => {
  const classNames: ClassNameValue = ['flex w-full items-center gap-2']

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const contentClassNames = computed(() => {
  const classNames: ClassNameValue = [
    'flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
  ]

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const showClearBtn = computed(() => {
  return !props.readonly && props.allowClear
})

const allowClearClassNames = computed(() => {
  const classNames: ClassNameValue = ['text-gray i-tabler-playstation-x']
  return classNames
})

const handleChange = (e: any) => {
  props.onInput?.(e)
  const value = e.detail.value
  modelValue.value = value
  props.onChange?.(value)
}

const handleClear = () => {
  if (props.disabled) {
    return
  }

  modelValue.value = undefined
  props.onChange?.(undefined)
}

type EventTarget = 'onFocus' | 'onBlur'

const bindEvent = (target: EventTarget, e: any) => {
  props[target]?.(e)
}
</script>
