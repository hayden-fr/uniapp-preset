<template>
  <easycom-page-container :show-navigation-bar="false">
    <view
      class="from-#6253e1 to-#04befe rounded-b-2xl bg-gradient-to-r text-white"
      :style="{ paddingTop: statusBarHeight + 'px' }"
    >
      <view
        class="flex items-center justify-center"
        :style="{ height: navigationBarHeight + 'px' }"
      >
        个人中心
      </view>
      <view class="flex gap-4 px-6 py-4">
        <view
          class="h-20 w-20 rounded-full border-2 border-white/50 bg-white/20"
        ></view>
        <view class="flex flex-col justify-center gap-2">
          <view class="text-lg font-semibold">UniApp</view>
          <view class="text-sm font-light">188****0000</view>
        </view>
      </view>

      <view class="h-12"></view>
    </view>

    <view class="-mt-10 px-4">
      <view class="flex justify-between rounded-lg bg-white px-4 shadow">
        <view
          v-for="item in 4"
          :key="item"
          class="flex flex-col items-center gap-1 py-4"
        >
          <view
            class="i-tabler-brand-github-filled text-primary text-2xl"
          ></view>
          <view class="">GitHub</view>
        </view>
      </view>
    </view>

    <view class="mt-4 px-4">
      <view class="rounded-xl border">
        <view
          v-for="item in 6"
          :key="item"
          class="flex items-center justify-between border-b p-4 last:border-0"
        >
          <view class="flex items-center gap-2">
            <view class="i-tabler-ad text-primary text-2xl"></view>
            <view class="">ITEM</view>
          </view>
          <view class="i-tabler-chevron-right text-gray text-2xl"></view>
        </view>
      </view>
    </view>

    <view class="mt-6 px-4">
      <easycom-button type="primary" shape="circle" @click="handleLogout">
        退出
      </easycom-button>
    </view>
  </easycom-page-container>
</template>

<script setup lang="ts">
const { statusBarHeight, navigationBarHeight } = usePageContainer()

const store = useStore()

const handleLogout = async () => {
  const { confirm } = await toastConfirm('确定要退出吗？')
  if (confirm) {
    store.value.accessToken = undefined
  }
}

onMounted(() => {
  request.get({
    url: '/api/user',
  })
})

useListContainer({
  getListData: async (): Promise<any> => {
    return request.get<any>({
      url: '/api/list',
    })
  },
})
</script>
