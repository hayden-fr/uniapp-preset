<template>
  <view class="form-container" :class="classNames?.root" :style="styles?.root">
    <view
      v-for="item in items"
      :key="item.field"
      class="relative min-h-12 px-4"
      :class="[{ 'border-b': border }, classNames?.item, item.classNames?.item]"
      :style="[styles?.item, item.styles?.item]"
    >
      <view
        class="border-light absolute left-0 flex h-12 w-full items-center px-4"
        :class="{ 'border-b': (item.labelPosition ?? labelPosition) === 'top' }"
      >
        <view
          v-if="item.required ?? item.rules?.some((rule) => rule.required)"
          class="absolute left-1 text-red-500"
          :class="[classNames?.required, item.classNames?.required]"
          :style="[styles?.required, item.styles?.required]"
        >
          *
        </view>
        <view
          v-show="(item.labelPosition ?? labelPosition) !== false"
          class="min-w-16 shrink-0"
          :class="[classNames?.label, item.classNames?.label]"
          :style="[
            { width: item.labelWidth ?? labelWidth },
            styles?.label,
            item.styles?.label,
          ]"
        >
          {{ item.label }}
        </view>
        <view class="pointer-events-none flex-1"></view>
      </view>

      <view
        v-if="(item.labelPosition ?? labelPosition) === 'top'"
        class="h-12"
      ></view>

      <view class="flex min-h-12 w-full items-center gap-2">
        <view
          v-if="(item.labelPosition ?? labelPosition) === 'left'"
          class="min-w-16 shrink-0"
          :class="[classNames?.label, item.classNames?.label]"
          :style="[
            { width: item.labelWidth ?? labelWidth },
            styles?.label,
            item.styles?.label,
          ]"
        ></view>
        <view
          class="flex-1 overflow-hidden"
          :class="[
            { 'text-right': (item.labelPosition ?? labelPosition) === 'left' },
            classNames?.input,
            item.classNames?.input,
          ]"
          :style="[styles?.input, item.styles?.input]"
        >
          <template v-if="item.type === 'custom'">
            <slot :name="item.field"></slot>
          </template>

          <date-picker
            v-else-if="item.type === 'date'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></date-picker>

          <number-input
            v-else-if="item.type === 'number'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></number-input>

          <password-input
            v-else-if="item.type === 'password'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></password-input>

          <textarea-input
            v-else-if="item.type === 'textarea'"
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></textarea-input>

          <text-input
            v-else
            :readonly="readonly"
            v-bind="item"
            v-model="formData[item.field]"
          ></text-input>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import datePicker from '@/components/commons/date-picker/date-picker.vue'
import numberInput from '@/components/commons/number-input/number-input.vue'
import passwordInput from '@/components/commons/password-input/password-input.vue'
import textInput from '@/components/commons/text-input/text-input.vue'
import textareaInput from '@/components/commons/textarea-input/textarea-input.vue'

const formData = defineModel<Data>({ default: () => ({}) })

interface Props {
  items?: FormItem<Data>[]
  readonly?: boolean
  labelPosition?: BaseFormItem<Data>['labelPosition']
  labelWidth?: BaseFormItem<Data>['labelWidth']
  labelAlign?: BaseFormItem<Data>['labelAlign']
  border?: boolean
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  styles?: Semantic<SemanticDOM, StyleValue>
}

type SemanticDOM = 'root' | FormItemSemanticDOM

withDefaults(defineProps<Props>(), {
  items: () => [],
  labelPosition: 'left',
  labelWidth: '4rem',
  labelAlign: 'left',
  border: true,
})
</script>
