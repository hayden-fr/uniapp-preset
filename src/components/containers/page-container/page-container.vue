<template>
  <view
    role="page-container"
    class="flex h-full flex-col overflow-hidden"
    :style="{ backgroundColor }"
  >
    <scroll-view :scroll-y="scrollable" class="flex-1 overflow-hidden">
      <view class="flex flex-col overflow-hidden">
        <slot></slot>
      </view>
    </scroll-view>

    <view
      role="safe-bottom"
      class="w-full"
      :style="{ height: safeBottomHeight + 'rpx' }"
    ></view>

    <water-mark :content="waterContent"></water-mark>
  </view>
</template>

<script setup lang="ts">
import waterMark from './water-mark.vue'

interface Props {
  scrollable?: boolean
  pullToRefresh?: boolean
  backgroundColor?: string
}

defineProps<Props>()

const waterContent = computed(() => {
  // TODO 使用用户
  const date = new Date().toLocaleDateString()
  return `hello world\n${date}`
})

const safeBottomHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  const safeArea = systemInfo.safeAreaInsets
  if (safeArea) {
    safeBottomHeight.value = safeArea.bottom
  }
})
</script>
