interface FormContainerOptions<Data> {
  data: MaybeRefOrGetter<Data>
  items: MaybeRefOrGetter<FormItem<Data>[]>
}

export const useFormContainer = <Data extends AnyObject>(
  options: FormContainerOptions<Data>,
) => {
  const validate = async () => {
    const formData = toValue(options.data)
    const formItems = toValue(options.items)

    const throwError = (message: string) => {
      throw new Error(message)
    }

    for (const item of formItems) {
      const rules = item.rules ?? []
      const value = formData[item.field]
      for (const rule of rules) {
        // 自定义校验
        if (rule.validator) {
          await rule.validator(rule, value, throwError)
          continue
        }
        // 正则校验
        if (rule.pattern) {
          const pattern =
            rule.pattern instanceof RegExp
              ? rule.pattern
              : new RegExp(rule.pattern)
          if (!pattern.test(value)) {
            throwError(rule.message || `"${item.label}"不符合校验规则`)
          }
        }
        // 必填校验
        if (rule.required) {
          if (_.isNil(value) || value === '') {
            throwError(rule.message || `"${item.label}"为必填项`)
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
            string: `"${item.label}"长度必须为${rule.len}`,
            number: `"${item.label}"必须为${rule.len}`,
            array: `"${item.label}"长度必须为${rule.len}`,
          })
        }
        if (typeof rule.min === 'number') {
          validateValueLen(value, (val) => val >= rule.min!, {
            string: `"${item.label}"长度必须大于等于${rule.min}`,
            number: `"${item.label}"必须大于等于${rule.min}`,
            array: `"${item.label}"长度必须大于等于${rule.min}`,
          })
        }
        if (typeof rule.max === 'number') {
          validateValueLen(value, (val) => val <= rule.max!, {
            string: `"${item.label}"长度必须小于等于${rule.max}`,
            number: `"${item.label}"必须小于等于${rule.max}`,
            array: `"${item.label}"长度必须小于等于${rule.max}`,
          })
        }
      }
    }
  }

  return {
    validate,
  }
}
