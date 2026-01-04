<template>
  <view :class="wrapperClassNames">
    <view v-if="icon" :class="[icon]"></view>
    <view v-if="readonly" :class="contentClassNames">
      {{ modelValue ?? emptyValue }}
    </view>
    <picker
      v-else
      mode="date"
      class="w-full"
      :value="modelValue"
      @change="handleChange"
      :disabled="disabled"
      :start="start"
      :end="end"
      :fields="fields"
    >
      <view :class="contentClassNames">
        {{ content }}
      </view>
    </picker>
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
  onChange?: (value: any) => void
  /**
   * 开始日期
   */
  start?: string
  /**
   * 结束日期
   */
  end?: string
  /**
   * 日期选择器颗粒度
   */
  fields?: 'year' | 'month' | 'day'
}

declare global {
  interface FieldItem {
    date: Props
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
    'w-full overflow-hidden text-ellipsis whitespace-nowrap',
  ]

  if (!modelValue.value) {
    classNames.push('text-black/50')
  }

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const content = computed(() => {
  if (modelValue.value) {
    return modelValue.value
  }
  return props.placeholder
})

const showClearBtn = computed(() => {
  return !props.readonly && props.allowClear
})

const allowClearClassNames = computed(() => {
  const classNames: ClassNameValue = ['text-gray i-tabler-playstation-x']
  return classNames
})

const handleChange = (e: any) => {
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
</script>
