export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '每日提醒' })
  : { navigationBarTitleText: '每日提醒' }
