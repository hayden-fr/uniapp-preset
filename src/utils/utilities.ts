const getErrorMessage = (err: unknown, defaultMsg = '未知错误') => {
  const errMsg = err instanceof Error ? err.message : String(err)
  return errMsg || defaultMsg
}

export const toastError = async (err: unknown, defaultMsg = '未知错误') => {
  const title = getErrorMessage(err, defaultMsg)
  const size = title.replace(/[\u4e00-\u9fa5]/g, '**').length
  const icon = size > 14 ? 'none' : 'error'
  await uni.showToast({
    title: title,
    icon: icon,
    duration: 3000,
  })
}

export const toastSuccess = async (msg: string) => {
  await uni.showToast({
    title: msg,
    icon: 'success',
    duration: 2000,
  })
}

export const toastConfirm = async (msg: string) => {
  return uni.showModal({
    title: '提示',
    content: msg,
  })
}

export const toastWarning = async (msg: string) => {
  return uni.showModal({
    title: '警告',
    content: msg,
    showCancel: false,
  })
}

export const loopClassNameValue = (
  classes: ClassNameValue,
  callback: (className: string) => string | undefined,
): ClassNameValue => {
  if (typeof classes === 'string') {
    return callback(classes)
  }
  if (Array.isArray(classes)) {
    return classes.map((value) => loopClassNameValue(value, callback))
  }
  if (!_.isNil(classes) && typeof classes === 'object') {
    return Object.fromEntries(
      Object.entries(classes).map(([key, value]) => [
        loopClassNameValue(key, callback),
        value,
      ]),
    )
  }
  return classes
}
