<template>
  <view class="flex w-full items-center gap-2">
    <view v-if="icon" :class="[icon]"></view>
    <text v-if="readonly">{{ modelValue ?? emptyValue }}</text>
    <input
      v-else
      :type="checkPassword ? 'text' : 'password'"
      :value="modelValue"
      :password="!checkPassword"
      @input="handleChange"
      class="flex-1"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <view
      v-if="allowClear"
      v-show="modelValue"
      class="text-gray i-tabler-playstation-x"
      @click="handleClear"
    ></view>
    <view
      v-if="showVisible"
      class="text-gray"
      :class="[checkPassword ? 'i-tabler-eye' : 'i-tabler-eye-closed']"
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
   * 是否显示密码可见
   */
  showVisible?: boolean
}

declare global {
  type FormItemPasswordInput = GenericFormItem<'password', Props>
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
  modelValue.value = undefined
  props.onChange?.(modelValue.value)
}

const checkPassword = ref(false)

const handleToggle = () => {
  checkPassword.value = !checkPassword.value
}
</script>
