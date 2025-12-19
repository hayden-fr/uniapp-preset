<template>
  <view :key="item.field" :class="itemClassNames" :style="itemStyles">
    <view class="relative">
      <view :class="requiredClassNames" :style="requiredStyles">*</view>

      <view :class="titleClassNames" :style="titleStyles">
        <view :class="labelClassNames" :style="labelStyles">
          <slot
            v-if="_slots[`${item.field.toString()}-label`]"
            :name="`${item.field.toString()}-label`"
          ></slot>
          <template v-else>{{ item.label }}</template>
        </view>
        <view class="flex-1">
          <slot
            v-if="_slots[`${item.field.toString()}-label-suffix`]"
            :name="`${item.field.toString()}-label-suffix`"
          ></slot>
        </view>
      </view>

      <view :class="contnetClassNames" :style="contentStyles">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
type FormItemGropuProps<Data extends AnyObject = any> = {
  /**
   * 指定当前字段为一个字段分组
   */
  type: 'group'
  /**
   * 表单项
   */
  children: FormItemField<Data>[]
  /**
   * 分组透传给表单项的配置
   */
  groupConfig?: FormCommonProps
}

declare global {
  /**
   * 表单项分组
   */
  type FormItemGroup<Data extends AnyObject = any> = {
    /**
     * 分组字段名
     */
    field: string
  } & FormItemGropuProps<Data> &
    BaseFormItem
}
</script>

<script setup lang="ts" generic="Data extends AnyObject = any">
interface Props {
  /**
   * 表单项
   */
  item: FormItemGroup<Data>
  /**
   * 表单配置
   */
  config: FormCommonProps
  /**
   * 表单错误信息
   */
  errorMessage?: FormItemErrorMessage
}

const props = withDefaults(defineProps<Props>(), {
  item: () => ({}) as FormItemGroup<Data>,
})

defineOptions({
  inheritAttrs: false,
})

const slots = useSlots()
const attrs = useAttrs()

type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
type Slots = Mutable<ReturnType<typeof useSlots>>

const _slots = computed(() => {
  const $field = attrs.field as string | undefined
  const $slots = attrs.slots as Slots | undefined
  if (!_.isNil($field) && $slots) {
    const slotsname = new RegExp(
      `^${$field}(-label|-label-suffix|-prefix|-suffix)?$`,
    )
    const _slots: Slots = {}
    for (const key of Object.keys($slots)) {
      if (slotsname.test(key)) {
        _slots[key] = $slots[key]
      }
    }
    return _slots
  }
  return slots
})

const showLabel = computed(() => {
  return props.item.label !== false
})

/**
 * 表单项分组 class
 */
const itemClassNames = computed(() => {
  const classNames: ClassNameValue = []

  if (props.item.classNames?.item) {
    classNames.push(props.item.classNames.item)
  }
  if (props.config.classNames?.item) {
    classNames.push(props.config.classNames.item)
  }

  return classNames
})

/**
 * 表单项分组 style
 */
const itemStyles = computed(() => {
  const styles: StyleValue = []

  if (props.item.styles?.item) {
    styles.push(props.item.styles.item)
  }
  if (props.config.styles?.item) {
    styles.push(props.config.styles.item)
  }

  return styles
})

/**
 * 必填标签 class
 */
const requiredClassNames = computed(() => {
  const classNames: ClassNameValue = [
    'absolute text-red h-12 flex items-center top-0 -left-3',
  ]
  if (props.item.classNames?.required) {
    classNames.push(props.item.classNames.required)
  }
  if (props.config.classNames?.required) {
    classNames.push(props.config.classNames.required)
  }
  return classNames
})

/**
 * 必填标签 style
 */
const requiredStyles = computed(() => {
  const style: StyleValue = {
    display: props.item.required ? '' : 'none',
  }
  const styles: StyleValue = [style]
  if (props.item.styles?.required) {
    styles.push(props.item.styles.required)
  }
  if (props.config.styles?.required) {
    styles.push(props.config.styles.required)
  }
  return styles
})

/**
 * 分组标题 class
 */
const titleClassNames = computed(() => {
  const classNames: ClassNameValue = [
    'flex h-12 w-full items-center px-4 border-b',
  ]
  if (props.item.classNames?.title) {
    classNames.push(props.item.classNames.title)
  }
  if (props.config.classNames?.title) {
    classNames.push(props.config.classNames.title)
  }
  return classNames
})

/**
 * 分组标题 style
 */
const titleStyles = computed(() => {
  const style: StyleValue = {}
  const styles: StyleValue = [style]

  if (!showLabel.value) {
    style.display = 'none'
  }

  if (props.item.styles?.title) {
    styles.push(props.item.styles.title)
  }
  if (props.config.styles?.title) {
    styles.push(props.config.styles.title)
  }
  return styles
})

/**
 * 表单标签 class
 */
const labelClassNames = computed(() => {
  const classNames: ClassNameValue = ['shrink-0 mr-2']
  if (props.item.classNames?.label) {
    classNames.push(props.item.classNames.label)
  }
  if (props.config.classNames?.label) {
    classNames.push(props.config.classNames.label)
  }
  return classNames
})

/**
 * 表单标签 style
 */
const labelStyles = computed(() => {
  const styles: StyleValue = []
  if (props.item.styles?.label) {
    styles.push(props.item.styles.label)
  }
  if (props.config.styles?.label) {
    styles.push(props.config.styles.label)
  }
  return styles
})

/**
 * 表单内容 class
 */
const contnetClassNames = computed(() => {
  const classNames: ClassNameValue = []

  if (props.item.classNames?.content) {
    classNames.push(props.item.classNames.content)
  }
  if (props.config.classNames?.content) {
    classNames.push(props.config.classNames.content)
  }
  return classNames
})

/**
 * 表单内容样式，合并了配置属性和自定义属性
 */
const contentStyles = computed(() => {
  const styles: StyleValue = []

  if (props.item.styles?.content) {
    styles.push(props.item.styles.content)
  }
  if (props.config.styles?.content) {
    styles.push(props.config.styles.content)
  }
  return styles
})
</script>
