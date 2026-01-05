<template>
  <easycom-page-container>
    <template #navigation-bar>
      <custom-navigation-bar :title="title"></custom-navigation-bar>
    </template>

    <view class="flex h-full w-full flex-col overflow-hidden">
      <view v-if="props.showSearch" class="px-4 py-2">
        <view class="rounded border px-4 py-2">
          <easycom-field
            type="text"
            :field-props="{ placeholder: '请搜索' }"
          ></easycom-field>
        </view>
      </view>

      <view class="relative flex-1 overflow-hidden">
        <easycom-list-container v-bind="listProps">
          <template #item="{ item, index }">
            <view class="relative border-b p-4" @click="handleClick(item)">
              <view class="flex items-center gap-2">
                <easycom-field
                  type="logic"
                  :model-value="selectedItemsId.includes(item[propsId])"
                  :field-props="{ mode: 'radio' }"
                ></easycom-field>
                <text>{{ index + 1 }}</text>
                <text>-</text>
                <text>{{ item[propsCode] }}</text>
                <text>-</text>
                <text>{{ item[propsName] }}</text>
              </view>
              <view class="absolute left-0 top-0 h-full w-full"></view>
            </view>
          </template>
        </easycom-list-container>
      </view>

      <view class="relative flex items-center justify-between px-4 py-2">
        <view class="bg-gray-1 absolute left-0 top-0 h-px w-full"></view>
        <view class="flex items-center gap-2" @click="showSelected">
          <text>已选</text>
          <text>{{ selectedItemsId.length }}</text>
        </view>
        <easycom-button size="small" type="primary" @click="confirm">
          确认
        </easycom-button>
      </view>
    </view>
  </easycom-page-container>
</template>

<script setup lang="ts">
import customNavigationBar from '@/components/containers/page-container/custom-navigation-bar.vue'

const props = usePageParameters<PageReferenceParameters>()

const field = computed(() => props.value.field)
const multiple = computed(() => props.value.multiple)
const title = computed(() => decodeURIComponent(props.value.title || '参照'))
const propsId = computed(() => props.value.defaultProps?.id || 'id')
const propsCode = computed(() => props.value.defaultProps?.code || 'code')
const propsName = computed(() => props.value.defaultProps?.name || 'name')

const manual = ref(true)
const refresherEnabled = computed(() => !manual.value)

const options = ref<Partial<PageReferenceOptions>>({})
const selectedItemsId = computed(
  () => options.value.value?.map((item) => item[propsId.value]) ?? [],
)

const eventChannel = useEventChannel((e) => {
  try {
    const field = props.value.field
    e.once(`${field}-reference-options`, (data: PageReferenceOptions) => {
      options.value = data
      manual.value = !!data.dataSource
      refresh()
    })
  } catch {
    uni.navigateBack()
  }
})

const { listProps, refresh } = useListContainer({
  rowKey: propsId,
  manual: manual,
  defaultPageSize: 20,
  refresherEnabled: refresherEnabled,
  getListData: async (pagination, params) => {
    const dataSource = options.value.dataSource || ''
    const reuqestMethod = options.value.requestMethod || 'get'
    type RequestMethod = Uppercase<typeof reuqestMethod>
    const method = reuqestMethod.toUpperCase() as RequestMethod
    const requestOptions: UniHttpRequestOptions = {
      url: dataSource,
      method: method,
    }

    const customQueryParams = options.value.queryParams
    const queryParams = Object.assign({}, pagination, params, customQueryParams)
    if (method === 'GET') {
      requestOptions.params = queryParams
    } else {
      requestOptions.data = queryParams
    }

    // 合并透传请求参数
    Object.assign(requestOptions, options.value.requestOptions)

    return request.httpRequest<ListStructure<any>>(requestOptions)
  },
})

const showSelected = () => {}

const handleClick = (item: Record<string, any>) => {
  if (multiple.value) {
    const currId = item[toValue(propsId)]
    const isSelected = selectedItemsId.value.includes(currId)
    const originalValue = options.value.value ?? []
    if (isSelected) {
      options.value.value = originalValue.filter(
        (item) => item[toValue(propsId)] !== currId,
      )
    } else {
      options.value.value = [...originalValue, item]
    }
  } else {
    options.value.value = [item]
  }
}

const confirm = () => {
  uni.navigateBack()
  eventChannel.emit(`${toValue(field)}-reference-confirm`, options.value.value)
}
</script>
