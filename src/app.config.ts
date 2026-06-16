export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/heatmap/index',
    'pages/strategy/index',
    'pages/alerts/index',
    'pages/team/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1677FF',
    navigationBarTitleText: '桩群智控',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F2F3F5'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1677FF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/dashboard/index',
        text: '看板'
      },
      {
        pagePath: 'pages/heatmap/index',
        text: '热区'
      },
      {
        pagePath: 'pages/strategy/index',
        text: '策略'
      },
      {
        pagePath: 'pages/alerts/index',
        text: '告警'
      },
      {
        pagePath: 'pages/team/index',
        text: '班组'
      }
    ]
  }
})
