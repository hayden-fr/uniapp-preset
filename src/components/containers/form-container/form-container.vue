<template>
  <view class="form-container" :class="classNames?.root" :style="styles?.root">
    <template v-for="item in items" :key="item.field">
      <form-group
        v-if="item.type === 'group'"
        :item="item"
        :config="formConfig"
        :error-message="itemsValidation[item.field]"
        v-model="formData[item.field]"
        :field="item.field"
        :slots="$slots"
      >
        <template #[`${item.field.toString()}-label`]>
          <slot :name="`${item.field.toString()}-label`"></slot>
        </template>
        <template #[`${item.field.toString()}-label-suffix`]>
          <slot :name="`${item.field.toString()}-label-suffix`"></slot>
        </template>
        <form-item
          v-for="childItem in item.children"
          :key="childItem.field"
          :item="childItem"
          :config="{
            ...formConfig,
            ...item.groupConfig,
          }"
          :error-message="itemsValidation[childItem.field]"
          :field="childItem.field"
          :slots="$slots"
        >
          <template #[`${childItem.field.toString()}-label`]>
            <slot :name="`${childItem.field.toString()}-label`"></slot>
          </template>
          <template #[`${childItem.field.toString()}-label-suffix`]>
            <slot :name="`${childItem.field.toString()}-label-suffix`"></slot>
          </template>
          <template #[`${childItem.field.toString()}-prefix`]>
            <slot :name="`${childItem.field.toString()}-prefix`"></slot>
          </template>
          <template #[`${childItem.field.toString()}`]>
            <slot :name="`${childItem.field.toString()}`">
              <field
                :type="childItem.type"
                :field-props="{
                  ...pickFieldConfig(formConfig),
                  ...pickFieldConfig(item.groupConfig),
                  ...childItem,
                }"
                :field-datas="formData"
                v-model="formData[childItem.field]"
              ></field>
            </slot>
          </template>
          <template #[`${childItem.field.toString()}-suffix`]>
            <slot :name="`${childItem.field.toString()}-suffix`"></slot>
          </template>
        </form-item>
      </form-group>
      <form-item
        v-else
        :item="item"
        :config="formConfig"
        :error-message="itemsValidation[item.field]"
        :field="item.field"
        :slots="$slots"
      >
        <template #[`${item.field.toString()}-label`]>
          <slot :name="`${item.field.toString()}-label`"></slot>
        </template>
        <template #[`${item.field.toString()}-label-suffix`]>
          <slot :name="`${item.field.toString()}-label-suffix`"></slot>
        </template>
        <template #[`${item.field.toString()}-prefix`]>
          <slot :name="`${item.field.toString()}-prefix`"></slot>
        </template>
        <template #[`${item.field.toString()}`]>
          <slot :name="`${item.field.toString()}`">
            <field
              :type="item.type"
              :field-props="{
                ...pickFieldConfig(formConfig),
                ...item,
              }"
              :field-datas="formData"
              v-model="formData[item.field]"
            ></field>
          </slot>
        </template>
        <template #[`${item.field.toString()}-suffix`]>
          <slot :name="`${item.field.toString()}-suffix`"></slot>
        </template>
      </form-item>
    </template>
  </view>
</template>

<script lang="ts">
interface BaseFormItemProps {
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
   * 表单项标签位置
   */
  labelPosition?: FormItemLabelPositionType
  /**
   * 表单项标签宽度
   */
  labelWidth?: string
  /**
   * 表单项标签对齐方式
   */
  labelAlign?: TextAlignType
  /**
   * 表单项内容对齐方式
   */
  contentAlign?: TextAlignType
  /**
   * 是否显示边框
   */
  itemBottomBorder?: boolean
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<FormContainerSemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<FormContainerSemanticDOM, StyleValue>
}

declare global {
  /**
   * 表单项标签位置
   */
  type FormItemLabelPositionType = 'left' | 'top' | false

  /**
   * 表单项错误提示信息
   */
  interface FormItemErrorMessage {
    message?: string
  }

  type FormItemError<Data extends AnyObject = AnyObject> = {
    [k in FormItem<Data>['field']]?: FormItemErrorMessage
  }

  /**
   * 表单项校验规则
   */
  interface FormRuleItem<Data extends AnyObject = any> {
    /**
     * string 类型时为字符串长度；number 类型时为确定数字； array 类型时为数组长度
     */
    len?: number
    /**
     * string 类型为字符串最小长度；number 类型时为最小值；array 类型时为数组最小长度
     */
    min?: number
    /**
     * string 类型为字符串最大长度；number 类型时为最大值；array 类型时为数组最大长度
     */
    max?: number
    /**
     * 是否为必选字段，多次设置以最后一个为准
     */
    required?: boolean
    /**
     * 错误信息，不设置时会通过模板自动生成
     */
    message?: string
    /**
     * 正则表达式匹配
     */
    pattern?: RegExp
    /**
     * 自定义校验，接收 Promise 作为返回值。
     *
     * @param rule
     * @param value
     */
    validator?: (rule: FormRuleItem<Data>, value: Data) => Promise<void>
  }

  type FormItemSemanticDOM =
    | 'item'
    | 'title'
    | 'label'
    | 'content'
    | 'required'
    | 'errorMessage'

  type FormContainerSemanticDOM = 'root' | FormItemSemanticDOM

  type FormCommonProps = BaseFormItemProps

  interface BaseFormItem extends BaseFormItemProps {
    /**
     * 表单项标签，如果设置为 false，则不显示标签
     */
    label?: string | false
    /**
     * 表单项验证规则
     */
    rules?: FormRuleItem[]
    /**
     * 是否必填
     *
     * 显示必填星号与 rules[index].required: true 的语法糖，
     * 当设置 rules[index].required 时以后者为准
     */
    required?: boolean
  }

  /**
   * 表单项配置
   */
  type FormItem<Data extends AnyObject = any> =
    | FormItemField<Data>
    | FormItemGroup<Data>
}
</script>

<script setup lang="ts" generic="Data extends Record<string, any> = object">
import field from '@/components/field/field.vue'
import formGroup from './form-group.vue'
import formItem from './form-item.vue'

interface Props extends BaseFormItemProps {
  /**
   * 表单数据项
   */
  items?: FormItem<Data>[]
  /**
   * 表单项验证结果
   */
  itemsValidation?: FormItemError<Data>
}

const formData = defineModel<Data>({ default: reactive({}) })

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  itemsValidation: () => ({}),
  disabled: false,
  readonly: false,
  emptyValue: '-',
  labelPosition: 'left',
  itemBottomBorder: true,
  classNames: () => ({}),
  styles: () => ({}),
})

/**
 * 透传给表单项的配置
 */
const formConfig = computed(() => {
  return _.omit(props, 'items', 'itemsValidation')
})

const pickFieldConfig = (config: BaseFormItemProps = {}) => {
  return _.pick(config, ['disabled', 'readonly', 'emptyValue'])
}
</script>
