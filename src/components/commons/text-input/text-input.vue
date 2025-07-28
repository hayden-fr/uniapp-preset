<template>
  <text v-if="readonly">{{ modelValue }}</text>
  <input
    v-else
    type="text"
    :value="modelValue"
    @input="handleChange"
    :placeholder="placeholder"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
interface Props {
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
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
</script>
