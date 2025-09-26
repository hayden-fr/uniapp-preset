<template>
  <view class="flex w-full items-center gap-2">
    <view v-if="icon" :class="[icon]"></view>
    <text v-if="readonly">{{ modelValue }}</text>
    <template v-else>
      <input
        type="text"
        class="flex-1"
        :value="modelValue"
        @input="handleChange"
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <view
        v-if="allowClear"
        v-show="modelValue"
        class="i-tabler-playstation-x"
        @click="handleClear"
      ></view>
    </template>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /**
   * 是否只读
   */
  readonly?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 提示文字
   */
  placeholder?: string
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
  onChange?: (val: string) => void
}

declare global {
  type FormItemTextInput = GenericFormItem<'text', Props>
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

const handleClear = () => {
  console.log('clear input value')
  const val = ''
  modelValue.value = val
  props.onChange?.(val)
}
</script>
