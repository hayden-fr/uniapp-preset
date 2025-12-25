<template>
  <view
    role="page-container"
    class="flex h-full flex-col overflow-hidden"
    :class="[classNames?.root]"
    :style="[styles?.root]"
  >
    <view v-if="waiting" class="z-999 absolute h-full w-full">
      <slot name="waiting">
        <view class="h-full w-full" :style="waitingStyles">
          <custom-waiting></custom-waiting>
        </view>
      </slot>
    </view>

    <view v-if="isCustomNavigationBar && showNavigationBar">
      <slot
        name="navigation-bar"
        :show-back-btn="showBackBtn"
        :statusBarHeight="statusBarHeight"
        :navigationBarHeight="navigationBarHeight"
        :height="statusBarHeight + navigationBarHeight"
      >
        <custom-navigation-bar
          :route="route"
          :show-back-btn="showBackBtn"
          :status-bar-height="statusBarHeight"
          :navigation-bar-height="navigationBarHeight"
        ></custom-navigation-bar>
      </slot>
    </view>

    <view
      class="flex-1"
      :class="[
        scrollable ? 'overflow-y-scroll' : 'overflow-hidden',
        classNames?.content,
      ]"
      :style="[styles?.content]"
    >
      <slot></slot>
    </view>

    <view class="w-full">
      <!-- 自定义底部导航栏 -->
      <custom-tabbar
        v-if="isCustomTabbar && route.isTabBar && tabBar"
        :route="route"
        :tabbar="tabBar"
      ></custom-tabbar>

      <!-- 底部安全区 -->
      <view
        v-if="route.isTabBar ? isCustomTabbar : showBottomSafeArea"
        role="safe-bottom"
        class="w-full"
        :style="[{ height: safeBottomHeight + 'px' }]"
      ></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import customNavigationBar from './custom-navigation-bar.vue'
import customTabbar from './custom-tabbar.vue'
import customWaiting from './custom-waiting.vue'

interface Props {
  /**
   * 是否开启滚动
   */
  scrollable?: boolean
  /**
   * 是否显示自定义导航栏，仅使用自定义导航栏时生效
   */
  showNavigationBar?: boolean
  /**
   * 是否显示返回按钮，仅使用自定义导航栏时生效
   */
  showBackBtn?: boolean
  /**
   * 是否设置底部安全距离
   */
  showBottomSafeArea?: boolean
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<SemanticDOM, StyleValue>
}

type SemanticDOM = 'root' | 'content'

withDefaults(defineProps<Props>(), {
  scrollable: false,
  showBackBtn: true,
  showNavigationBar: true,
  showBottomSafeArea: true,
})

const { init } = useInit()

const waiting = ref(true)

onMounted(async () => {
  await init()
  waiting.value = false
})

const { statusBarHeight, navigationBarHeight, safeBottomHeight } =
  usePageContainer()

const { route, tabBar } = useRoute()

const isCustomNavigationBar = computed(() => {
  return route.value.style.navigationStyle === 'custom'
})

const isCustomTabbar = computed(() => {
  return tabBar.value?.custom === true
})

const waitingStyles = computed(() => {
  const style: StyleValue = {
    backgroundColor: route.value.style.navigationBarBackgroundColor,
  }
  return style
})
</script>
