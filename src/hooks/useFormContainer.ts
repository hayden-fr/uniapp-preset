interface FormContainerOptions<Data extends AnyObject> {
  data: MaybeRefOrGetter<Data>
  items: MaybeRefOrGetter<FormItem<Data>[]>
  defaultErrorPrompt?: ErrorPromptType
}

type ErrorPromptType = 'toast' | 'form-item'

export const useFormContainer = <Data extends AnyObject>(
  options: FormContainerOptions<Data>,
) => {
  const { defaultErrorPrompt = 'toast' } = options
  const itemsValidation = ref<FormItemError<Data>>({})

  /**
   * 验证表单项
   *
   * @param errorPrompt 如何提示错误信息 toast | static
   * - toast: 使用消息提示框进行错误提示，并且在某一项规则验证不通过时，立即停止后面所有规则的校验
   * - form-item: 在所有验证失败的表单项下方显示错误信息，在表单项规则校验失败时，进行下一个表单项的校验
   */
  const validate = async (
    errorPrompt: ErrorPromptType = defaultErrorPrompt,
  ) => {
    let hasError = false
    itemsValidation.value = {}

    const formData = toValue(options.data)
    const formItems = toValue(options.items)

    for (const item of formItems) {
      let itemError = false
      const throwError = (errorOrMessage: Error | string) => {
        const message =
          errorOrMessage instanceof Error
            ? errorOrMessage.message
            : errorOrMessage
        if (errorPrompt === 'toast') {
          throw new Error(message)
        }
        if (errorPrompt === 'form-item') {
          hasError = true
          itemError = true
          itemsValidation.value[item.field] = { message }
        }
      }

      const rules = item.rules ?? []
      if (item.required) {
        const hasRequiredRule = rules.some((o) => o.required)
        if (!hasRequiredRule) {
          rules.push({ required: true })
        }
      }

      const value = formData[item.field]
      for (const rule of rules) {
        if (itemError) {
          continue
        }

        // 自定义校验
        if (rule.validator) {
          await rule.validator(rule, value).catch(throwError)
          continue
        }
        // 正则校验
        if (rule.pattern) {
          const pattern =
            rule.pattern instanceof RegExp
              ? rule.pattern
              : new RegExp(rule.pattern)
          if (!pattern.test(value)) {
            throwError(rule.message || `${item.label}不符合校验规则`)
          }
        }
        // 必填校验
        if (rule.required) {
          if (_.isNil(value) || value === '') {
            throwError(rule.message || `${item.label}为必填项`)
          }
        }
        // 长度校验
        const validateValueLen = (
          val: any,
          validator: (val: number) => boolean,
          validateMessages: Record<'string' | 'number' | 'array', string>,
        ) => {
          if (typeof val === 'string') {
            if (!validator(val.length)) {
              throwError(rule.message || validateMessages.string)
            }
          }
          if (typeof val === 'number') {
            if (!validator(val)) {
              throwError(rule.message || validateMessages.number)
            }
          }
          if (Array.isArray(val)) {
            if (!validator(val.length)) {
              throwError(rule.message || validateMessages.array)
            }
          }
        }
        if (typeof rule.len === 'number') {
          validateValueLen(value, (val) => val === rule.len!, {
            string: `${item.label}长度必须为${rule.len}`,
            number: `${item.label}必须为${rule.len}`,
            array: `${item.label}长度必须为${rule.len}`,
          })
        }
        if (typeof rule.min === 'number') {
          validateValueLen(value, (val) => val >= rule.min!, {
            string: `${item.label}长度必须大于等于${rule.min}`,
            number: `${item.label}必须大于等于${rule.min}`,
            array: `${item.label}长度必须大于等于${rule.min}`,
          })
        }
        if (typeof rule.max === 'number') {
          validateValueLen(value, (val) => val <= rule.max!, {
            string: `${item.label}长度必须小于等于${rule.max}`,
            number: `${item.label}必须小于等于${rule.max}`,
            array: `${item.label}长度必须小于等于${rule.max}`,
          })
        }
      }
    }

    if (hasError) {
      throw new SilenceError('表单验证失败')
    }
  }

  const formProps = computed(() => {
    return {
      items: toValue(options.items),
      itemsValidation: toValue(itemsValidation),
    }
  })

  return {
    validate,
    itemsValidation,
    formProps,
  }
}
