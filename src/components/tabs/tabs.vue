<template>
  <view :class="semanticStyle.root.classes" :style="semanticStyle.root.styles">
    <view
      :class="semanticStyle.header.classes"
      :style="semanticStyle.header.styles"
    >
      <view
        v-for="item in items"
        :key="`${item.value}`"
        class="tabs-header-item"
        :class="[
          semanticStyle.item.classes,
          active === item.value ? semanticStyle.active.classes : '',
        ]"
        :style="[
          semanticStyle.item.styles,
          active === item.value ? semanticStyle.active.styles : '',
        ]"
        @click="handleClick(item)"
      >
        <text :class="[item.icon]"></text>
        <text>{{ item.label }}</text>
      </view>
      <view
        v-if="type !== 'button'"
        :class="semanticStyle.indicator.classes"
        :style="semanticStyle.indicator.styles"
      ></view>
    </view>
    <view
      :class="semanticStyle.content.classes"
      :style="semanticStyle.content.styles"
    >
      <view
        v-for="item in items"
        v-show="active === item.value"
        :key="`${item.value}`"
      >
        <slot :name="item.value"></slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
declare global {
  interface TabItem<Value = string | number> {
    label: string
    value: Value
    icon?: string
    disabled?: boolean
  }

  /**
   * 页签的基本样式
   */
  type TabStyleType = 'line' | 'button' | 'card'
}
</script>

<script setup lang="ts" generic="Value = string | number">
interface Props {
  /**
   * 默认选中的标签
   */
  defaultValue?: Value
  /**
   * Tab items
   */
  items: TabItem<Value>[]
  /**
   * 页签的基本样式
   */
  type?: TabStyleType
  /**
   * 组件尺寸
   */
  size?: ComponentSize
  /**
   * 语义化结构 class
   */
  classNames?: Semantic<SemanticDOM, ClassNameValue>
  /**
   * 语义化结构 style
   */
  styles?: Semantic<SemanticDOM, StyleValue>
}

// prettier-ignore
const semantics = ['root', 'header', 'item', 'active', 'indicator', 'content'] as const
type SemanticDOM = (typeof semantics)[number]

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  type: 'line',
  size: 'medium',
})

const active = defineModel<Value>()

onMounted(() => {
  if (!active.value) {
    active.value = props.defaultValue || props.items[0]?.value
  }
})

const activeIndex = computed(() =>
  props.items.findIndex((item) => item.value === active.value),
)

const itemsDomInfo = ref<UniApp.NodeInfo[]>([])

const selectorQuery = ref<UniApp.SelectorQuery>()

const calcTabItemsDomInfo = (query: UniApp.SelectorQuery) => {
  nextTick(() => {
    query
      .selectAll('.tabs-header-item')
      .boundingClientRect((res) => {
        itemsDomInfo.value = res as UniApp.NodeInfo[]
      })
      .exec()
  })
}

onMounted(() => {
  const instance = getCurrentInstance()?.proxy
  if (instance) {
    selectorQuery.value = uni.createSelectorQuery().in(instance)
    calcTabItemsDomInfo(selectorQuery.value)
  }
})

watch(
  () => props.items,
  () => {
    calcTabItemsDomInfo(selectorQuery.value!)
  },
)

const semanticStyle = computed(() => {
  interface SemanticStyle {
    classes: ClassNameValue[]
    styles: StyleValue[]
  }

  const generateStyleObject = (): SemanticStyle => {
    return { classes: [], styles: [] }
  }

  const collection = Object.fromEntries(
    semantics.map((name) => [name, generateStyleObject()]),
  ) as Record<SemanticDOM, SemanticStyle>

  const { root, header, item, active, indicator, content } = collection

  // 获取当前激活项的 DOM 信息
  const indicatorInfo = itemsDomInfo.value[activeIndex.value]

  // 固定样式
  header.classes.push('relative flex flex-nowrap')
  item.classes.push('flex flex-1 items-center justify-center')

  // 设置组件尺寸大小
  if (props.size === 'mini') {
    item.classes.push('h-8 text-sm px-1')
  }

  if (props.size === 'small') {
    item.classes.push('h-10 text-sm px-2')
  }

  if (props.size === 'medium') {
    item.classes.push('h-12 text-base px-3')
  }

  if (props.size === 'large') {
    item.classes.push('h-14 text-lg px-4')
  }

  // 预设样式
  if (props.type === 'button') {
    header.classes.push('border rounded-lg overflow-hidden')
    item.classes.push('border-r last:border-r-0')
    active.classes.push('bg-primary text-white')
  }

  if (props.type === 'line') {
    header.classes.push('border-b')
    active.classes.push('text-primary font-medium')
  }

  if (props.type === 'card') {
    header.classes.push('gap-1 border-b')
    item.classes.push('border-t border-x rounded-t-lg bg-gray-100')
    active.classes.push('bg-white text-primary font-medium')
  }

  // 指示器样式
  indicator.classes.push('absolute transition-all')
  if (props.type === 'line') {
    indicator.classes.push('h-2px -bottom-px')
    indicator.classes.push('bg-primary rounded-full')
  }
  if (props.type === 'card') {
    indicator.classes.push('h-1 -bottom-2px')
    indicator.classes.push('bg-white')
  }
  indicator.styles.push({
    width: (indicatorInfo?.width || 0) - 2 + 'px',
    left: (indicatorInfo?.left || 0) + 1 + 'px',
  })

  for (const [name, item] of Object.entries(collection)) {
    item.classes.push(props.classNames?.[name as SemanticDOM])
    item.styles.push(props.styles?.[name as SemanticDOM])
  }

  return collection
})

const handleClick = (item: TabItem<Value>) => {
  active.value = item.value
}
</script>
