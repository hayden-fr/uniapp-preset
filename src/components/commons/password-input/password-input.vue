<template>
  <view class="flex items-center justify-end gap-2">
    <text v-if="readonly">{{ modelValue }}</text>
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
      v-if="showVisible"
      class="text-gray"
      :class="[checkPassword ? 'i-tabler-eye' : 'i-tabler-eye-closed']"
      @click="handleToggle"
    ></view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  showVisible?: boolean
  onChange?: (val: string) => void
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

const checkPassword = ref(false)

const handleToggle = () => {
  checkPassword.value = !checkPassword.value
}
</script>
