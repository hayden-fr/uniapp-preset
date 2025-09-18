<template>
  <button
    :class="[buttonStyle.classNames, classNames?.root]"
    :styles="[buttonStyle.styles, styles?.root]"
    :size="size"
    :disabled="disabled"
    :hover-class="hoverClass"
    :hover-start-time="hoverStartTime"
    :hover-stay-time="hoverStayTime"
    :open-type="openType"
    @click="!loading && $emit('click', $event)"
  >
    <view class="flex h-full w-full items-center justify-center gap-2">
      <text
        v-show="icon || loading"
        :class="[buttonIcon.classNames]"
        :style="[buttonIcon.styles]"
      ></text>
      <text class="group-[.btn-icon-only]/button:hidden">
        <slot>{{ label }}</slot>
      </text>
    </view>
  </button>
</template>

<script lang="ts">
declare global {
  /**
   * 按钮预设样式
   */
  type ButtonType = 'primary' | 'dashed' | 'link' | 'text' | 'default'
  /**
   * 按钮颜色
   */
  type ButtonColorType = 'default' | PresetColors | 'none'
  /**
   * 按钮变体类型
   */
  type ButtonVariantType =
    | 'outlined'
    | 'dashed'
    | 'solid'
    | 'filled'
    | 'text'
    | 'link'
  /**
   * 按钮尺寸
   */
  type ButtonSizeType = 'mini' | 'small' | 'medium' | 'large'
  /**
   * 按钮形状
   */
  type ButtonShapeType = 'default' | 'circle' | 'round'

  /**
   * 小程序开发能力
   *
   * @see https://developers.weixin.qq.com/miniprogram/dev/component/button.html
   */
  type ButtonOpenActionType =
    | 'contact'
    | 'liveActivity'
    | 'share'
    | 'getPhoneNumber'
    | 'getRealtimePhoneNumber'
    | 'getUserInfo'
    | 'launchApp'
    | 'openSetting'
    | 'feedback'
    | 'chooseAvatar'
    | 'agreePrivacyAuthorization'
}
</script>

<script setup lang="ts">
interface Props {
  /**
   * 设置按钮的颜色
   */
  color?: ButtonColorType
  /**
   * 设置按钮的变体
   */
  variant?: ButtonVariantType
  /**
   * 预设样式：主按钮、次按钮、虚线按钮、文本按钮和链接按钮。
   *
   * color 与 variant 的语法糖，当设置 color 与 variant 时以后者为准
   */
  type?: ButtonType
  /**
   * color 的语法糖，当设置 color 时以后者为准
   */
  danger?: boolean
  /**
   * 设置按钮大小
   */
  size?: ButtonSizeType
  /**
   * 设置按钮形状
   */
  shape?: ButtonShapeType
  /**
   * 幽灵属性，使按钮背景透明
   */
  ghost?: boolean
  /**
   * 设置按钮文字，当设置 children 时以后者为准
   */
  label?: string
  /**
   * 设置按钮载入状态
   */
  loading?: boolean
  /**
   * 使用 unocss icon 设置载入图标
   */
  loadingIcon?: string
  /**
   * 使用 unocss icon 设置按钮的图标
   */
  icon?: string
  /**
   * 禁用按钮
   */
  disabled?: boolean
  /**
   * 指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果
   */
  hoverClass?: string
  /**
   * 按住后多久出现点击态，单位毫秒，默认 0
   */
  hoverStartTime?: number
  /**
   * 手指松开后点击态保留时间，单位毫秒，默认 200
   */
  hoverStayTime?: number
  /**
   * 开放能力，小程序和公众号内有效
   *
   * @see https://developers.weixin.qq.com/miniprogram/dev/component/button.html
   */
  openType?: ButtonOpenActionType
  /**
   * 点击按钮时的回调
   */
  onClick?: (event: Event) => void
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<SemanticDOM, StyleValue>
}

type SemanticDOM = 'root' | 'icon' | 'label' | 'loading'

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  shape: 'default',
  hoverClass: 'none',
  hoverStartTime: 0,
  hoverStayTime: 200,
})

const slots = useSlots()

defineEmits<{
  click: [Event]
}>()

const buttonIcon = computed(() => {
  const classNames: ClassNameValue = []
  const styles: StyleValue = [{ fontSize: '1.2em' }]

  if (props.loading) {
    classNames.push('animate-spin')
    classNames.push(props.loadingIcon || 'i-tabler-loader-2')
    classNames.push(props.classNames?.loading)
    styles.push(props.styles?.loading)
  } else if (props.icon) {
    classNames.push(props.icon)
    classNames.push(props.classNames?.icon)
    styles.push(props.styles?.icon)
  }

  return { classNames, styles }
})

