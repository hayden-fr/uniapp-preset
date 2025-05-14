<template>
  <view class="z-9999 pointer-events-none fixed bottom-0 left-0 right-0 top-0">
    <view class="water-mark-wrapper h-full w-full overflow-hidden">
      <view
        class="-translate-4 flex flex-wrap items-start justify-start opacity-15"
        :style="wrapperContentStyle"
      >
        <view
          v-for="i in count"
          :key="i"
          class="water-mark-item -rotate-30 p-4 text-black"
        >
          <slot>
            <text>{{ content }}</text>
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface Props {
  content?: string
}

const props = defineProps<Props>()

interface Rect {
  width: number
  height: number
}

const count = ref(1)
const wrapperContentStyle = ref<CSSProperties>({})

const instance = getCurrentInstance()

const calculateCount = async () => {
  const query = uni.createSelectorQuery().in(instance)

  const wrapperRect = await new Promise<Rect>((resolve) => {
    query
      .select('.water-mark-wrapper')
      .boundingClientRect((data) => {
        const node = Array.isArray(data) ? data[0] : data
        resolve({ width: node.width ?? 390, height: node.height ?? 844 })
      })
      .exec()
  })

  const itemRect = await new Promise<Rect>((resolve) => {
    query
      .select('.water-mark-item')
      .boundingClientRect((data) => {
        const node = Array.isArray(data) ? data[0] : data
        resolve({ width: node.width ?? 100, height: node.height ?? 100 })
      })
      .exec()
  })

  const itemWidth = itemRect.width ?? 100
  const itemHeight = itemRect.height ?? 100

  const wrapperWidth = wrapperRect.width + itemWidth
  const wrapperHeight = wrapperRect.height + itemHeight

  const countX = Math.ceil(wrapperWidth / itemWidth)
  const countY = Math.ceil(wrapperHeight / itemHeight)

  wrapperContentStyle.value = {
    width: `${wrapperWidth}px`,
    height: `${wrapperHeight}px`,
  }

  count.value = Math.ceil(countX) * Math.ceil(countY)
}

watch(
  () => props.content,
  () => {
    calculateCount()
  },
  // #ifndef H5
  { immediate: true },
  // #endif
)

onMounted(() => {
  // #ifdef H5
  calculateCount()
  // #endif
})
</script>
