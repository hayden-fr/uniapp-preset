<template>
  <easycom-page-container
    :class-names="{ content: 'flex flex-col gap-4' }"
    scrollable
  >
    <view class="px-4">
      <view class="mb-4 text-xl">基础表单</view>
      <view class="text-gray-600">
        基本的表单数据域控制展示，包含布局、初始化、验证、提交。
        表单有两种布局，水平布局和垂直布局。
      </view>
    </view>
    <view class="flex flex-col gap-4">
      <easycom-form-container
        v-model="baseFormData"
        :items="baseItems"
        :label-position="baseFormData.labelPosition"
        :label-align="baseFormData.labelAlign"
        :readonly="baseFormData.readonly"
      ></easycom-form-container>
    </view>

    <view class="px-4">
      <view class="mb-4 text-xl">自定义表单</view>
      <view class="text-gray-600">
        可以通过一些配置来对表单进行深度自定义。
      </view>
    </view>
    <view class="">
      <easycom-form-container
        :items="loginItems"
        label-position="top"
        :border="false"
        :classNames="{
          content: 'border rounded-xl h-12 px-4 bg-gray-100',
        }"
      >
        <template #code-suffix>
          <view class="pl-2">
            <easycom-button shape="round" variant="filled">
              获取验证码
            </easycom-button>
          </view>
        </template>
      </easycom-form-container>
    </view>

    <view class="px-4">
      <view class="mb-4 text-xl">表单验证</view>
      <view class="text-gray-600">
        可以通过一些配置来对表单进行深度自定义。
      </view>
    </view>
    <view class="">
      <easycom-form-container
        ref="ruleFormRef"
        v-model="ruleFormData"
        v-bind="ruleFormProps"
      ></easycom-form-container>
      <view class="flex flex-col gap-4 p-4">
        <easycom-button type="primary" @click="toastValidate">
          使用弹窗提示错误信息
        </easycom-button>
        <easycom-button type="primary" @click="validate">
          在表单上提示错误信息
        </easycom-button>
      </view>
    </view>
  </easycom-page-container>
</template>

<script setup lang="ts">
type BaseFormData = {
  labelPosition?: FormItemLabelPositionType
  labelAlign: TextAlignType
  readonly: boolean
  [k: string]: any
}

const baseFormData = ref<BaseFormData>({
  labelPosition: 'left',
  labelAlign: 'left',
  readonly: false,
})

const baseItems = computed(() => {
  const items: FormItem<BaseFormData>[] = [
    {
      field: '_group_1',
      label: '表单设置',
      type: 'custom',
      // 通过控制样式
      classNames: {
        item: 'bg-gray-1',
      },
    },
    {
      field: 'labelPosition',
      label: '标签位置',
      type: 'option',
      placeholder: '请选择标签位置',
      options: [
        {
          label: '水平布局',
          value: 'left',
        },
        {
          label: '垂直布局',
          value: 'top',
        },
      ],
    },
    {
      field: 'labelAlign',
      label: '标签对齐',
      type: 'option',
      placeholder: '请选择标签对齐',
      options: [
        {
          label: '左对齐',
          value: 'left',
        },
        {
          label: '右对齐',
          value: 'right',
        },
        {
          label: '居中对齐',
          value: 'center',
        },
      ],
    },
    {
      field: 'readonly',
      label: '只读',
      type: 'logic',
      readonly: false,
    },
    {
      field: '_group_2',
      label: '基础字段',
      type: 'custom',
      classNames: {
        item: 'bg-gray-1',
      },
    },
    {
      field: 'text',
      label: '文本',
      type: 'text',
      placeholder: '请输入文本内容',
      allowClear: true,
    },
    {
      field: 'password',
      label: '密码',
      type: 'password',
      placeholder: '请输入密码',
      allowClear: true,
      showVisible: true,
    },
    {
      field: 'bigText',
      label: '大文本',
      type: 'textarea',
      labelPosition: 'top',
      placeholder: '请输入文本内容',
    },
    {
      field: 'number',
      label: '整数',
      type: 'number',
      placeholder: '部分平台下允许输入小数点',
    },
    {
      field: 'digit',
      label: '小数',
      type: 'number',
      placeholder: '设置 decimal 为 true 表示允许小数',
      decimal: true,
    },
    {
      field: 'date',
      label: '日期',
      type: 'date',
      placeholder: '请选择日期',
    },
    {
      field: 'options',
      label: '枚举',
      type: 'option',
      placeholder: '请选择',
      options: [
        {
          label: '选项1',
          value: '1',
        },
        {
          label: '选项2',
          value: '2',
        },
        {
          label: '选项3',
          value: '3',
        },
      ],
    },
  ]
  return items
})

const loginItems = computed(() => {
  const items: FormItem[] = [
    {
      field: 'username',
      label: '用户名',
      type: 'text',
      icon: 'i-tabler-user',
      placeholder: '请输入用户名',
      rules: [{ required: true, message: '请输入用户名' }],
    },
    {
      field: 'password',
      label: '密码',
      type: 'password',
      icon: 'i-tabler-lock',
      placeholder: '请输入密码',
    },
    {
      field: 'code',
      label: '验证码',
      type: 'text',
      icon: 'i-tabler-user',
      allowClear: true,
      placeholder: '请输入验证码',
    },
  ]

  return items
})

const ruleFormData = ref<any>({})
const ruleFormItems = computed(() => {
  const items: FormItem[] = [
    {
      field: 'item1',
      label: '必填项校验',
      type: 'text',
      placeholder: '必填项校验',
      required: true,
      rules: [{ required: true, message: '请输入ITEM1的内容' }],
    },
    {
      field: 'item2',
      label: '文本长度',
      type: 'text',
      placeholder: '文本长度校验',
      rules: [{ len: 9 }],
    },
    {
      field: 'username',
      label: '用户名',
      type: 'text',
      icon: 'i-tabler-user',
      placeholder: '请输入用户名',
      required: true,
      rules: [{ required: true, message: '请输入用户名' }],
      labelPosition: 'top',
      classNames: {
        item: 'border-none mb-2',
        content: 'border rounded-xl h-12 px-4 bg-gray-100',
        errorMessage: '-bottom-4',
      },
    },
    {
      field: 'password',
      label: '密码',
      type: 'password',
      icon: 'i-tabler-lock',
      placeholder: '请输入密码',
      labelPosition: 'top',
      classNames: {
        item: 'border-none',
        content: 'border rounded-xl h-12 px-4 bg-gray-100',
      },
    },
    {
      field: 'code',
      label: '验证码',
      type: 'text',
      icon: 'i-tabler-user',
      allowClear: true,
      placeholder: '请输入验证码',
      labelPosition: 'top',
      classNames: {
        item: 'border-none',
        content: 'border rounded-xl h-12 px-4 bg-gray-100',
      },
    },
  ]
  return items
})

const ruleForm = useFormContainer({
  data: ruleFormData,
  items: ruleFormItems,
})
const { formProps: ruleFormProps } = ruleForm

const toastValidate = async () => {
  try {
    await ruleForm.validate()
    toastSuccess('表单验证成功')
  } catch (error) {
    toastError(error)
  }
}

const validate = async () => {
  try {
    await ruleForm.validate('form-item')
    toastSuccess('表单验证成功')
  } catch (error) {
    toastError(error)
  }
}
</script>
