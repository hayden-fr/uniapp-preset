<template>
  <view
    :key="item.field"
    class="relative min-h-12 px-4"
    :class="[{ 'border-b': border }, classNames?.item, item.classNames?.item]"
    :style="[styles?.item, item.styles?.item]"
  >
    <view
      v-if="item.label !== false"
      class="border-light absolute left-0 flex h-12 w-full items-center px-4"
      :class="{ 'border-b': labelPosition === 'top' }"
    >
      <view
        v-if="item.required"
        class="absolute left-1 text-red-500"
        :class="[classNames?.required, item.classNames?.required]"
        :style="[styles?.required, item.styles?.required]"
      >
        *
      </view>
      <view
        v-show="labelPosition !== false"
        class="min-w-16 shrink-0"
        :class="[classNames?.label, item.classNames?.label]"
        :style="[
          {
            width: labelWidth,
            textAlign: labelAlign,
          },
          styles?.label,
          item.styles?.label,
        ]"
      >
        {{ item.label }}
      </view>
      <view class="pointer-events-none flex-1"></view>
    </view>

    <view
      v-if="labelPosition === 'top' && item.label !== false"
      class="h-12"
    ></view>

    <view class="flex min-h-12 w-full items-center gap-2">
      <view
        v-if="labelPosition === 'left' && item.label !== false"
        class="min-w-16 shrink-0"
        :class="[classNames?.label, item.classNames?.label]"
        :style="[
          { width: item.labelWidth ?? labelWidth },
          styles?.label,
          item.styles?.label,
        ]"
      ></view>
      <view
        class="flex flex-1 items-center overflow-hidden"
        :class="[
          { 'text-right': labelPosition === 'left' },
          classNames?.input,
          item.classNames?.input,
        ]"
        :style="[styles?.input, item.styles?.input]"
      >
        <view class="flex-1">
          <template v-if="item.type === 'custom'">
            <slot
              :name="item.field"
              :readonly="readonly"
              :empty-value="emptyValue"
              :disabled="disabled"
              :item="item"
            ></slot>
          </template>

          <logic-input
            v-else-if="item.type === 'logic'"
            :readonly="readonly"
            :empty-value="emptyValue"
            :disabled="disabled"
            v-bind="item"
            v-model="modelValue"
          ></logic-input>

          <option-picker
            v-else-if="item.type === 'option'"
            :readonly="readonly"
            :empty-value="emptyValue"
            :disabled="disabled"
            v-bind="item"
            v-model="modelValue"
          ></option-picker>

          <date-picker
            v-else-if="item.type === 'date'"
            :readonly="readonly"
            :empty-value="emptyValue"
            :disabled="disabled"
            v-bind="item"
            v-model="modelValue"
          ></date-picker>

          <number-input
            v-else-if="item.type === 'number'"
            :readonly="readonly"
            :empty-value="emptyValue"
            :disabled="disabled"
            v-bind="item"
            v-model="modelValue"
          ></number-input>

          <password-input
            v-else-if="item.type === 'password'"
            :readonly="readonly"
            :empty-value="emptyValue"
            :disabled="disabled"
            v-bind="item"
            v-model="modelValue"
          ></password-input>

          <textarea-input
            v-else-if="item.type === 'textarea'"
            :readonly="readonly"
            :empty-value="emptyValue"
            :disabled="disabled"
            v-bind="item"
            v-model="modelValue"
          ></textarea-input>

          <text-input
            v-else
            :readonly="readonly"
            :empty-value="emptyValue"
            :disabled="disabled"
            v-bind="item"
            v-model="modelValue"
          ></text-input>
        </view>
      </view>
      <slot :name="`${item.field.toString()}-suffix`"></slot>
    </view>

    <view
      :class="[
        'text-red absolute bottom-0 text-xs',
        labelPosition === 'left' ? 'right-4' : '',
        classNames?.validation,
        item.classNames?.validation,
      ]"
      :style="[styles?.validation, item.styles?.validation]"
    >
      {{ validationMessage }}
    </view>
  </view>
</template>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import datePicker from '@/components/commons/date-picker/date-picker.vue'
import logicInput from '@/components/commons/logic-input/logic-input.vue'
import numberInput from '@/components/commons/number-input/number-input.vue'
import optionPicker from '@/components/commons/option-picker/option-picker.vue'
import passwordInput from '@/components/commons/password-input/password-input.vue'
import textInput from '@/components/commons/text-input/text-input.vue'
import textareaInput from '@/components/commons/textarea-input/textarea-input.vue'
import { type FormConfig } from './form-interface'

interface Props {
  /**
   * 表单项配置
   */
  item: FormItem<Data>
  /**
   * 表单配置
   */
  config: FormConfig
}

const props = defineProps<Props>()

const modelValue = defineModel<any>()

const disabled = computed(() => props.item.disabled ?? props.config.disabled)

const readonly = computed(() => props.item.readonly ?? props.config.readonly)

const emptyValue = computed(
  () => props.item.emptyValue ?? props.config.emptyValue,
)

const labelPosition = computed(
  () => props.item.labelPosition ?? props.config.labelPosition,
)

const labelWidth = computed(
  () => props.item.labelWidth ?? props.config.labelWidth,
)

const labelAlign = computed(
  () => props.item.labelAlign ?? props.config.labelAlign,
)

const border = computed(() => props.config.border)

const classNames = computed(() => props.config.classNames)

const styles = computed(() => props.config.styles)

const validationMessage = computed(() => {
  const validation = toValue(props.config.itemsValidation)
  return validation?.[props.item.field]?.message
})
</script>
