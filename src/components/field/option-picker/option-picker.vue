<template>
  <text v-if="readonly">{{ renderedValue ?? emptyValue }}</text>
  <picker
    v-else
    mode="selector"
    :range="options"
    range-key="label"
    :value="selectedIndex"
    :disabled="disabled"
    @change="handleChange"
  >
    <view class="relative flex h-6 items-center gap-2 leading-normal">
      <view
        v-show="!renderedValue"
        class="absolute h-full w-full"
        style="color: gray"
      >
        {{ placeholder }}
      </view>
      <view class="uni-input flex-1">{{ renderedValue }}</view>
      <view
        v-if="allowClear"
        v-show="modelValue"
        class="i-tabler-playstation-x text-gray"
        @click.stop="handleClear"
      ></view>
    </view>
  </picker>
</template>

<script setup lang="ts">
declare global {
  type OptionItem<Value = string> = {
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
   * 值改变时回调
   */
  onChange?: (value: string | undefined) => void
  /**
   * 图标
   */
  icon?: string
  /**
   * 是否显示清除按钮
   */
  allowClear?: boolean
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

const modelValue = defineModel<string>()

const selectedIndex = computed(() => {
  return props.options.findIndex((item) => item.value === modelValue.value)
})

const renderedValue = computed(() => {
  const item = props.options[selectedIndex.value]
  return item ? item.label : ''
})

const handleChange = (e: any) => {
  const index = e.detail.value
  const item = props.options[index]
  modelValue.value = item ? item.value : undefined
  props.onChange?.(modelValue.value)
}

const handleClear = () => {
  modelValue.value = undefined
  props.onChange?.(modelValue.value)
}
</script>
