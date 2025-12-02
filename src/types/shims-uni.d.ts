/// <reference types='@dcloudio/types' />
import 'vue'

declare module '@vue/runtime-core' {
  type Hooks = App.AppInstance & Page.PageInstance

  interface ComponentCustomOptions extends Hooks {}
}

declare module 'vue' {
  interface ComponentCustomProperties {
    getOpenerEventChannel: () => UniNamespace.EventChannel
  }
}

declare global {
  type HexColor = `#${string}`

  interface UniPageStyle {
    navigationBarBackgroundColor?: HexColor
    navigationBarTextStyle?: string
    navigationBarTitleText?: string
    navigationStyle?: 'default' | 'custom'
    backgroundTextStyle?: 'dark' | 'light'
    enablePullDownRefresh?: boolean
    onReachBottomDistance?: number
  }

  interface UniPage {
    path: string
    needLogin?: boolean
    style?: UniPageStyle
  }

  interface UniTabBarItem {
    pagePath: string
    text: string
    iconPath?: string
    selectedIconPath?: string
    badge?: boolean | string
  }

  interface UniTabBar {
    custom?: boolean
    color: string
    selectedColor: string
    list: UniTabBarItem[]
  }

  interface UniEasycom {
    autoscan?: boolean
    custom?: Record<string, string>
  }

  interface UniIdRouter {
    loginPage: string
    needLogin: string[]
  }

  interface UniAppPagesConfig {
    globalStyle?: UniPageStyle
    pages?: UniPage[]
    easycom?: UniEasycom
    tabBar?: UniTabBar
    uniIdRouter?: UniIdRouter
  }

  interface EventHandle<T extends AnyObject = AnyObject> {
    type: string
    timeStamp: number
    detail: T
    target: AnyObject
    currentTarget: AnyObject
  }
}
