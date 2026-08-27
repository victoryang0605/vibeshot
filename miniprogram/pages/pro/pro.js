// pages/pro/pro.js
Page({
  data: {},

  handleSubscribeVIP() {
    wx.showModal({
      title: '开通 Pro 终身尊享',
      content: '即将唤起微信支付 ¥9.9 购买终身特权。',
      confirmText: '去支付',
      confirmColor: '#f59e0b',
      success: (res) => {
        if (res.confirm) {
          // 此处可调用 wx.requestPayment() 发起微信支付
          wx.showToast({
            title: '模拟支付成功！已解锁 Pro 特权',
            icon: 'success'
          });
        }
      }
    });
  },

  handleCustomPOD(e) {
    const product = e.currentTarget.dataset.product;
    wx.showToast({
      title: '已加入文创定制队列',
      icon: 'none'
    });
  }
});
