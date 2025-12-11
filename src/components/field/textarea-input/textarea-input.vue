<template>
  <view v-if="readonly" class="py-3">
    <text>{{ modelValue ?? emptyValue }}</text>
  </view>
  <view v-else class="relative w-full py-3">
    <textarea
      :value="modelValue"
      @input="handleChange"
      class="w-full"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :auto-height="autoHeight"
      :cursor-spacing="cursorSpacing"
    ></textarea>
    <view class="text-gray absolute bottom-3 right-0 flex items-center gap-2">
      <view v-if="showCount" class="pointer-events-none">
        {{ modelValue?.length ?? 0 }} / {{ maxlength }}
      </view>
      <view
        v-if="allowClear"
        class="i-tabler-playstation-x"
        @click="handleClear"
      ></view>
    </view>
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
  onChange?: (value: string | undefined) => void
  /**
   * 是否显示清除按钮
   */
  allowClear?: boolean
  /**
   * 最大长度
   */
  maxlength?: number
  /**
   * 显示字数统计
   */
  showCount?: boolean
  /**
   * 是否自动增高输入区域
   */
  autoHeight?: boolean
  /**
   * 指定光标与键盘的距离
   */
  cursorSpacing?: number
}

declare global {
  interface FieldItem {
    textarea: Props
  }
}

const props = withDefaults(defineProps<Props>(), {
  maxlength: 140,
})

const modelValue = defineModel<string>()

defineOptions({
  inheritAttrs: false,
})

const handleChange = (e: any) => {
  const val = e.detail.value
  modelValue.value = val
  props.onChange?.(val)
}

const handleClear = () => {
  modelValue.value = undefined
  props.onChange?.(modelValue.value)
}
</script>
