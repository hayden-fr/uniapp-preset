<template>
  <view :class="wrapperClassNames">
    <view v-if="icon" :class="[icon]"></view>
    <view v-if="readonly" :class="contentClassNames">
      {{ content }}
    </view>
    <picker
      v-else
      mode="selector"
      :range="options"
      range-key="label"
      class="w-full"
      :value="selectedIndex"
      @change="handleChange"
      :disabled="disabled"
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
type Value = string | number

declare global {
  type OptionItem = {
    label: string
    value: Value
  }
}

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
  onChange?: (value: Value | undefined) => void
  /**
   * 选项
   */
  options?: OptionItem[]
}

declare global {
  interface FieldItem {
    option: Props
  }
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
})

const modelValue = defineModel<Value>()

defineOptions({
  inheritAttrs: false,
})

const selectedIndex = computed(() => {
  return props.options.findIndex((item) => item.value === modelValue.value)
})

const wrapperClassNames = computed(() => {
  const classNames: ClassNameValue = ['flex w-full items-center gap-2']

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const content = computed(() => {
  const index = selectedIndex.value
  const label = props.options[index]?.label

  if (props.readonly) {
    return label || props.emptyValue
  }

  return label || props.placeholder
})

const showClearBtn = computed(() => {
  return !props.readonly && props.allowClear
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

const allowClearClassNames = computed(() => {
  const classNames: ClassNameValue = ['text-gray i-tabler-playstation-x']
  return classNames
})

const handleChange = (e: any) => {
  const index = e.detail.value
  const item = props.options[index]
  const value = item?.value
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
