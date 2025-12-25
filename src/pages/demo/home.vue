<template>
  <easycom-page-container :class-names="{ content: 'flex flex-col gap-4 p-4' }">
    <easycom-button variant="filled" @click="go('/pages/demo/button')">
      按钮
    </easycom-button>
    <easycom-button variant="filled" @click="go('/pages/demo/form')">
      表单
    </easycom-button>
    <easycom-button variant="filled" @click="go('/pages/demo/list')">
      列表
    </easycom-button>
    <easycom-button type="primary" @click="toggleBadge">
      设置角标
    </easycom-button>
  </easycom-page-container>
</template>

<script setup lang="ts">
const go = (url: string) => {
  uni.navigateTo({
    url,
  })
}

const count = ref<boolean | number>(0)

const toggleBadge = () => {
  if (typeof count.value === 'boolean') {
    count.value = 0
    uni.hideTabBarRedDot({ index: 1 })
  } else if (typeof count.value === 'number') {
    count.value++
    if (count.value > 100) {
      count.value = true
      uni.showTabBarRedDot({ index: 1 })
    } else if (count.value > 5) {
      count.value = 100
      uni.setTabBarBadge({ index: 1, text: '99+' })
    } else {
      uni.setTabBarBadge({ index: 1, text: count.value.toString() })
    }
  }
}
</script>
