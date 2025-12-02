declare global {
  interface UniGlobalStoreValue {}
}

const storeRef = ref()

declare module 'vue' {
  interface ComponentCustomProperties {
    readonly $store: UniGlobalStoreValue
  }
}

export interface StoreOptions {
  /**
   * 初始值
   */
  initialValue?: UniGlobalStoreValue | (() => UniGlobalStoreValue)
  /**
   * store 更新时触发
   */
  onUpdate?: (
    value: UniGlobalStoreValue,
    oldValue: UniGlobalStoreValue,
    onCleanup: (cleanupFn: () => void) => void,
  ) => void
}

class Store {
  install(app: VueApp, options?: StoreOptions) {
    const initialValue =
      typeof options?.initialValue === 'function'
        ? options.initialValue()
        : (options?.initialValue ?? ({} as UniGlobalStoreValue))

    const store = ref<UniGlobalStoreValue>(initialValue)
    storeRef.value = store

    const callback = options?.onUpdate ?? (() => {})
    let lastStoreValue: UniGlobalStoreValue = _.cloneDeep(toRaw(store.value))
    watch(
      store,
      (value, oldValue, onCleanup) => {
        const currentValue = _.cloneDeep(toRaw(value))
        callback(currentValue, _.cloneDeep(lastStoreValue), onCleanup)
        lastStoreValue = currentValue
      },
      { deep: true },
    )

    Object.defineProperty(app.config.globalProperties, '$store', {
      get() {
        return store.value
      },
      enumerable: true,
      configurable: false,
    })
  }
}

export function createStore() {
  return new Store()
}

export function useStore(): Ref<UniGlobalStoreValue> {
  return toValue(storeRef)
}
