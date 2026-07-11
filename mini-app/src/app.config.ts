export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/discover/index',
    'pages/player/index',
    'pages/profile/index',
    'pages/quiz/index',
    'pages/stats/index',
    'pages/settings/index',
    'pages/reminder/index',
    'pages/auth/index',
    'pages/community/index',
    'pages/community/post-detail/index',
    'pages/community/create-post/index',
    'pages/community/user-profile/index',
    'pages/rooms/index',
    'pages/admin/index',
    'pages/admin/users/index',
    'pages/admin/courses/index',
    'pages/admin/courses/edit'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0a0a1a',
    navigationBarTitleText: '尘间静-静心冥想',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0a0a1a'
  },
  tabBar: {
    color: '#9090a0',
    selectedColor: '#7c6aef',
    backgroundColor: '#0a0a1a',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/home.png',
        selectedIconPath: './assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: './assets/tabbar/compass.png',
        selectedIconPath: './assets/tabbar/compass-active.png'
      },
      {
        pagePath: 'pages/community/index',
        text: '社区',
        iconPath: './assets/tabbar/compass.png',
        selectedIconPath: './assets/tabbar/compass-active.png'
      },
      {
        pagePath: 'pages/player/index',
        text: '播放',
        iconPath: './assets/tabbar/play-circle.png',
        selectedIconPath: './assets/tabbar/play-circle-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  }
})
