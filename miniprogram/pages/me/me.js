// pages/me/me.js
const { wxLogin, updateProfile } = require('../../utils/api.js');

const TOKEN_KEY = 'vibeshot_token';
const USER_KEY = 'vibeshot_user';

Page({
  data: {
    isLoggedIn: false,
    user: null,
    userInitial: '',
    openidShort: '',
    nickNameDraft: ''
  },

  onShow() {
    this.refreshLoginState();
  },

  // 从本地缓存恢复登录态
  refreshLoginState() {
    const token = wx.getStorageSync(TOKEN_KEY);
    const user = wx.getStorageSync(USER_KEY);
    if (token && user) {
      this.setData({
        isLoggedIn: true,
        user,
        userInitial: (user.nickName || '微')[0],
        openidShort: user.openid ? user.openid.slice(0, 8) + '…' : '',
        nickNameDraft: user.nickName || ''
      });
    } else {
      this.setData({ isLoggedIn: false, user: null, userInitial: '', openidShort: '', nickNameDraft: '' });
    }
  },

  // 微信一键登录（自动注册）
  async handleLogin() {
    wx.showLoading({ title: '微信登录中...', mask: true });
    const data = await wxLogin();
    wx.hideLoading();
    if (!data) return;

    wx.setStorageSync(TOKEN_KEY, data.token);
    wx.setStorageSync(USER_KEY, data.user);
    getApp().globalData.token = data.token;
    getApp().globalData.user = data.user;

    this.refreshLoginState();
    wx.showToast({ title: '登录成功', icon: 'success' });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(TOKEN_KEY);
          wx.removeStorageSync(USER_KEY);
          getApp().globalData.token = '';
          getApp().globalData.user = null;
          this.refreshLoginState();
        }
      }
    });
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({ nickNameDraft: e.detail.value });
  },

  // 保存昵称
  async saveNickname() {
    const token = wx.getStorageSync(TOKEN_KEY);
    const nickName = (this.data.nickNameDraft || '').trim();
    if (!token || !nickName) return;

    wx.showLoading({ title: '保存中...', mask: true });
    const user = await updateProfile(token, { nickName });
    wx.hideLoading();
    if (user) {
      wx.setStorageSync(USER_KEY, user);
      getApp().globalData.user = user;
      this.refreshLoginState();
      wx.showToast({ title: '昵称已更新', icon: 'success' });
    } else {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // Pro 会员入口（原底部「商业/VIP」收进这里）
  goPro() {
    wx.navigateTo({ url: '/pages/pro/pro' });
  },

  goCreate() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onShareAppMessage() {
    return {
      title: '拾光半格 - 随手拍变身高级电影帧 🎬',
      path: '/pages/index/index'
    };
  }
});
