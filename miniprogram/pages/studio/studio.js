// pages/studio/studio.js
const app = getApp();
const { generateAiPoster } = require('../../utils/api.js');

Page({
  data: {
    currentTemplate: 'polaroid', // 'polaroid' | 'vinyl' | 'magazine' | 'cinema' | 'pantone'
    currentQuoteStyle: 'wongKarWai', // 'wongKarWai' | 'japaneseMinimal' | 'frenchChic' | 'lateNight'
    currentFilter: 'none',
    imageUrl: '',
    vibeData: null,
    currentQuoteText: '',
    currentSubText: '',
    dateFormatted: '',
    aiPosterPath: '',      // AI 重绘海报预览地址
    isAiGenerating: false  // 重绘中
  },

  onLoad() {
    const vibeData = app.globalData.currentVibeResult;
    const imageUrl = app.globalData.currentImageUrl;

    if (!vibeData) {
      wx.navigateBack();
      return;
    }

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

    this.setData({
      vibeData,
      imageUrl,
      dateFormatted,
      currentQuoteText: vibeData.quotes.wongKarWai.monologue,
      currentSubText: vibeData.quotes.wongKarWai.english
    });
  },

  switchTemplate(e) {
    const tpl = e.currentTarget.dataset.tpl;
    this.setData({ currentTemplate: tpl });
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
  },

  switchQuoteStyle(e) {
    const style = e.currentTarget.dataset.style;
    const quotes = this.data.vibeData.quotes;
    let main = '';
    let sub = '';

    if (style === 'wongKarWai') {
      main = quotes.wongKarWai.monologue;
      sub = quotes.wongKarWai.english;
    } else if (style === 'japaneseMinimal') {
      main = quotes.japaneseMinimal.line;
      sub = quotes.japaneseMinimal.english;
    } else if (style === 'frenchChic') {
      main = quotes.frenchChic.editorial;
      sub = quotes.frenchChic.english;
    } else if (style === 'lateNight') {
      main = quotes.lateNight.cureText;
      sub = quotes.lateNight.english;
    }

    this.setData({
      currentQuoteStyle: style,
      currentQuoteText: main,
      currentSubText: sub
    });
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
  },

  onQuoteInput(e) {
    this.setData({
      currentQuoteText: e.detail.value
    });
  },

  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
  },

  // 复制朋友圈 / 小红书文案到剪贴板
  handleCopySocialCopy() {
    const { vibeData, currentQuoteText, dateFormatted } = this.data;
    const hex = vibeData.colorPalette[0]?.hex || '#3E2723';
    const name = vibeData.colorPalette[0]?.name || '拾光半格';

    const copyText = `🎬 拾光半格 · 今日视觉胶囊\n\n“${currentQuoteText}”\n\n🎨 潘通色卡：${hex} ${name}\n🧬 情绪DNA：${vibeData.moodDNA.dominantMood}\n🎧 BGM：${vibeData.moodDNA.bgmTrack.title} - ${vibeData.moodDNA.bgmTrack.artist}\n📅 ${dateFormatted}\n\n#拾光半格 #王家卫电影台词 #胶片摄影 #我的松弛感日常 #潘通色卡 #摄影审美积累`;

    wx.setClipboardData({
      data: copyText,
      success: () => {
        wx.showToast({
          title: '文案已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 跳转海报生成导出页
  handleExportPoster() {
    app.globalData.selectedTemplate = this.data.currentTemplate;
    app.globalData.selectedFilter = this.data.currentFilter;
    app.globalData.customQuote = this.data.currentQuoteText;
    // 同步传英文译文（用于海报 Canvas 绘制）
    app.globalData.customQuoteEN = this.data.currentSubText;

    wx.navigateTo({
      url: '/pages/poster/poster'
    });
  },

  // ========== AI 重绘电影海报（Agnes 免费生图） ==========
  async handleAiRedraw() {
    const { vibeData, imageUrl, currentQuoteText } = this.data;
    if (!vibeData) return;
    if (this.data.isAiGenerating) return;

    this.setData({ isAiGenerating: true });

    // 组装重绘提示词：主体 + 情绪 + 关键词 + 配文
    const keywords = (vibeData.moodDNA.vibeKeywords || []).join('、');
    const prompt = '将这张照片重绘成一幅电影感海报：'
      + '主体是「' + (vibeData.photoTitle || '日常高光瞬间') + '」，'
      + '情绪基调「' + (vibeData.moodDNA.dominantMood || '松弛电影感') + '」，'
      + '美学关键词「' + (keywords || '胶片颗粒、电影感、高级灰') + '」。'
      + '画面配文："' + currentQuoteText + '"。'
      + '请保留原照片主体与构图，提升为王家卫电影质感：胶片颗粒、湿润冷调、光影层次丰富、电影级构图、高级版式设计感，高细节、高质量。';

    try {
      // 参考图来源处理：
      //  - 拍照/选图：wxfile:// 或 http://tmp 临时文件 -> 读 base64
      //  - 本地预设包内图：以 / 开头（如 /images/presets/xx.jpg）-> 读 base64
      //  - 公网 URL：直接作为参考图地址传给后端
      const isLocalFile = imageUrl && (
        imageUrl.indexOf('wxfile://') === 0 ||
        imageUrl.indexOf('http://tmp') === 0 ||
        imageUrl.indexOf('/') === 0
      );
      let payload = {
        prompt,
        size: '1024x1024',
        ratio: '1:1',
        usePhotoAsReference: true,
        imageBase64: '',
        imageUrl: ''
      };

      if (isLocalFile) {
        const base64Str = await this.readFileAsBase64(imageUrl);
        payload.imageBase64 = base64Str || '';
      } else if (imageUrl) {
        payload.imageUrl = imageUrl; // 公网 HTTPS 地址
      }

      const result = await generateAiPoster(payload);
      if (!result) {
        this.setData({ isAiGenerating: false });
        return;
      }

      // Base64 -> 临时文件（可保存到相册）；否则直接用 CDN URL
      if (result.imageBase64) {
        const fs = wx.getFileSystemManager();
        const filePath = wx.env.USER_DATA_PATH + '/ai_poster_' + Date.now() + '.png';
        fs.writeFile({
          filePath,
          data: result.imageBase64,
          encoding: 'base64',
          success: () => {
            this.setData({ aiPosterPath: filePath, isAiGenerating: false });
            wx.showToast({ title: 'AI 海报已生成', icon: 'success' });
          },
          fail: (err) => {
            console.error('write ai poster failed', err);
            this.setData({ isAiGenerating: false });
          }
        });
      } else if (result.imageUrl) {
        this.setData({ aiPosterPath: result.imageUrl, isAiGenerating: false });
        wx.showToast({ title: 'AI 海报已生成', icon: 'success' });
      } else {
        this.setData({ isAiGenerating: false });
      }
    } catch (err) {
      console.error('AI redraw error:', err);
      this.setData({ isAiGenerating: false });
      wx.showToast({ title: 'AI 重绘失败', icon: 'none' });
    }
  },

  // 读取本地临时图片为 base64
  readFileAsBase64(filePath) {
    return new Promise((resolve) => {
      wx.getFileSystemManager().readFile({
        filePath,
        encoding: 'base64',
        success: (data) => resolve('data:image/jpeg;base64,' + data.data),
        fail: () => resolve('')
      });
    });
  },

  // 保存 AI 重绘海报到相册
  saveAiPoster() {
    const { aiPosterPath } = this.data;
    if (!aiPosterPath) return;

    if (aiPosterPath.indexOf('http') === 0) {
      // CDN URL 需先下载为本地文件
      wx.downloadFile({
        url: aiPosterPath,
        success: (res) => {
          if (res.statusCode === 200) {
            this.saveToAlbum(res.tempFilePath);
          } else {
            wx.showToast({ title: '下载失败', icon: 'none' });
          }
        },
        fail: () => wx.showToast({ title: '下载失败', icon: 'none' })
      });
    } else {
      this.saveToAlbum(aiPosterPath);
    }
  },

  saveToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('auth') !== -1) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许小程序访问您的相册以保存海报',
            success: (modalRes) => {
              if (modalRes.confirm) wx.openSetting();
            }
          });
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: `「${this.data.currentQuoteText.slice(0, 20)}...」- 拾光半格 电影帧`,
      path: '/pages/index/index'
    };
  }
});
