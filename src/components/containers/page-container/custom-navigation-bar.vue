<template>
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
      <view v-if="showBackButton" class="absolute left-1">
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
</template>

<script setup lang="ts">
interface Props {
  /**
   * 状态栏高度
   */
  statusBarHeight: number
  /**
   * 导航栏高度
   */
  navigationBarHeight: number
  /**
   * 路由信息
   */
  route: UniRoute
  /**
   * 是否显示返回按钮，仅使用自定义导航栏时生效
   */
  showBackBtn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBackBtn: true,
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

const showBackButton = computed(() => {
  return props.showBackBtn && !(props.route.isHomePage || props.route.isTabBar)
})

const goBack = () => {
  uni.navigateBack()
}
</script>
