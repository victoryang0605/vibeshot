// pages/index/index.js
const { PRESET_PHOTOS } = require('../../utils/presets.js');
const { analyzePhotoVibe } = require('../../utils/api.js');

const app = getApp();

Page({
  data: {
    photoTitle: '',
    presetPhotos: PRESET_PHOTOS,
    isProcessing: false
  },

  onLoad() {
    console.log('Index page loaded');
  },

  onInputTitle(e) {
    this.setData({
      photoTitle: e.detail.value
    });
  },

  // 微信原生选图 API (wx.chooseMedia)
  handleChooseMedia() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.processLocalImage(tempFilePath);
      },
      fail: (err) => {
        console.log('User cancelled or chooseMedia failed:', err);
      }
    });
  },

  // 读取图片并调用 AI 分析
  processLocalImage(filePath) {
    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (data) => {
        const base64Str = 'data:image/jpeg;base64,' + data.data;
        this.runAnalyze(base64Str, filePath);
      },
      fail: () => {
        // 读取失败降级
        this.runAnalyze(filePath, filePath);
      }
    });
  },

  // 选择预设样片
  handleSelectPreset(e) {
    const item = e.currentTarget.dataset.item;
    this.runAnalyze(item.imageUrl, item.imageUrl, item.title);
  },

  async runAnalyze(imageBase64, displayUrl, title) {
    const photoTitle = title || this.data.photoTitle || '随手拍日常';
    
    const result = await analyzePhotoVibe({
      imageBase64,
      photoTitle
    });

    // 存入全局并在下一页展示
    app.globalData.currentVibeResult = result;
    app.globalData.currentImageUrl = displayUrl;

    wx.navigateTo({
      url: '/pages/studio/studio'
    });
  },

  onShareAppMessage() {
    return {
      title: '随手拍照片，3秒生成王家卫电影帧与潘通情绪色标 🎬',
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return {
      title: '拾光半格 - 随手拍变身高级电影帧',
      query: ''
    };
  }
});
