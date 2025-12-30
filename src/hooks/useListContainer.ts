interface ListContainerOptions<
  Params extends AnyObject,
  Data extends AnyObject,
> {
  /**
   * 是否手动触发请求
   *
   * 设置为 true 后，不会默认执行，修改 queryParams 也不会自动触发刷新操作。
   *
   * @default false
   */
  manual?: MaybeRefOrGetter<boolean>
  /**
   * ListContainer 组件的透传选项，是否启用下拉刷新
   */
  refresherEnabled?: MaybeRefOrGetter<boolean>
  /**
   * 默认查询参数
   */
  defaultQueryParams?: Params
  /**
   * 默认分页参数
   */
  defaultPageSize?: number
  /**
   * 刷新时遮罩层显示文字，设置 false 则不显示遮罩层
   */
  loadingMask?: MaybeRefOrGetter<false | string>
  /**
   * 获取列表数据
   */
  getListData: (
    pagination: Pagination,
    params: Params,
  ) => Promise<ListStructure<Data>>
  /**
   * 列表项的 key
   */
  rowKey?: MaybeRefOrGetter<string>
  /**
   * 列表滚动到底部的时候触发的距离阈值
   */
  lowerThreshold?: MaybeRefOrGetter<number | string>
  /**
   * 下拉刷新触发的距离阈值
   */
  refresherThreshold?: MaybeRefOrGetter<number>
  /**
   * 下拉刷新背景颜色
   */
  refresherBackground?: MaybeRefOrGetter<string>
  /**
   * 自定义没有更多数据时的显示内容
   */
  noMoreContent?: MaybeRefOrGetter<string>
  /**
   * 自定义加载更多数据时的显示内容
   */
  loadMoreContent?: MaybeRefOrGetter<string>
  /**
   * 滚动时回调
   */
  onScroll?: (e: UniEvent) => void | Promise<void>
  /**
   * 下拉刷新后回调
   */
  onRefresh?: (e?: UniEvent) => void | Promise<void>
  /**
   * 加载更多数据后回调
   */
  onLoadMore?: (e: UniEvent) => void | Promise<void>
}

export const useListContainer = <
  Params extends AnyObject,
  Data extends AnyObject,
>(
  options: ListContainerOptions<Params, Data>,
) => {
  const {
    manual,
    refresherEnabled,
    defaultQueryParams,
    defaultPageSize = 10,
    loadingMask = '加载中...',
    getListData,
  } = options

  const items = ref<Data[]>([])
  const queryParams = ref<Params>(
    _.cloneDeep(defaultQueryParams ?? {}) as Params,
  )
  const pagination = ref<Pagination>({
    current: 1,
    size: defaultPageSize,
    total: 0,
  })

  const refresherTriggered = ref(false)
  const loadMoreTriggered = ref(false)
  const noMoreTriggered = ref(false)
  const scrollTop = ref(0)

  const refresh = async (e?: UniEvent) => {
    try {
      if (refresherTriggered.value) return

      const content = toValue(loadingMask)
      if (content) {
        uni.showLoading({
          title: content,
          mask: true,
        })
      }

      if (e?.type === 'refresherrefresh') {
        refresherTriggered.value = true
      }
      pagination.value.current = 1

      const response = await getListData(
        toValue(pagination),
        toValue(queryParams),
      )

      items.value = response.records
      pagination.value.total = response.total
      noMoreTriggered.value = items.value.length >= pagination.value.total

      await options.onRefresh?.(e)
      uni.hideLoading()
    } catch (error) {
      items.value = []
      pagination.value.total = 0
      noMoreTriggered.value = true
      toastError(error)
    } finally {
      scrollTop.value = 0
      refresherTriggered.value = false
    }
  }

  const loadMore = async (e: UniEvent) => {
    try {
      if (loadMoreTriggered.value) return
      if (noMoreTriggered.value) return

      loadMoreTriggered.value = true
      pagination.value.current++

      const response = await getListData(
        toValue(pagination),
        toValue(queryParams),
      )

      items.value = [...items.value, ...response.records] as Data[]
      pagination.value.total = response.total
      noMoreTriggered.value = items.value.length >= pagination.value.total

      await options.onLoadMore?.(e)
    } catch (error) {
      pagination.value.current--
      toastError(error)
    } finally {
      loadMoreTriggered.value = false
    }
  }

  const onScroll = _.debounce((e: UniEvent) => {
    scrollTop.value = e.detail.scrollTop
    options.onScroll?.(e)
  }, 200)

  watch(
    queryParams,
    () => {
      if (!toValue(manual)) {
        refresh()
      }
    },
    {
      immediate: true,
      deep: true,
    },
  )

  const listProps = computed(() => {
    return {
      items: toValue(items),
      scrollTop: toValue(scrollTop),
      refresherEnabled: toValue(refresherEnabled),
      refresherTriggered: toValue(refresherTriggered),
      refresh: refresh,
      loadMoreTriggered: toValue(loadMoreTriggered),
      noMoreTriggered: toValue(noMoreTriggered),
      loadMore: loadMore,
      onScroll: onScroll,
      rowKey: toValue(options.rowKey),
      lowerThreshold: toValue(options.lowerThreshold),
      refresherThreshold: toValue(options.refresherThreshold),
      refresherBackground: toValue(options.refresherBackground),
      noMoreContent: toValue(options.noMoreContent),
      loadMoreContent: toValue(options.loadMoreContent),
    }
  })

  return {
    items,
    scrollTop,
    refresherEnabled,
    refresherTriggered,
    refresh,
    loadMoreTriggered,
    noMoreTriggered,
    loadMore,
    onScroll,
    listProps,
    queryParams,
  }
}
