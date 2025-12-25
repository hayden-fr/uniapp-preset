<template>
  <button
    :class="buttonClassNames"
    :styles="buttonStyles"
    :size="size"
    :disabled="disabled"
    :hover-class="hoverClass"
    :hover-start-time="hoverStartTime"
    :hover-stay-time="hoverStayTime"
    :open-type="openType"
    @click="bindtap('click', $event)"
    @getphonenumber="bindtap('getphonenumber', $event)"
    @getuserinfo="bindtap('getuserinfo', $event)"
    @error="bindtap('error', $event)"
    @opensetting="bindtap('opensetting', $event)"
    @launchapp="bindtap('launchapp', $event)"
    @contact="bindtap('contact', $event)"
    @chooseavatar="bindtap('chooseavatar', $event)"
  >
    <view class="flex h-full w-full items-center justify-center gap-2">
      <text
        v-show="icon || loading"
        :class="buttonIconClassNames"
        :style="buttonIconStyles"
      ></text>
      <text v-if="label || $slots.default" class="whitespace-nowrap">
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
  // prettier-ignore
  type ButtonVariantType = 'outlined'| 'dashed'| 'solid'| 'filled'| 'text'| 'link'
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
  size?: ComponentSize
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

type Emit = {
  click: [event: UniEvent]
  getphonenumber: [event: UniEvent]
  getuserinfo: [event: UniEvent]
  error: [event: UniEvent]
  opensetting: [event: UniEvent]
  launchapp: [event: UniEvent]
  contact: [event: UniEvent]
  chooseavatar: [event: UniEvent]
}

const emit = defineEmits<Emit>()

/**
 * 按钮图标 class
 */
const buttonIconClassNames = computed(() => {
  const classNames: ClassNameValue = []
  if (props.loading) {
    classNames.push('animate-spin')
    classNames.push(props.loadingIcon || 'i-tabler-loader-2')
    classNames.push(props.classNames?.loading)
  } else if (props.icon) {
    classNames.push(props.icon)
    classNames.push(props.classNames?.icon)
  }
  return classNames
})

/**
 * 按钮图标 style
 */
const buttonIconStyles = computed(() => {
  const style: StyleValue = { fontSize: '1.2em' }
  const styles: StyleValue = [style]

  if (props.loading && props.styles?.loading) {
    styles.push(props.styles.loading)
  } else if (props.icon && props.styles?.icon) {
    styles.push(props.styles.icon)
  }

  return styles
})

/**
 * 按钮 class
 */
const buttonClassNames = computed(() => {
  let { color, variant, type, danger, shape, size, disabled } = props
  const classNames: ClassNameValue = ['m-none']

  // 设置按钮大小
  if (size) {
    classNames.push(`btn-${size}`)
  }

  // 禁用按钮
  if (disabled) {
    classNames.push('btn-disabled')
  }

  // 设置按钮载入状态
  if (props.loading) {
    classNames.push('btn-loading')
  }

  // 幽灵属性，使按钮背景透明
  if (props.ghost) {
    classNames.push('btn-ghost')
  }

  // 设置按钮样式
  switch (shape) {
    case 'circle':
      classNames.push('rounded-full after:rounded-full')
      break
    case 'round':
      classNames.push('rounded-lg after:rounded-lg')
      break
    default:
      classNames.push('rounded after:rounded')
      break
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
  classNames.push(`variant-${variant}`)

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

  // 添加自定义样式
  if (props.classNames?.root) {
    classNames.push(props.classNames.root)
  }

  return loopClassNameValue(classNames, (className) => {
    // 支持 unocss 动态类名
    className = className.replace(/:/g, '_')
    className = className.replace(/\//g, '_')
    return className
  })
})

/**
 * 按钮 style
 */
const buttonStyles = computed(() => {
  const styles: StyleValue = []
  if (props.styles?.root) {
    styles.push(props.styles.root)
  }
  return styles
})

const bindtap = (type: keyof Emit, event: any) => {
  if (!props.loading) {
    emit(type as any, event)
  }
}
</script>

<style>
button {
  --uni-button-control-height: 3rem;
  height: var(--uni-button-control-height);
  min-width: var(--uni-button-control-height);
}

button:after {
  width: 100%;
  height: 100%;
  transform: scale(1);
}

button.btn-mini {
  --uni-button-control-height: 2rem;
  display: block;
  line-height: 2.1;
  font-size: 15px;
  padding: 0 0.44em;
}

button.btn-small {
  --uni-button-control-height: 2.5rem;
  line-height: 2.4;
  font-size: 15px;
  padding: 0 0.84em;
}

button.btn-large {
  --uni-button-control-height: 3.5rem;
  line-height: 2.6;
  font-size: 21px;
  padding: 0 1.24em;
}

button.btn-disabled::after {
  border-color: rgba(0, 0, 0, 0.3);
}

button.btn-disabled.variant-link,
button.btn-disabled.variant-text {
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
