/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_BASE_URL: string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module '@/pages.json' {
  const uniAppPagesConfig: UniAppPagesConfig
  export default uniAppPagesConfig
}
