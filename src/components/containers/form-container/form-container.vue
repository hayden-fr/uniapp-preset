<template>
  <view class="form-container" :class="classNames?.root" :style="styles?.root">
    <form-item
      v-for="item in items"
      :key="item.field"
      :item="item"
      :config="formConfig"
      v-model="formData[item.field]"
    >
      <template #[item.field]>
        <slot
          :name="item.field"
          :readonly="readonly"
          :empty-value="emptyValue"
          :disabled="disabled"
          :item="item"
        ></slot>
      </template>
      <template #[`${item.field.toString()}_suffix`]>
        <slot :name="item.field.toString() + '_suffix'"></slot>
      </template>
    </form-item>
  </view>
</template>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import type { FormConfig, FormContainerProps } from './form-interface'
import formItem from './form-item.vue'

const formData = defineModel<Data>({ default: reactive({}) })

const props = withDefaults(defineProps<FormContainerProps<Data>>(), {
  items: () => [],
  itemsValidation: () => ({}),
  disabled: false,
  readonly: false,
  emptyValue: '-',
  labelPosition: 'left',
  labelWidth: '4rem',
  labelAlign: 'left',
  border: true,
  classNames: () => ({}),
  styles: () => ({}),
})

const formConfig = computed<FormConfig>(() => {
  return _.omit(props, 'items')
})
</script>
