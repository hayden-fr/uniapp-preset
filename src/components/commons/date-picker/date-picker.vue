<template>
  <text v-if="readonly">{{ modelValue }}</text>
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
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  start?: string
  end?: string
  fields?: 'year' | 'month' | 'day'
  onChange?: (val: string) => void
}

declare global {
  type FormItemDatePicker = GenericFormItem<'date', Props>
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
