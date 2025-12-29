export const usePageParameters = <T extends AnyObject = AnyObject>(
  callback?: (options: AnyObject) => void,
) => {
  const pageParameters = ref<T>({} as T)

  onLoad((options) => {
    pageParameters.value = options || {}
    callback?.(pageParameters.value)
  })

  return pageParameters
}
