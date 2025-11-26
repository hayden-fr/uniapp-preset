<template>
  <easycom-page-container :show-navigation-bar="false">
    <view
      class="to-#5dccfd from-#5d7afa -rotate-5 absolute bg-gradient-to-r"
      style="width: 120%; height: 50%; left: -10%; top: -10%"
    ></view>

    <view class="relative">
      <view
        class="px-8 pb-6 text-white"
        :style="{ paddingTop: navigationHeight + 'px' }"
      >
        <view class="text-3xl font-black">LOGO</view>
        <view class="mt-2 text-2xl">Hi, Welcome</view>
      </view>

      <view class="px-8">
        <view class="overflow-hidden rounded-2xl bg-white pt-4 shadow-2xl">
          <easycom-form-container
            :model-value="loginParams"
            :items="loginItems"
            label-position="top"
            :disabled="loading"
            :class-names="{
              required: 'hidden',
            }"
          ></easycom-form-container>

          <view class="px-4 py-4 uppercase">
            <easycom-button
              type="primary"
              shape="circle"
              :loading="loading"
              @click="handleLogin"
            >
              login
            </easycom-button>
          </view>
        </view>
      </view>
    </view>
  </easycom-page-container>
</template>

<script setup lang="ts">
const { navigationHeight } = usePageContainer()

const store = useStore()

const redirect = ref<string>()
const loading = ref(false)

interface LoginParams {
  username?: string
  password?: string
}

const loginParams = ref<LoginParams>({})

const loginItems = computed(() => {
  const items: FormItem<LoginParams>[] = [
    {
      field: 'username',
      label: '用户名',
      type: 'text',
      placeholder: '请输入用户名',
      rules: [{ required: true, message: '请输入用户名' }],
    },
    {
      field: 'password',
      label: '密码',
      type: 'password',
      placeholder: '请输入密码',
      showVisible: true,
      rules: [{ required: true, message: '请输入密码' }],
    },
  ]

  return items
})

const loginForm = useFormContainer({
  data: loginParams,
  items: loginItems,
})

const handleLogin = async () => {
  try {
    loading.value = true
    await loginForm.validate('form-item')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    store.value.accessToken = 'demo_token'
    const redirectTo = toValue(redirect)
    console.log({ redirectTo })
    if (redirectTo) {
      uni.redirectTo({ url: decodeURIComponent(redirectTo) })
    } else {
      uni.switchTab({ url: '/pages/demo/index' })
    }
  } catch (error) {
    toastError(error)
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  console.log(options)
  redirect.value = options?.redirect
})
</script>
