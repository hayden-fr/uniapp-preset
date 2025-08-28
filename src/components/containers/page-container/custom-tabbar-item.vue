<template>
  <view
    class="flex h-full flex-col items-center justify-center"
    :style="{ color: active ? selectedColor : color }"
    @click="onTabbarClick"
  >
    <view v-if="iconPath">
      <image class="h-7 w-7" :src="iconPath" mode="scaleToFill" />
    </view>
    <view :class="[iconPath ? 'text-xs' : '']">{{ text }}</view>
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
}

const props = defineProps<Props>()

const iconPath = computed(() => {
  const defaultIconPath = props.iconPath ? `/${props.iconPath}` : undefined
  const selectedIconPath = props.selectedIconPath
    ? `/${props.selectedIconPath}`
    : defaultIconPath

  return props.active ? selectedIconPath : defaultIconPath
})

const onTabbarClick = () => {
  if (props.active) return

  uni.switchTab({
    url: `/${props.pagePath}`,
  })
}
</script>
