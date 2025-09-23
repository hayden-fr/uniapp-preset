<template>
  <easycom-page-container scrollable :class-names="{ content: 'p-4 gap-4' }">
    <view class="text-xl">语法糖</view>
    <view class="text-gray-600">
      通过 type
      语法糖，使用预设的按钮样式：主按钮、次按钮、虚线按钮、文本按钮和链接按钮。推荐主按钮在同一个操作区域最多出现一次。
    </view>
    <view class="flex flex-wrap gap-4">
      <easycom-button type="primary">主要按钮</easycom-button>
      <easycom-button type="default">默认按钮</easycom-button>
      <easycom-button type="dashed">虚线按钮</easycom-button>
      <easycom-button type="text">文本按钮</easycom-button>
      <easycom-button type="link">链接按钮</easycom-button>
    </view>

    <view class="text-xl">颜色与变体</view>
    <view class="text-gray-600">
      同时设置 color 和 variant 属性，可以衍生出更多的变体按钮。
    </view>
    <view class="flex flex-col gap-1">
      <view class="flex flex-wrap justify-between">
        <easycom-button size="mini" color="default" variant="solid">
          solid
        </easycom-button>
        <easycom-button size="mini" color="default" variant="outlined">
          outlined
        </easycom-button>
        <easycom-button size="mini" color="default" variant="dashed">
          dashed
        </easycom-button>
        <easycom-button size="mini" color="default" variant="filled">
          filled
        </easycom-button>
        <easycom-button size="mini" color="default" variant="text">
          text
        </easycom-button>
        <easycom-button size="mini" color="default" variant="link">
          link
        </easycom-button>
      </view>
      <view class="flex flex-wrap justify-between">
        <easycom-button size="mini" color="primary" variant="solid">
          solid
        </easycom-button>
        <easycom-button size="mini" color="primary" variant="outlined">
          outlined
        </easycom-button>
        <easycom-button size="mini" color="primary" variant="dashed">
          dashed
        </easycom-button>
        <easycom-button size="mini" color="primary" variant="filled">
          filled
        </easycom-button>
        <easycom-button size="mini" color="primary" variant="text">
          text
        </easycom-button>
        <easycom-button size="mini" color="primary" variant="link">
          link
        </easycom-button>
      </view>
      <view class="flex flex-wrap justify-between">
        <easycom-button size="mini" color="danger" variant="solid">
          solid
        </easycom-button>
        <easycom-button size="mini" color="danger" variant="outlined">
          outlined
        </easycom-button>
        <easycom-button size="mini" color="danger" variant="dashed">
          dashed
        </easycom-button>
        <easycom-button size="mini" color="danger" variant="filled">
          filled
        </easycom-button>
        <easycom-button size="mini" color="danger" variant="text">
          text
        </easycom-button>
        <easycom-button size="mini" color="danger" variant="link">
          link
        </easycom-button>
      </view>
      <view class="flex flex-wrap justify-between">
        <easycom-button size="mini" color="pink" variant="solid">
          solid
        </easycom-button>
        <easycom-button size="mini" color="pink" variant="outlined">
          outlined
        </easycom-button>
        <easycom-button size="mini" color="pink" variant="dashed">
          dashed
        </easycom-button>
        <easycom-button size="mini" color="pink" variant="filled">
          filled
        </easycom-button>
        <easycom-button size="mini" color="pink" variant="text">
          text
        </easycom-button>
        <easycom-button size="mini" color="pink" variant="link">
          link
        </easycom-button>
      </view>
      <view class="flex flex-wrap justify-between">
        <easycom-button size="mini" color="purple" variant="solid">
          solid
        </easycom-button>
        <easycom-button size="mini" color="purple" variant="outlined">
          outlined
        </easycom-button>
        <easycom-button size="mini" color="purple" variant="dashed">
          dashed
        </easycom-button>
        <easycom-button size="mini" color="purple" variant="filled">
          filled
        </easycom-button>
        <easycom-button size="mini" color="purple" variant="text">
          text
        </easycom-button>
        <easycom-button size="mini" color="purple" variant="link">
          link
        </easycom-button>
      </view>
      <view class="flex flex-wrap justify-between">
        <easycom-button size="mini" color="cyan" variant="solid">
          solid
        </easycom-button>
        <easycom-button size="mini" color="cyan" variant="outlined">
          outlined
        </easycom-button>
        <easycom-button size="mini" color="cyan" variant="dashed">
          dashed
        </easycom-button>
        <easycom-button size="mini" color="cyan" variant="filled">
          filled
        </easycom-button>
        <easycom-button size="mini" color="cyan" variant="text">
          text
        </easycom-button>
        <easycom-button size="mini" color="cyan" variant="link">
          link
        </easycom-button>
      </view>
    </view>

    <view class="text-xl">按钮图标</view>
    <view class="text-gray-600">可以通过 icon属性添加图标。</view>
    <view class="flex flex-wrap gap-2">
      <easycom-button
        type="primary"
        shape="circle"
        icon="i-tabler-search"
      ></easycom-button>
      <easycom-button type="primary" shape="circle">A</easycom-button>
      <easycom-button type="primary" shape="round" icon="i-tabler-search">
        Search
      </easycom-button>
      <easycom-button shape="circle" icon="i-tabler-search"></easycom-button>
    </view>

    <view class="text-xl">按钮尺寸</view>
    <view class="text-gray-600">
      按钮有大、中、小、迷你四种尺寸。 通过设置 size 为 large small mini
      分别把按钮设为大、小、迷你尺寸。若不设置 size，则尺寸默认为中。
    </view>
    <view class="flex flex-col gap-2">
      <view class="flex">
        <view class="inline-block flex overflow-hidden rounded-lg border">
          <view
            v-for="val in sizes"
            :key="val"
            class="border-r px-4 py-2 last:border-0"
            :class="[val === size ? 'bg-primary text-white' : '']"
            @click="handleSizeChange(val)"
          >
            {{ val }}
          </view>
        </view>
      </view>
      <view class="flex flex-wrap gap-2 capitalize">
        <easycom-button :size="size" type="primary">primary</easycom-button>
        <easycom-button :size="size" type="default">default</easycom-button>
        <easycom-button :size="size" type="dashed">dashed</easycom-button>
      </view>
    </view>

    <view class="text-xl">不可用状态</view>
    <view class="text-gray-600">
      添加 disabled 属性即可让按钮处于不可用状态，同时按钮样式也会改变。
    </view>
    <view class="flex flex-wrap gap-2 capitalize">
      <view class="flex gap-2">
        <easycom-button type="primary">primary</easycom-button>
        <easycom-button type="primary" disabled>
          primary(disabled)
        </easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button type="default">default</easycom-button>
        <easycom-button type="default" disabled>
          default(disabled)
        </easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button type="dashed">dashed</easycom-button>
        <easycom-button type="dashed" disabled>
          dashed(disabled)
        </easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button variant="filled">filled</easycom-button>
        <easycom-button variant="filled" disabled>
          filled(disabled)
        </easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button type="text">text</easycom-button>
        <easycom-button type="text" disabled>text(disabled)</easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button type="link">link</easycom-button>
        <easycom-button type="link" disabled>link(disabled)</easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button type="default" danger>danger</easycom-button>
        <easycom-button type="default" danger disabled>
          danger(disabled)
        </easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button type="text" danger>danger text</easycom-button>
        <easycom-button type="text" danger disabled>
          danger text(disabled)
        </easycom-button>
      </view>
      <view class="flex gap-2">
        <easycom-button type="link" danger>danger link</easycom-button>
        <easycom-button type="link" danger disabled>
          danger link(disabled)
        </easycom-button>
      </view>
    </view>

    <view class="text-xl">加载中状态</view>
    <view class="text-gray-600">
      添加 loading 属性即可让按钮处于加载状态，loading.icon
      可以自定义加载图标，最后三个按钮演示点击后进入加载状态。
    </view>
    <view class="flex flex-wrap gap-2 capitalize">
      <easycom-button type="primary" loading>loading</easycom-button>
      <easycom-button type="primary" loading></easycom-button>
      <easycom-button type="primary" loading loading-icon="i-tabler-refresh">
        loading icon
      </easycom-button>
      <easycom-button
        type="primary"
        icon="i-tabler-search"
        :loading="loadings[1]"
        loading-icon="i-tabler-refresh"
        @click="enterLoading(1)"
      >
        icon replace
      </easycom-button>
      <easycom-button
        icon="i-tabler-power"
        :loading="loadings[2]"
        @click="enterLoading(2)"
      ></easycom-button>
      <easycom-button
        icon="i-tabler-search"
        :loading="loadings[2]"
        @click="enterLoading(2)"
      >
        loading
      </easycom-button>
    </view>

    <view class="text-xl">幽灵按钮</view>
    <view class="text-gray-600">
      幽灵按钮将按钮镂空，背景变为透明，常用在有色背景上。
    </view>
    <view class="flex flex-wrap gap-2 bg-gray-600 p-2 capitalize">
      <easycom-button color="primary" variant="outlined" ghost>
        primary
      </easycom-button>
      <easycom-button color="white" ghost>default</easycom-button>
      <easycom-button danger ghost> dashed </easycom-button>
    </view>

    <view class="text-xl">渐变按钮</view>
    <view class="text-gray-600">自定义为渐变背景按钮。</view>
    <view class="flex flex-wrap gap-2 capitalize">
      <easycom-button
        icon="i-tabler-brand-github-filled"
        color="none"
        :class-names="{
          root: 'text-white bg-gradient-to-r from-#6253e1 to-#04befe active:to-#6253e1',
        }"
      >
        gradient button
      </easycom-button>
    </view>

    <view class="h-4 shrink-0"></view>
  </easycom-page-container>
</template>

<script setup lang="ts">
const loadings = ref<boolean[]>([])
const enterLoading = (index: number) => {
  loadings.value[index] = true
  setTimeout(() => {
    loadings.value[index] = false
  }, 5000)
}

const sizes: ComponentSize[] = ['large', 'medium', 'small', 'mini']
const size = ref<ComponentSize>('large')
const handleSizeChange = (value: ComponentSize) => {
  size.value = value
}
</script>
