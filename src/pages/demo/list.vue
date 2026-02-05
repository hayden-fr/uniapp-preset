<template>
  <easycom-page-container :class-names="{ content: 'gap-4' }" scrollable>
    <view class="mb-4 px-4">
      <view class="mb-4 text-xl">基础列表</view>
      <view class="text-gray-600">
        使用 scroll-view 封装了一个开箱即用的列表组件，配合 useListContainer
        一起使用， 极大简化列表刷新与滚动加载的逻辑。
      </view>
    </view>
    <view class="h-50vh mb-4">
      <easycom-list-container
        v-bind="baseListProps"
        :class-names="{ content: 'px-4' }"
      >
        <template #item="{ item }">
          <view class="py-2">{{ item.name }}: {{ item.no }}</view>
        </template>
      </easycom-list-container>
    </view>

    <view class="mb-4 px-4">
      <view class="mb-4 text-xl">手动控制 / 异步列表</view>
      <view class="flex flex-col gap-2 text-gray-600">
        <view class="">
          默认情况下，useListContainer 会立即获取列表数据，但是在某些场景下，
          我们可能需要延后或者手动控制获取列表数据的时机。
        </view>
        <view class="">
          例如，加载列表前需要先获取列表的分类，根据分类再获取列表，或者我们希望用户在输入筛选条件后，
          点击搜索按钮时才去获取列表数据。
        </view>
        <view class="">
          核心方法是使用 manual 参数，当设置参数 manual 为 true 时，
          表示手动执行列表的刷新操作， 需要主动调用 refresh 来触发刷新。
        </view>
        <view class="">
          另外，可能需要同时设置 refresherEnabled 为 false，
          防止用户误触发下拉刷新。
        </view>
      </view>
    </view>
    <view class="mb-4">
      <easycom-form-container
        v-model="condition"
        :items="conditionItems"
        :itemBottomBorder="false"
      ></easycom-form-container>
      <view class="mt-4 px-4">
        <easycom-button
          type="primary"
          :loading="prepareLoading"
          @click="prepareFetchList"
        >
          准备获取列表数据
        </easycom-button>
      </view>
    </view>
    <view class="h-50vh mb-4">
      <easycom-list-container
        v-bind="controlListProps"
        :class-names="{ content: 'px-4' }"
      >
        <template #item="{ item }">
          <view class="py-2">
            {{ item.name }}[{{ item.content }}]: {{ item.no }}
          </view>
        </template>
      </easycom-list-container>
    </view>
  </easycom-page-container>
</template>

<script setup lang="ts">
const { listProps: baseListProps } = useListContainer({
  getListData: async (pagination) => {
    return {
      current: pagination.current,
      size: pagination.size,
      total: 100,
      records: Array.from({ length: pagination.size }).map((_, index) => {
        return {
          id: Math.random(),
          no: (pagination.current - 1) * pagination.size + index + 1,
          name: '张三',
        }
      }),
    }
  },
})

interface Condition {
  content?: string
}
const condition = ref<Condition>({})
const conditionItems = computed(() => {
  const items: FormItem<Condition>[] = [
    {
      field: 'content',
      label: '筛选条件',
      type: 'text',
      classNames: {
        item: 'border !border-gray rounded-lg mx-4',
        content: '!text-left',
      },
    },
  ]
  return items
})
const manual = ref(true)
const refresherEnabled = ref(false)

/**
 * 这个示例展示了手动控制列表的刷新时机和返回列表结构不包含 pagination 信息时的处理方式。
 *
 * 通过同时设置 manual 和 refresherEnabled 来控制列表的刷新行为。
 * refresherEnabled 除了使用 ref 手动控制外，还可以使用 computed 计算属性来自动控制。
 * `const refresherEnabled = computed(() => !manual.value)`
 *
 * 对于不包含 pagination 信息的列表数据，需要通过 resolveResponse、hasMoreData 联合处理。
 * 首先通过 resolveResponse 方法，将列表数据转换为标准格式，但此时的 pagination 是丢失的，
 * 不能作为标准程序的逻辑判断，需要通过 hasMoreData 来进行辅助判断。
 *
 * 示例展示了一个简单的判断逻辑，判断列表是否还有更多数据。
 * 实际场景中，需要根据具体的业务逻辑进行处理。例如通过返回列表为空即表示没有更多数据了。
 */
const { queryParams, listProps: controlListProps } = useListContainer({
  manual: manual,
  refresherEnabled: refresherEnabled,
  getListData: async (pagination, params) => {
    return Array.from({ length: pagination.size }).map((_, index) => {
      return {
        id: Math.random(),
        no: (pagination.current - 1) * pagination.size + index + 1,
        name: '张三',
        content: params.content,
      }
    })
  },
  resolveResponse: (response, pagination) => {
    return {
      records: response,
      pagination: pagination,
    }
  },
  hasMoreData(_response, items) {
    return items.length < 100
  },
})

const prepareLoading = ref(false)
const prepareFetchList = async () => {
  if (!condition.value.content) {
    return toastError('请输入筛选条件')
  }
  prepareLoading.value = true
  // 模拟前置准备工作
  await new Promise((resolve) => setTimeout(resolve, 5000))
  prepareLoading.value = false
  // 当前置准备工作完成后，先将 manual 设置为 false，即允许列表组件自动处理列表的刷新与加载。
  // 将 refresherEnabled 设置为 true，允许用户手动下拉列表进行刷新操作。
  manual.value = false
  refresherEnabled.value = true
  // 然后再设置查询参数，当 manual 为 false 时，
  // 修改 queryParams 会自动触发列表的刷新操作，无需手动调用 refresh 方法。
  // 当然也可以不设置 manual.value = false，直接设置查询参数，
  // 然后主动调用 refresh 方法手动触发列表的刷新操作。
  queryParams.value.content = condition.value.content
}
</script>
