export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '正在播放' })
  : { navigationBarTitleText: '正在播放' }
