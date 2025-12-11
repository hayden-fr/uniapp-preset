<template>
  <view class="flex w-full items-center gap-2">
    <view v-if="icon" :class="[icon]"></view>
    <view v-if="readonly" class="flex-1">{{ modelValue ?? emptyValue }}</view>
    <template v-else>
      <input
        class="flex-1"
        :type="decimal ? 'digit' : 'number'"
        :value="modelValue"
        @input="handleChange"
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <view
        v-if="allowClear"
        v-show="modelValue"
        class="text-gray i-tabler-playstation-x"
        @click="handleClear"
      ></view>
    </template>
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
   * 值改变时回调
   */
  onChange?: (value: number | undefined) => void
  /**
   * 图标
   */
  icon?: string
  /**
   * 是否显示清除按钮
   */
  allowClear?: boolean
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

const handleChange = (e: any) => {
  const value = e.detail.value
  modelValue.value = value
  props.onChange?.(value)
}

const handleClear = () => {
  modelValue.value = undefined
  props.onChange?.(modelValue.value)
}
</script>
