export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '设置偏好' })
  : { navigationBarTitleText: '设置偏好' }
