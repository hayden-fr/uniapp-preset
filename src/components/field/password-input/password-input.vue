<template>
  <view :class="wrapperClassNames">
    <view v-if="icon" :class="[icon]"></view>
    <view v-if="readonly" :class="contentClassNames">
      {{ readonlyContent }}
    </view>
    <input
      v-else
      :type="checkPassword ? 'text' : 'password'"
      :value="modelValue"
      :password="!checkPassword"
      @input="handleChange"
      :class="contentClassNames"
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
    <view
      v-if="showVisibleBtn"
      :class="showVisibleClassNames"
      @click="handleToggle"
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
  onChange?: (value: string | undefined) => void
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
   * 是否显示密码可见
   */
  showVisible?: boolean
}

declare global {
  interface FieldItem {
    password: Props
  }
}

const props = defineProps<Props>()

const modelValue = defineModel<string>()

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
    'flex-1 overflow-hidden whitespace-nowrap',
  ]

  if (props.readonly) {
    classNames.push('overflow-y-hidden')
  }

  if (props.readonly && !checkPassword.value) {
    classNames.push('translate-y-1')
  }

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

const showVisibleBtn = computed(() => {
  return modelValue.value && props.showVisible
})

const showVisibleClassNames = computed(() => {
  const classNames: ClassNameValue = ['text-gray']
  if (checkPassword.value) {
    classNames.push('i-tabler-eye')
  } else {
    classNames.push('i-tabler-eye-closed')
  }
  return classNames
})

const handleChange = (e: any) => {
  props.onInput?.(e)
  const val = e.detail.value
  modelValue.value = val
  props.onChange?.(val)
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

const checkPassword = ref(false)

const readonlyContent = computed(() => {
  const value = modelValue.value

  if (!value || value.length === 0) {
    return props.emptyValue
  }

  if (checkPassword.value) {
    return value
  }

  return '*'.repeat(value.length)
})

const handleToggle = () => {
  checkPassword.value = !checkPassword.value
}
</script>
