export const usePageContainer = () => {
  const systemInfo = computed(() => {
    return uni.getSystemInfoSync()
  })
  const statusBarHeight = computed(() => {
    const statusBarHeight = systemInfo.value.statusBarHeight
    return statusBarHeight ?? 0
  })

  const navigationBarHeight = computed(() => {
    return 44
  })

  const navigationHeight = computed(() => {
    return statusBarHeight.value + navigationBarHeight.value
  })

  const safeBottomHeight = computed(() => {
    const safeArea = systemInfo.value.safeAreaInsets
    return safeArea?.bottom ?? 0
  })

  return {
    statusBarHeight,
    navigationBarHeight,
    navigationHeight,
    safeBottomHeight,
  }
}
