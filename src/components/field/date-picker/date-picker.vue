<template>
  <text v-if="readonly">{{ modelValue ?? emptyValue }}</text>
  <picker
    v-else
    mode="date"
    :value="modelValue"
    @change="handleChange"
    :disabled="disabled"
    :start="start"
    :end="end"
    :fields="fields"
  >
    <view class="relative h-6 leading-normal">
      <view
        v-show="!modelValue"
        class="absolute h-full w-full"
        style="color: gray"
      >
        {{ placeholder }}
      </view>
      <view class="uni-input">{{ modelValue }}</view>
    </view>
  </picker>
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
  onChange?: (val: string) => void
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

const handleChange = (e: any) => {
  const val = e.detail.value
  modelValue.value = val
  props.onChange?.(val)
}
</script>