const buttonStyle = computed(() => {
  let { color, variant, type, danger, shape } = props

  const classNames: ClassNameValue = ['m-0', 'group/button']
  const styles: StyleValue = []

  if (props.loading) {
    classNames.push('btn-loading')
  }

  if (props.ghost) {
    classNames.push('btn-ghost')
  }

  if (!(props.label || slots.default) && (props.icon || props.loading)) {
    classNames.push('btn-icon-only')
  }

  // 设置按钮样式
  if (shape === 'circle') {
    classNames.push('rounded-full after:rounded-full')
  }
  if (shape === 'round') {
    classNames.push('rounded-lg after:rounded-lg')
  }
  if (shape === 'default') {
    classNames.push('rounded after:rounded')
  }

  // 设置按钮颜色及变体
  interface TypeLegacyItem {
    color: Props['color']
    variant: Props['variant']
  }

  type LegacyType = NonNullable<Props['type']>

  const typeLegacyMap: Record<LegacyType, TypeLegacyItem> = {
    default: { color: 'default', variant: 'outlined' },
    primary: { color: 'primary', variant: 'solid' },
    dashed: { color: 'default', variant: 'dashed' },
    text: { color: 'default', variant: 'text' },
    link: { color: 'primary', variant: 'link' },
  }

  color ||= danger ? 'danger' : undefined
  color ||= type ? typeLegacyMap[type]?.color : undefined

  if (color === 'default') {
    color = 'black'
  }

  variant = variant || (type ? typeLegacyMap[type]?.variant : 'filled')

  if (color) {
    /**
     * 突变颜色
     */
    const m = (original: PresetColors, variant: PresetColors) => {
      return color === original ? variant : color
    }

    if (variant === 'solid') {
      classNames.push('text-white')
      classNames.push(`bg-${color}`)
      classNames.push(`after:border-${color}`)
      classNames.push(`active:bg-${color}-active`)
      classNames.push(`active:border-${color}-active`)
    }

    if (variant === 'outlined') {
      classNames.push('bg-white')
      classNames.push(`text-${color}`)
      classNames.push(`after:border-${m('black', 'gray')}`)
      classNames.push(`active:text-${m('black', 'primary')}-active`)
      classNames.push(`active:after:border-${m('black', 'primary')}-active`)
    }

    if (variant === 'dashed') {
      classNames.push('bg-white')
      classNames.push(`text-${color}`)
      classNames.push('after:border-dashed')
      classNames.push(`after:border-${m('black', 'gray')}`)
      classNames.push(`active:text-${m('black', 'primary')}-active`)
      classNames.push(`active:after:border-${m('black', 'primary')}-active`)
    }

    if (variant === 'filled') {
      classNames.push('after:border-none')
      classNames.push(`text-${color}`)
      classNames.push(`bg-${color}/10`)
      classNames.push(`active:text-${color}-active`)
      classNames.push(`active:bg-${color}/50`)
    }

    if (variant === 'text') {
      classNames.push('after:border-none')
      classNames.push(`text-${color}`)
      classNames.push(`bg-transparent`)
      classNames.push(`active:bg-${color}/50`)
    }

    if (variant === 'link') {
      classNames.push('after:border-none')
      classNames.push(`text-${color}`)
      classNames.push(`bg-transparent`)
      classNames.push(`active:text-${m('black', 'primary')}-active`)
    }
  }

  classNames.push(`variant-${variant}`)

  return {
    classNames: loopClassNameValue(classNames, (className) => {
      // 支持 unocss 动态类名
      className = className.replace(/:/g, '_')
      className = className.replace(/\//g, '_')
      return className
    }),
    styles,
  }
})
</script>

<style>
button {
  --uni-button-control-height: 46px;
  height: var(--uni-button-control-height);
  min-width: var(--uni-button-control-height);
}

button:after {
  width: 100%;
  height: 100%;
  transform: scale(1);
}

button[size='mini'] {
  --uni-button-control-height: 32px;
  display: block;
  line-height: 2.1;
  font-size: 15px;
  padding: 0 0.44em;
}

button[size='small'] {
  --uni-button-control-height: 36px;
  line-height: 2.4;
  font-size: 15px;
  padding: 0 0.84em;
}

button[size='large'] {
  --uni-button-control-height: 54px;
  line-height: 2.6;
  font-size: 21px;
  padding: 0 1.24em;
}

button[disabled]::after {
  border-color: rgba(0, 0, 0, 0.3);
}

button[disabled].variant-link,
button[disabled].variant-text {
  background-color: transparent;
}

button.btn-ghost {
  background-color: transparent !important;
}

button.btn-icon-only {
  width: var(--uni-button-control-height);
  padding: 0 0.2em;
}

button.btn-loading::after {
  --un-border-opacity: 0.5 !important;
  background-color: #ffffff;
  opacity: var(--un-border-opacity);
}
</style>
