export const useEventChannel = (
  effect?: (eventChannel: UniNamespace.EventChannel) => void,
): UniNamespace.EventChannel => {
  const eventChannel = ref<UniNamespace.EventChannel>()

  onMounted(() => {
    const instance = getCurrentInstance()?.proxy
    eventChannel.value = instance?.getOpenerEventChannel()
    effect?.(eventChannel.value!)
  })

  return {
    emit: (eventName: string, data?: any) => {
      eventChannel.value?.emit(eventName, data)
    },
    on: (eventName: string, callback: (data: any) => void) => {
      eventChannel.value?.on(eventName, callback)
    },
    off: (eventName: string, callback?: (data: any) => void) => {
      eventChannel.value?.off(eventName, callback)
    },
    once: (eventName: string, callback: (data: any) => void) => {
      eventChannel.value?.once(eventName, callback)
    },
  }
}
