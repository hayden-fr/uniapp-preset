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
  </easycom-page-container>
</template>

<script setup lang="ts">
const go = (url: string) => {
  uni.navigateTo({
    url,
  })
}
</script>
