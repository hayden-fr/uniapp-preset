<template>
  <view
    class="flex h-full items-center justify-center"
    :style="{ color: active ? selectedColor : color }"
    @click="onTabbarClick"
  >
    <view class="relative flex h-full flex-col items-center justify-center">
      <view v-if="iconfont" class="tabbar_iconfont" :style="iconfontStyle">
        <view v-if="iconfont.length === 1" class="text-6">{{ iconfont }}</view>
        <view v-else :class="iconfont" class="text-6"></view>
      </view>
      <view v-else-if="iconPath">
        <image class="block h-6 w-6" :src="iconPath" mode="scaleToFill" />
      </view>
      <view :class="[iconfont || iconPath ? 'text-xs' : '']">{{ text }}</view>
      <view v-if="badge" class="absolute right-0 top-0 text-xs">
        <view
          v-if="isDotBadge"
          class="bg-red h-2 w-2 rounded-full"
          style="transform: translate(100%, 0.5rem)"
        ></view>
        <view
          v-else
          class="bg-red min-w-4 rounded-lg px-1 text-center text-white"
          style="transform: translate(100%, 0.25rem)"
        >
          {{ badge }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  active: boolean
  pagePath: string
  text?: string
  iconfont?: UniTabBarItemIconFont
  iconPath?: string
  selectedIconPath?: string
  color?: string
  selectedColor?: string
  badge?: boolean | string
}

const props = defineProps<Props>()

/**
 * 使用字体图标，比图片图标更加灵活，
 * `pages.json` 配置 `tabBar.list[index].iconfont.text` 生效。
 *
 * 有两种配置方案，
 * 第一种是使用 Unicode 字符，也是 uniapp 官方的默认方式；
 * 第二种是使用 CSS 类名，这种方式更加灵活。
 *
 * ## Unicode 字符
 *
 * 1. 配置并下载 iconfont 字体
 *
 * 不推荐使用 `tabBar.iconfontSrc` 进行配置，因为这个只针对 `App` 和 `web` 端生效，
 * 推荐在 `App.vue` 或者其他全局样式文件中手动引入，设置 `@font-face`，
 * 将 `font-family` 设置为 `UniTabbarIconFont`。
 *
 * 示例代码如下：
 *
 * ```css
 * @font-face {
 *   font-family: UniTabbarIconFont;
 *   src: url('/static/iconfont/iconfont.ttf'); // 这里要替换成实际的文件地址
 * }
 * ```
 *
 * 2. 配置字符图标
 *
 * 复制 iconfont 图标的 Unicode 码填写至 `tabBar.list[index].iconfont.text` 中。
 *
 * 注意：iconfont 的 Unicode 码是 HTML 中的实体转义写法，而 `pages.json` 配置是先
 * 读取到 js 中，所以需要使用 JavaScript 的转义写法，即以 `\u` 开头。
 *
 * Tips:
 * &#xe601  -->  HTML实体
 * \ue601   -->  JavaScript|通用转义
 * \e601    -->  CSS专用
 *
 * 示例代码:
 *
 * ```page.json
 * {
 *   "tabBar": {
 *     "list": [
 *       {
 *         "iconfont": {
 *           "text": "\ue601"
 *         }
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * ## CSS 类名
 *
 * CSS 类名的配置方式比 Unicode 字符更加便捷，只需要传入类名即可，
 * 具体的配置和使用方式和 CSS 图标的实现方式有关，基本上大同小异。
 * 其本质是将 `text` 的内容当作 CSS 类名传递给 Dom ，并通过 CSS 实现图标渲染。
 *
 * 下面列举两个常用方式：
 *
 * ### 配合 unocss iconify 使用
 *
 * unocss 配置 iconify，配置方式见 unocss 官方文档， `text` 中直接填写图标类名，
 * 例如 `i-tabler-home`，并将其添加到 unocss 的 safelist 配置中。
 *
 * 示例代码:
 *
 * ```page.json
 * {
 *   "tabBar": {
 *     "list": [
 *       {
 *         "iconfont": {
 *           "text": "i-tabler-home"
 *         }
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * ### 配合 iconfont 使用
 *
 * 在 `main.ts`、`App.vue` 或者其他全局样式文件中引入 `iconfont.css`，
 * `text` 中除了填写图标类名还需要加上 'iconfont'
 *
 * 示例代码:
 *
 * ```page.json
 * {
 *   "tabBar": {
 *     "list": [
 *       {
 *         "iconfont": {
 *           "text": "iconfont icon-home"
 *         }
 *       }
 *     ]
 *   }
 * }
 * ```
 */
const iconfont = computed(() => {
  const defaultIconfont = props.iconfont?.text
  const selectedIconFont = props.iconfont?.selectedText ?? defaultIconfont
  return props.active ? selectedIconFont : defaultIconfont
})

const iconfontStyle = computed<StyleValue>(() => {
  const iconfont = props.iconfont
  const style: StyleValue = {}

  const fontSize = iconfont?.fontSize
  if (fontSize) {
    style.fontSize = fontSize
  }

  const specialColor = props.active ? iconfont?.selectedColor : iconfont?.color
  if (specialColor) {
    style.color = specialColor
  }
  return style
})

const iconPath = computed(() => {
  const defaultIconPath = props.iconPath ? `/${props.iconPath}` : undefined
  const selectedIconPath = props.selectedIconPath
    ? `/${props.selectedIconPath}`
    : defaultIconPath

  return props.active ? selectedIconPath : defaultIconPath
})

const isDotBadge = computed(() => {
  return typeof props.badge === 'boolean'
})

const onTabbarClick = () => {
  if (props.active) return

  uni.switchTab({
    url: `/${props.pagePath}`,
  })
}
</script>

<style>
.tabbar_iconfont {
  font-family: UniTabbarIconFont;
}
</style>
