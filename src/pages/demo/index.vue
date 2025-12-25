<template>
  <easycom-page-container
    :show-navigation-bar="false"
    :class-names="{ root: 'bg-primary text-white' }"
  >
    <template #waiting>
      <view class="w-vw h-vh flex items-center justify-center">
        <view class="i-tabler-flame-filled text-4xl"></view>
      </view>
    </template>
  </easycom-page-container>
</template>

<script setup lang="ts"></script>
