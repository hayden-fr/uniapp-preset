declare global {
  /**
   * useListContainer 全局类型配置
   *
   * 主要用于自定义分页类型和返回数据结构
   *
   * 默认结构如下
   *
   * @example
   * {
   *   pagination: {
   *     page: number
   *     size: number
   *     total: number
   *   }
   *   response: {
   *     records: Data[]
   *     pagination: Pagination
   *   }
   * }
   */
  interface ListContainerType {}

  interface GlobalConfig {
    // prettier-ignore
    listContainerHook: ListContainerConfig<AnyObject, AnyObject, Pagination, ListResponse>
  }

  /**
   * 列表分页参数配置
   */
  type Pagination = GetValue<ListContainerType, 'pagination', InnerPagination>

  // prettier-ignore
  /**
   * 列表返回数据结构
   */
  type ListResponse<Data extends AnyObject = AnyObject> = GetValue<ListContainerType, 'response', InnenrListResponse<Data>>
}

/**
 * 默认分页参数配置
 */
interface InnerPagination {
  page: number
  size: number
  total: number
}

/**
 * 默认列表返回数据结构
 */
interface InnenrListResponse<Data extends AnyObject = AnyObject> {
  records: Data[]
  pagination: Pagination
}

/**
 * useListContainer 通用配置
 */
interface ListContainerConfig<
  Params extends AnyObject = AnyObject,
  Data extends AnyObject = AnyObject,
  Paging = Pagination,
  Response = ListResponse<Data>,
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
   * 解析分页信息
   */
  resolvePagination?: (paginaiton: InnerPagination) => Paging
  /**
   * 解析返回数据
   */
  resolveResponse?: (
    response: Response,
    paginaiton: Paging,
    requestParams: Params,
  ) => InnenrListResponse<Data>
  /**
   * 判断是否还有更多数据
   */
  hasMoreData?: (response: InnenrListResponse<Data>, items: Data[]) => boolean
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
}

interface ListContainerOptions<
  Params extends AnyObject = AnyObject,
  Data extends AnyObject = AnyObject,
  Paging = Pagination,
  Reponse = ListResponse<Data>,
> extends ListContainerConfig<Params, Data, Paging, Reponse> {
  /**
   * 刷新时遮罩层显示文字，设置 false 则不显示遮罩层
   */
  loadingMask?: MaybeRefOrGetter<false | string>
  /**
   * 获取列表数据
   */
  getListData: (pagination: Paging, params: Params) => Promise<Reponse>
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
  Params extends AnyObject = AnyObject,
  Data extends AnyObject = AnyObject,
  Paging = Pagination,
  Response = ListResponse<Data>,
>(
  options: ListContainerOptions<Params, Data, Paging, Response>,
) => {
  const config = useConfig('listContainerHook', {
    defaultPageSize: 10,
    defaultQueryParams: {},
    loadingMask: '加载中...',
    resolvePagination: (pagination) => pagination as unknown as Pagination,
    resolveResponse: (response) => response as unknown as InnenrListResponse,
    hasMoreData: (response, items) => {
      const total = response.pagination.total
      const currentCount = items.length
      return currentCount < total
    },
  })

  const mergedConfig = computed(() => {
    return _.defaultsDeep({}, options, config) as typeof options & typeof config
  })

  const {
    manual,
    refresherEnabled,
    loadingMask,
    defaultPageSize,
    defaultQueryParams,
    getListData,
    resolvePagination,
    resolveResponse,
    hasMoreData,
  } = mergedConfig.value

  const items = ref<Data[]>([] as Data[])
  const queryParams = ref<Params>(_.cloneDeep(defaultQueryParams))
  const pagination = ref<InnerPagination>({
    page: 1,
    size: defaultPageSize,
    total: 0,
  })

  const refresherTriggered = ref(false)
  const loadMoreTriggered = ref(false)
  const noMoreTriggered = ref(false)
  const scrollTop = ref(0)

  const resolveNoMoreTriggered = (response: InnenrListResponse<Data>) => {
    noMoreTriggered.value = !hasMoreData(response, items.value)
  }

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
      pagination.value.page = 1
      // 解析分页参数
      const paging = resolvePagination(_.cloneDeep(pagination.value)) as Paging
      // 构建请求参数
      const requestParams = _.cloneDeep(queryParams.value)
      // 获取列表数据
      const response = await getListData(paging, requestParams)
      // 解析返回数据
      const resolvedResponse = resolveResponse(response, paging, requestParams)

      items.value = resolvedResponse.records
      pagination.value.total = resolvedResponse.pagination.total
      resolveNoMoreTriggered(resolvedResponse)

      await options.onRefresh?.(e)
      uni.hideLoading()
    } catch (error) {
      items.value = []
      pagination.value.total = 0
      noMoreTriggered.value = true
      toastError(error)
      logging.error(error)
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

      pagination.value.page++
      // 解析分页参数
      const paging = resolvePagination(_.cloneDeep(pagination.value)) as Paging
      // 构建请求参数
      const requestParams = _.cloneDeep(queryParams.value)
      // 获取列表数据
      const response = await getListData(paging, requestParams)
      // 解析返回数据
      const resolvedResponse = resolveResponse(response, paging, requestParams)

      items.value = [...items.value, ...resolvedResponse.records] as Data[]
      pagination.value.total = resolvedResponse.pagination.total
      resolveNoMoreTriggered(resolvedResponse)

      await options.onLoadMore?.(e)
    } catch (error) {
      pagination.value.page--
      toastError(error)
      logging.error(error)
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
