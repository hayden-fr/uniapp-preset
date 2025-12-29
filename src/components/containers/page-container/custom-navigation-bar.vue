<template>
  <view :class="containerClassNames" :style="containerStyles">
    <view :style="{ height: statusBarHeight + 'px' }"></view>
    <view
      class="relative flex items-center justify-center"
      :style="{ height: navigationBarHeight + 'px' }"
    >
      <view v-if="showBackBtn" class="absolute left-1">
        <view class="flex h-7 w-7 items-center justify-center">
          <view
            class="i-tabler-chevron-left text-3xl"
            :style="{ '--un-icon': `url(${backBtnImage})` }"
            @click="goBack"
          ></view>
        </view>
      </view>
      <view>
        <slot>{{ title }}</slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
type SemanticDOM = 'root'

interface Props {
  /**
   * 是否显示返回按钮，仅使用自定义导航栏时生效
   */
  showBackBtn?: boolean
  /**
   * 标题
   */
  title?: string
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<SemanticDOM, StyleValue>
}

const props = withDefaults(defineProps<Props>(), {
  showBackBtn: true,
})

const backBtnImage = computed(() => {
  const svg = `
  <svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.781 7.844l-9.063 8.594 9.063 8.594q0.25 0.25 0.25 0.609t-0.25 0.578q-0.25 0.25-0.578 0.25t-0.578-0.25l-9.625-9.125q-0.156-0.125-0.203-0.297t-0.047-0.359q0-0.156 0.047-0.328t0.203-0.297l9.625-9.125q0.25-0.25 0.578-0.25t0.578 0.25q0.25 0.219 0.25 0.578t-0.25 0.578z"
      fill="currentColor"
    ></path>
  </svg>`
  return `data:image/svg+xml;uft8,${encodeURIComponent(svg)}`
})

const { statusBarHeight, navigationBarHeight } = usePageContainer()

const containerClassNames = computed(() => {
  const classNames: ClassNameValue = ['text-base']
  if (props.classNames?.root) {
    classNames.push(props.classNames.root)
  }
  return classNames
})

const containerStyles = computed(() => {
  const styles: StyleValue = []
  if (props.styles?.root) {
    styles.push(props.styles.root)
  }
  return styles
})

const goBack = () => {
  uni.navigateBack()
}
</script>
