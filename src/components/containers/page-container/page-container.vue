<template>
  <view
    role="page-container"
    class="flex h-full flex-col overflow-hidden"
    :class="[classNames?.root]"
    :style="[styles?.root]"
  >
    <view v-if="isCustomNavigationBar">
      <slot
        name="navigation-bar"
        :statusBarHeight="statusBarHeight"
        :navigationBarHeight="navigationBarHeight"
        :height="statusBarHeight + navigationBarHeight"
      >
        <view
          class="text-base"
          :style="{
            color: route.style.navigationBarTextStyle,
            backgroundColor: route.style.navigationBarBackgroundColor,
          }"
        >
          <view :style="{ height: statusBarHeight + 'px' }"></view>
          <view
            class="relative flex items-center justify-center"
            :style="{ height: navigationBarHeight + 'px' }"
          >
            <view v-if="showBackBtn" class="absolute left-1">
              <view class="flex h-7 w-7 items-center justify-center">
                <view
                  class="i-tabler-chevron-left text-3xl"
                  :style="{ '--un-icon': `url(${backBtnImage})` }"
                  @click="goBack"
                ></view>
              </view>
            </view>
            <view>{{ route.style.navigationBarTitleText }}</view>
          </view>
        </view>
      </slot>
    </view>

    <scroll-view :scroll-y="scrollable" class="flex-1 overflow-hidden">
      <view
        class="flex h-full flex-col"
        :class="[classNames?.content]"
        :style="[styles?.content]"
      >
        <slot></slot>
      </view>
    </scroll-view>

    <view class="w-full">
      <!-- 自定义底部导航栏 -->
      <view v-if="route.isTabBar && tabBar && isCustomTabbar">
        <custom-tabbar :route="route" :tabbar="tabBar"></custom-tabbar>
      </view>

      <!-- 底部安全区 -->
      <view
        v-if="isCustomTabbar || !route.isTabBar"
        role="safe-bottom"
        class="w-full"
        :class="[classNames?.safeBottom]"
        :style="[{ height: safeBottomHeight + 'px' }, styles?.safeBottom]"
      ></view>
    </view>

    <water-mark :content="waterContent"></water-mark>
  </view>
</template>

<script setup lang="ts">
import customTabbar from './custom-tabbar.vue'
import waterMark from './water-mark.vue'

interface Props {
  /**
   * 是否开启滚动
   */
  scrollable?: boolean
  /**
   * 是否开启下拉刷新
   */
  pullToRefresh?: boolean
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<SemanticDOM, StyleValue>
}

type SemanticDOM = 'root' | 'content' | 'safeBottom'

defineProps<Props>()

const { statusBarHeight, navigationBarHeight, safeBottomHeight } =
  usePageContainer()

const { route, tabBar } = useRoute()

const isCustomNavigationBar = computed(() => {
  return route.value.style.navigationStyle === 'custom'
})

const backBtnImage = computed(() => {
  const svg = `
  <svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.781 7.844l-9.063 8.594 9.063 8.594q0.25 0.25 0.25 0.609t-0.25 0.578q-0.25 0.25-0.578 0.25t-0.578-0.25l-9.625-9.125q-0.156-0.125-0.203-0.297t-0.047-0.359q0-0.156 0.047-0.328t0.203-0.297l9.625-9.125q0.25-0.25 0.578-0.25t0.578 0.25q0.25 0.219 0.25 0.578t-0.25 0.578z"
      fill="currentColor"
    ></path>
  </svg>`
  return `data:image/svg+xml;uft8,${encodeURIComponent(svg)}`
})

const showBackBtn = computed(() => {
  return !(route.value.isHomePage || route.value.isTabBar)
})

const goBack = () => {
  uni.navigateBack()
}

const isCustomTabbar = computed(() => {
  return tabBar.value?.custom === true
})

const waterContent = computed(() => {
  // TODO 使用用户
  const date = new Date().toLocaleDateString()
  return `hello world\n${date}`
})

onMounted(() => {
  // #ifdef H5
  if (isCustomTabbar.value && route.value.isTabBar) {
    uni.hideTabBar()
  }
  // #endif
})
</script>
