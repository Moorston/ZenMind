export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '发现课程' })
  : { navigationBarTitleText: '发现课程' }
