declare global {
  /**
   * useListContainer 全局类型配置
   *
   * 主要用于自定义分页类型和数据返回结构
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DefineListContainerType<Data extends AnyObject = AnyObject> {}

  interface GlobalConfig {
    // prettier-ignore
    listContainerHook: ListContainerConfig<AnyObject, AnyObject, Pagination, ListResponse>
  }

  /**
   * 列表分页参数配置
   */
  // prettier-ignore
  type Pagination = GetValue<DefineListContainerType, 'pagination', InnerPagination>

  /**
   * 列表数据返回结构
   */
  // prettier-ignore
  type ListResponse<Data extends AnyObject = AnyObject> = GetValue<DefineListContainerType<Data>, 'response', InnerListResponse<Data>>
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
interface InnerListResponse<Data extends AnyObject = AnyObject> {
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
  resolvePagination?: (pagination: InnerPagination) => Paging
  /**
   * 解析返回数据
   */
  resolveResponse?: (
    response: Response,
    paginaiton: Paging,
    requestParams: Params,
  ) => InnerListResponse<Data>
  /**
   * 判断是否还有更多数据
   */
  hasMoreData?: (response: InnerListResponse<Data>, items: Data[]) => boolean
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
  Response = ListResponse<Data>,
> extends ListContainerConfig<Params, Data, Paging, Response> {
  /**
   * 刷新时遮罩层显示文字，设置 false 则不显示遮罩层
   */
  loadingMask?: MaybeRefOrGetter<false | string>
  /**
   * 获取列表数据
   */
  getListData: (pagination: Paging, params: Params) => Promise<Response>
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
  onLoadMore?: (e?: UniEvent) => void | Promise<void>
}

export function useListContainer<
  Params extends AnyObject,
  Data extends AnyObject,
  Paging = Pagination,
  Response = ListResponse<Data>,
>(
  options:
    | Omit<
        ListContainerOptions<Params, Data, Paging, ListResponse<Data>>,
        'resolveResponse'
      >
    | RequiredByKeys<
        ListContainerOptions<Params, Data, Paging, Response>,
        'resolveResponse'
      >,
) {
  const config = useConfig('listContainerHook', {
    defaultPageSize: 10,
    defaultQueryParams: {},
    loadingMask: '加载中...',
    resolvePagination: (pagination) => {
      return pagination as unknown as Pagination
    },
    resolveResponse: (response) => {
      return response as unknown as InnerListResponse<Data>
    },
    hasMoreData: (response, items) => {
      const total = response.pagination.total
      const currentCount = items.length
      return currentCount < total
    },
  })

  type Options = RequiredByKeys<
    ListContainerOptions<Params, Data, Paging, Response>,
    RequiredKeys<typeof config>
  >

  const mergedConfig = computed<Options>(() => {
    return _.defaultsDeep({}, options, config)
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

  const resolveNoMoreTriggered = (response: InnerListResponse<Data>) => {
    noMoreTriggered.value = !hasMoreData(response, items.value as Data[])
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
      const paging = resolvePagination(_.cloneDeep(pagination.value))
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

  const loadMore = async (e?: UniEvent) => {
    try {
      if (loadMoreTriggered.value) return
      if (noMoreTriggered.value) return

      loadMoreTriggered.value = true

      pagination.value.page++
      // 解析分页参数
      const paging = resolvePagination(_.cloneDeep(pagination.value))
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
    refresherTriggered,
    refresh,
    loadMoreTriggered,
    noMoreTriggered,
    loadMore,
    listProps,
    queryParams,
  }
}
