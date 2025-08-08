/// <reference types='@dcloudio/types' />
import 'vue'

declare module '@vue/runtime-core' {
  type Hooks = App.AppInstance & Page.PageInstance

  interface ComponentCustomOptions extends Hooks {}
}

declare global {
  interface EventHandle<T extends AnyObject = AnyObject> {
    type: string
    timeStamp: number
    detail: T
    target: AnyObject
    currentTarget: AnyObject
  }
}
