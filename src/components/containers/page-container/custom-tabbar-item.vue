<template>
  <view
    class="flex h-full items-center justify-center"
    :style="{ color: active ? selectedColor : color }"
    @click="onTabbarClick"
  >
    <view class="relative flex h-full flex-col items-center justify-center">
      <view v-if="iconPath">
        <image class="h-7 w-7" :src="iconPath" mode="scaleToFill" />
      </view>
      <view :class="[iconPath ? 'text-xs' : '']">{{ text }}</view>
      <view v-if="badge" class="absolute right-0 top-0 text-xs">
        <view
          v-if="isDotBadge"
          class="bg-red h-2 w-2 rounded-full"
          style="transform: translate(100%, 0.5rem)"
        ></view>
        <view
          v-else
          class="bg-red min-w-4 rounded-lg px-1 text-center text-white"
          style="transform: translate(100%, 0.25rem)"
        >
          {{ badge }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  active: boolean
  pagePath: string
  text?: string
  iconPath?: string
  selectedIconPath?: string
  color?: string
  selectedColor?: string
  badge?: boolean | string
}

const props = defineProps<Props>()

const iconPath = computed(() => {
  const defaultIconPath = props.iconPath ? `/${props.iconPath}` : undefined
  const selectedIconPath = props.selectedIconPath
    ? `/${props.selectedIconPath}`
    : defaultIconPath

  return props.active ? selectedIconPath : defaultIconPath
})

const isDotBadge = computed(() => {
  return typeof props.badge === 'boolean'
})

const onTabbarClick = () => {
  if (props.active) return

  uni.switchTab({
    url: `/${props.pagePath}`,
  })
}
</script>
