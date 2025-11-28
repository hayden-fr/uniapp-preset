declare global {
  interface UniGlobalStoreValue {}
}

type StoreValue = Partial<UniGlobalStoreValue>

const store = ref<StoreValue>({})

declare module 'vue' {
  interface ComponentCustomProperties {
    readonly $store: StoreValue
  }
}

export interface StoreOptions {
  /**
   * store 更新时触发
   */
  onUpdate?: (
    value: StoreValue,
    oldValue: StoreValue,
    onCleanup: (cleanupFn: () => void) => void,
  ) => void
}

class Store {
  install(app: VueApp, options?: StoreOptions) {
    const callback = options?.onUpdate ?? (() => {})
    let lastStoreValue: StoreValue = _.cloneDeep(toRaw(store.value))
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

export function useStore() {
  return store
}
