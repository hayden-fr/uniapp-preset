<template>
  <template></template>
</template>

<script setup lang="ts">
declare global {
  interface FieldItem {
    /**
     * 定义一个空类型，用于表示一个空字段或者自定义字段
     *
     * @alias custom
     */
    emtpty: Record<string, any>
    custom: Record<string, any>
  }
}
</script>
