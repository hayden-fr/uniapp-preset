export const usePageContainer = () => {
  const windowInfo = computed(() => {
    return uni.getWindowInfo()
  })
  const statusBarHeight = computed(() => {
    const statusBarHeight = windowInfo.value.statusBarHeight
    return statusBarHeight ?? 0
  })

  const navigationBarHeight = computed(() => {
    return 44
  })

  const navigationHeight = computed(() => {
    return statusBarHeight.value + navigationBarHeight.value
  })

  const safeBottomHeight = computed(() => {
    const safeArea = windowInfo.value.safeAreaInsets
    return safeArea?.bottom ?? 0
  })

  return {
    statusBarHeight,
    navigationBarHeight,
    navigationHeight,
    safeBottomHeight,
  }
}
