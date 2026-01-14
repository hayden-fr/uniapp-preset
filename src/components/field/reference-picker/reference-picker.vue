<template>
  <view :class="wrapperClassNames">
    <view v-if="icon" :class="[icon]"></view>
    <view class="h-full flex-1 overflow-hidden" @click="handleChange">
      <view class="flex h-full items-center">
        <view class="text-0 w-full">
          <view class="text-16px inline-block max-w-full">
            <view class="flex items-center gap-1">
              <view v-show="content" :class="contentClassNames">
                {{ content }}
              </view>
              <view v-show="multipleCount" :class="multipleCountClassNames">
                {{ multipleCount }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view
      v-if="showClearBtn"
      v-show="modelValue"
      :class="allowClearClassNames"
      @click="handleClear"
    ></view>
  </view>
</template>

<script setup lang="ts">
interface Props extends ReferenceParameters, ReferenceOptions {
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
   * 同一表单或同一行的数据信息
   */
  fieldDatas?: AnyObject
  /**
   * 图标
   */
  icon?: string
  /**
   * 是否显示清除按钮
   */
  allowClear?: boolean
  /**
   * 值改变时回调
   */
  onChange?: (value: string | string[] | undefined, items: AnyObject[]) => void
  /**
   * 参照页面地址
   */
  referencePageUrl?: string
  /**
   * 字段名
   */
  field: string
  /**
   * 如何从 fieldDatas 中获取参照字段编码，默认为 field + 'Code'
   */
  fieldCode?: string | ((field: string) => string)
  /**
   * 如何从 fieldDatas 中获取参照字段名称，默认为 field + 'Name'
   */
  fieldName?: string | ((field: string) => string)
  /**
   * 自定义解析值
   */
  parseValue?: (
    value: string | string[] | undefined,
    fieldDatas: AnyObject,
  ) => AnyObject[]
}

/**
 * 参照字段
 */
interface ReferenceFieldProps {
  /**
   * id
   */
  id?: string
  /**
   * 编码
   */
  code?: string
  /**
   * 名称
   */
  name?: string
}

/**
 * 通过 url 查询参数透传的设置
 */
interface ReferenceParameters {
  /**
   * 参照页面标题
   */
  title?: string
  /**
   * 是否多选
   */
  multiple?: boolean
  /**
   * 多选模式下，值的存储形式
   */
  multipleMode?: 'array' | 'comma'
  /**
   * 多选模式下，最多可选择的个数，不填或者填 0 则不限制
   */
  multipleMax?: number
  /**
   * 参照字段映射，用于改变非标准参照字段名称
   */
  defaultProps?: ReferenceFieldProps
  /**
   * 是否显示搜索框
   */
  showSearch?: boolean
}

/**
 * 通过 event channel 透传的设置
 */
interface ReferenceOptions {
  /**
   * 数据源
   */
  dataSource?: string
  /**
   * 自定义查询参数
   */
  queryParams?: Record<string, any>
  /**
   * 请求方式
   */
  requestMethod?: 'get' | 'post'
  /**
   * 请求透传参数
   */
  requestOptions?: Partial<UniHttpRequestOptions>
  /**
   * 查询组件参数透传
   */
  searchOptions?: FieldItem['text'] & {
    field?: string
  }
  /**
   * 列表组件参数透传
   */
  listOptions?: GlobalConfig['listContainerHook']
}

declare global {
  interface FieldItem {
    reference: Props
  }

  /**
   * 通过 url 查询参数透传的设置
   */
  type PageReferenceParameters = Required<ReferenceParameters> & {
    /**
     * 页面场景
     */
    scene: 'reference' | string
    /**
     * 参照字段
     */
    field: string
  }
  /**
   * 通过 event channel 透传的设置
   */
  type PageReferenceOptions = Required<ReferenceOptions> & {
    /**
     * 已选中的值
     */
    value: AnyObject[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  referencePageUrl: '/pages/common/reference',
  queryParams: () => ({}),
  requestMethod: 'get',
  title: '参照',
  multiple: false,
  multipleMode: 'array',
  multipleMax: 0,
  defaultProps: (p) => {
    const defaultProps = { id: 'id', code: 'code', name: 'name' }
    return Object.assign(defaultProps, p.defaultProps)
  },
  showSearch: false,
})

const modelValue = defineModel<string | string[]>()

defineOptions({
  inheritAttrs: false,
})

const fieldCode = computed(() => {
  if (typeof props.fieldCode === 'string') {
    return props.fieldCode
  }
  if (typeof props.fieldCode === 'function') {
    return props.fieldCode(props.field)
  }
  return props.field + 'Code'
})

const fieldName = computed(() => {
  if (typeof props.fieldName === 'string') {
    return props.fieldName
  }
  if (typeof props.fieldName === 'function') {
    return props.fieldName(props.field)
  }
  return props.field + 'Name'
})

const propsId = computed(() => props.defaultProps.id!)
const propsCode = computed(() => props.defaultProps.code!)
const propsName = computed(() => props.defaultProps.name!)

const selectedItems = computed(() => {
  const fieldDatas = Object.assign({}, props.fieldDatas)

  if (props.parseValue) {
    return props.parseValue(toValue(modelValue), fieldDatas)
  }

  const loopTrim = (value: string[]) => value.map((v) => v.trim())
  const loopValidate = (value: string[]) =>
    value.filter((v) => !_.isNil(v) && v.length > 0)

  const _arrays = (val: string | string[] | undefined) => {
    if (typeof val === 'string') {
      return loopValidate(loopTrim(val.split(',')))
    }
    if (Array.isArray(val)) {
      return loopValidate(val)
    }
    return []
  }

  const arrayValue = _arrays(toValue(modelValue))
  const arrayValueCode = _arrays(fieldDatas[toValue(fieldCode)])
  const arrayValueName = _arrays(fieldDatas[toValue(fieldName)])

  const result: AnyObject[] = []
  for (let index = 0; index < arrayValue.length; index++) {
    result.push({
      [toValue(propsId)]: arrayValue[index],
      [toValue(propsCode)]: arrayValueCode[index],
      [toValue(propsName)]: arrayValueName[index] ?? arrayValue[index],
    })
  }

  return props.multiple ? result : result.slice(0, 1)
})

const wrapperClassNames = computed(() => {
  const classNames: ClassNameValue = ['flex w-full items-center gap-2']
  // flex h-8 w-full items-center gap-2

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const content = computed(() => {
  const firstItem = selectedItems.value[0]
  const label = firstItem?.[toValue(propsName)]

  if (props.readonly) {
    return label ?? props.emptyValue
  }

  return label || props.placeholder
})

const contentClassNames = computed(() => {
  const classNames: ClassNameValue = [
    'whitespace-nowrap overflow-hidden text-ellipsis',
  ]

  if (selectedItems.value.length === 0) {
    classNames.push('text-black/50')
  } else if (props.multiple) {
    classNames.push('rounded px-2 py-px')
    classNames.push('border text-primary border-primary bg-primary-light')
  }

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const multipleCount = computed(() => {
  if (props.multiple && selectedItems.value.length > 1) {
    return `+${selectedItems.value.length - 1}`
  }
  return false
})

const multipleCountClassNames = computed(() => {
  const classNames: ClassNameValue = ['whitespace-nowrap']
  if (props.multiple) {
    classNames.push('rounded px-2 py-px')
    classNames.push('border text-primary border-primary bg-primary-light')
  }

  if (props.disabled) {
    classNames.push('opacity-70')
  }

  return classNames
})

const { stringifyQueryParams } = useSimpleQueryString()

const handleChange = async () => {
  if (props.readonly) {
    return
  }

  if (props.disabled) {
    return
  }

  const field = props.field

  const params: PageReferenceParameters = {
    scene: 'reference',
    field: field,
    title: props.title,
    multiple: props.multiple,
    multipleMode: props.multipleMode,
    multipleMax: props.multipleMax,
    defaultProps: props.defaultProps,
    showSearch: props.showSearch,
  }
  const options: PageReferenceOptions = {
    dataSource: props.dataSource ?? '',
    requestMethod: props.requestMethod,
    queryParams: props.queryParams,
    value: selectedItems.value,
    requestOptions: props.requestOptions ?? {},
    searchOptions: props.searchOptions ?? {},
    listOptions: props.listOptions ?? {},
  }

  const res = await uni.navigateTo({
    url: `${props.referencePageUrl}?${stringifyQueryParams(params)}`,
    events: {
      [`${field}-reference-confirm`]: (data: AnyObject[]) => {
        const fieldDatas = props.fieldDatas || {}
        let join = (items: string[]): any => items
        let items = data

        if (!props.multiple) {
          items = data.slice(0, 1)
          join = (items: string[]) => items[0]
        }

        if (props.multiple && props.multipleMode === 'comma') {
          join = (items: string[]) => items.join(',')
        }

        const id = (item: AnyObject) => item[toValue(propsId)]
        const code = (item: AnyObject) => item[toValue(propsCode)]
        const name = (item: AnyObject) => item[toValue(propsName)]

        const value = join(items.map((item) => id(item)))
        modelValue.value = value
        fieldDatas[toValue(fieldCode)] = join(items.map((item) => code(item)))
        fieldDatas[toValue(fieldName)] = join(items.map((item) => name(item)))
        props.onChange?.(value, items)
      },
    },
  })
  res.eventChannel.emit(`${field}-reference-options`, options)
}

const showClearBtn = computed(() => {
  return !props.readonly && props.allowClear
})

const allowClearClassNames = computed(() => {
  const classNames: ClassNameValue = ['text-gray i-tabler-playstation-x']
  return classNames
})

const handleClear = () => {
  if (props.disabled) {
    return
  }

  modelValue.value = undefined
  props.onChange?.(undefined, [])
}
</script>
