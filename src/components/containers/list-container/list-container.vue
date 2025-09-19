<template>
  <view class="h-full w-full" :class="classNames?.root" :style="styles?.root">
    <scroll-view
      class="h-full w-full"
      :scroll-y="true"
      :scroll-top="scrollTop"
      :lower-threshold="lowerThreshold"
      :refresher-enabled="true"
      :refresher-threshold="refresherThreshold"
      :refresher-triggered="refresherTriggered"
      :refresher-background="refresherBackground"
      @refresherrefresh="refresh"
      @scrolltolower="loadMore"
      @scroll="onScroll"
    >
      <view
        class="flex h-full flex-col gap-4"
        :class="classNames?.content"
        :style="styles?.content"
      >
        <view
          v-for="(item, index) in items"
          :key="item[rowKey]"
          :class="classNames?.item"
          :style="styles?.item"
        >
          <slot name="item" :item="item" :index="index"></slot>
        </view>

        <view
          v-show="items.length === 0"
          class="relative flex h-full justify-center"
        >
          <view class="absolute top-1/4 text-gray-500">
            <slot name="empty">
              <view class="flex flex-col items-center justify-center gap-4">
                <view class="i-tabler-alert-circle mx-auto text-5xl"></view>
                <view class="">暂无数据</view>
              </view>
            </slot>
          </view>
        </view>

        <view v-show="items.length > 0" class="flex-1 text-gray-500">
          <view v-show="loadMoreTriggered" class="h-full pb-4 text-center">
            <text>加载中...</text>
          </view>
          <view
            v-show="!loadMoreTriggered"
            class="h-full pb-4 text-center"
            :class="noMoreTriggered ? '' : 'box-content'"
          >
            <text>{{ noMoreTriggered ? noMoreContent : loadMoreContent }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts" generic="Data extends AnyObject">
interface Props {
  /**
   * 数据源
   */
  items?: Data[]
  /**
   * 列表项的 key
   */
  rowKey?: string
  /**
   * 列表滚动到底部的时候触发的距离阈值
   */
  lowerThreshold?: number | string
  /**
   * 设置竖向滚动条位置
   */
  scrollTop?: number | string
  /**
   * 下拉刷新触发的距离阈值
   */
  refresherThreshold?: number
  /**
   * 下拉刷新背景颜色
   */
  refresherBackground?: string
  /**
   * 下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
   */
  refresherTriggered?: boolean
  /**
   * 触发下拉刷新
   */
  refresh?: () => Promise<void>
  /**
   * 加载更多状态
   */
  loadMoreTriggered?: boolean
  /**
   * 没有更多数据的状态
   */
  noMoreTriggered?: boolean
  /**
   * 自定义没有更多数据时的显示内容
   */
  noMoreContent?: string
  /**
   * 自定义加载更多数据时的显示内容
   */
  loadMoreContent?: string
  /**
   * 触发加载更多
   */
  loadMore?: () => Promise<void>
  /**
   * 滚动事件
   */
  onScroll?: (e: EventHandle) => void | Promise<void>
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<SemanticDOM, StyleValue>
}

type SemanticDOM = 'root' | 'content' | 'item'

withDefaults(defineProps<Props>(), {
  items: () => [],
  rowKey: 'id',
  refresherBackground: 'transparent',
  noMoreContent: '-- 没有更多了 --',
  loadMoreContent: '上拉加载更多',
})

defineOptions({
  inheritAttrs: false,
})
</script>
