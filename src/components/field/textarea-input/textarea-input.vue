<template>
  <view :class="wrapperClassNames">
    <view v-if="readonly" class="break-all py-3">
      {{ modelValue ?? emptyValue }}
    </view>
    <view v-else class="relative w-full py-3">
      <textarea
        :value="modelValue"
        @input="handleChange"
        :class="contentClassNames"
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
          v-if="showClearBtn"
          v-show="modelValue"
          :class="allowClearClassNames"
          @click="handleClear"
        ></view>
      </view>
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

const wrapperClassNames = computed(() => {
  const classNames: ClassNameValue = ['flex w-full items-center gap-2']

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const contentClassNames = computed(() => {
  const classNames: ClassNameValue = ['w-full']

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
