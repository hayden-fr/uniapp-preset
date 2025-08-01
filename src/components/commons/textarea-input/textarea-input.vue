<template>
  <view v-if="readonly" class="py-3">
    <text>{{ modelValue }}</text>
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
    <view
      v-if="showCount"
      class="text-gray pointer-events-none absolute bottom-3 right-0"
    >
      {{ modelValue?.length ?? 0 }} / {{ maxlength }}
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  maxlength?: number
  showCount?: boolean
  autoHeight?: boolean
  cursorSpacing?: number
  onChange?: (val: string) => void
}

declare global {
  type FormItemTextareaInput = GenericFormItem<'textarea', Props>
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
</script>
