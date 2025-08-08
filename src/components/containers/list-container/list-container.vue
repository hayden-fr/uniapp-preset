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
  items?: Data[]
  rowKey?: string
  lowerThreshold?: number | string
  scrollTop?: number | string
  refresherThreshold?: number
  refresherBackground?: string
  refresherTriggered?: boolean
  refresh?: () => Promise<void>
  loadMoreTriggered?: boolean
  noMoreTriggered?: boolean
  noMoreContent?: string
  loadMoreContent?: string
  loadMore?: () => Promise<void>
  onScroll?: (e: EventHandle) => void | Promise<void>
  classNames?: Semantic<SemanticDOM, ClassNameValue>
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
