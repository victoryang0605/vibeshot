// app.js
App({
  onLaunch() {
    console.log('拾光半格 小程序启动成功');
    // 获取设备系统信息，用于胶囊按钮与刘海屏适配
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        this.globalData.statusBarHeight = res.statusBarHeight;
      }
    });
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 20,
    currentVibeResult: null,
    selectedTemplate: 'polaroid',
    selectedFilter: 'none'
  }
});
