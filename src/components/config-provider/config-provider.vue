<template>
  <slot></slot>
</template>

<script setup lang="ts">
interface ConfigProviderOptions {
  config: GlobalConfig
}
const props = defineProps<ConfigProviderOptions>()
useConfig(props.config)
</script>
