<template>
  <view role="custom-tabbar" class="h-13 relative flex w-full bg-white">
    <view class="absolute left-0 top-0 h-px w-full bg-black/20"></view>
    <view v-for="item in tabbar.list" :key="item.pagePath" class="flex-1">
      <custom-tabbar-item
        :active="item.pagePath === route.route"
        :page-path="item.pagePath"
        :text="item.text"
        :color="tabbar.color"
        :selected-color="tabbar.selectedColor"
        :icon-path="item.iconPath"
        :selected-icon-path="item.selectedIconPath"
      >
      </custom-tabbar-item>
    </view>
  </view>
</template>

<script setup lang="ts">
import customTabbarItem from './custom-tabbar-item.vue'

interface Props {
  route: UniRoute
  tabbar: UniTabBar
}

defineProps<Props>()
</script>
