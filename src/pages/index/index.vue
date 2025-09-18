<template>
  <easycom-page-container :class-names="{ root: 'p-4' }">
    <easycom-button variant="filled" @click="go('/pages/demo/button')">
      按钮
    </easycom-button>
  </easycom-page-container>
</template>

<script setup lang="ts">
const go = (url: string) => {
  uni.navigateTo({
    url,
  })
}
</script>
