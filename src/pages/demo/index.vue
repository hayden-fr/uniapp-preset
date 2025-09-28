<template>
  <easycom-page-container :class-names="{ content: 'gap-4 p-4' }">
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
