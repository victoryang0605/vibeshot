// utils/api.js
const { PRESET_PHOTOS } = require('./presets.js');

// 微信小程序端 AI 色彩与电影帧分析接口
// ------------------------------------------------------------
// 后端地址：微信云托管线上域名（已上线）
//   https://shiguang-api-303051-10-1336030908.sh.run.tcloudbase.com
// 本机联调时可将 API_BASE 临时改为局域网地址（如 http://192.168.x.x:3000，
// 真机需与电脑同一 WiFi），联调完务必改回线上域名。
// ------------------------------------------------------------
const API_BASE = 'https://shiguang-api-303051-10-1336030908.sh.run.tcloudbase.com';

// 登录后自动带上 token，让后端把 AI 使用关联到用户（用于留存统计）
function authHeader() {
  const token = wx.getStorageSync('vibeshot_token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function analyzePhotoVibe({ imageBase64, photoTitle }) {
  return new Promise((resolve) => {
    wx.showLoading({ title: 'AI 萃取情绪色标...', mask: true });

    wx.request({
      url: `${API_BASE}/api/vibeshot/analyze`,
      method: 'POST',
      data: {
        imageBase64: imageBase64 || '',
        photoTitle: photoTitle || '随手拍日常'
      },
      header: {
        'content-type': 'application/json',
        ...authHeader()
      },
      timeout: 120000,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data) {
          resolve(res.data);
        } else {
          // 降级使用高保真预设
          resolve(getFallbackData(photoTitle));
        }
      },
      fail: (err) => {
        console.warn('Network error, using local fallback:', err);
        wx.hideLoading();
        resolve(getFallbackData(photoTitle));
      }
    });
  });
}

// AI 重绘电影海报（后端走 Agnes Image 2.1 Flash 免费生图）
// params: { prompt, imageBase64?, imageUrl?, size?, ratio?, usePhotoAsReference? }
function generateAiPoster(params) {
  return new Promise((resolve) => {
    wx.showLoading({ title: 'AI 重绘电影海报中...', mask: true });

    wx.request({
      url: `${API_BASE}/api/vibeshot/generate-image`,
      method: 'POST',
      data: {
        prompt: params.prompt || '电影感海报，高级胶片质感',
        imageBase64: params.imageBase64 || '',
        imageUrl: params.imageUrl || '',
        size: params.size || '1024x1024',
        ratio: params.ratio || '1:1',
        usePhotoAsReference: !!params.usePhotoAsReference
      },
      header: {
        'content-type': 'application/json',
        ...authHeader()
      },
      timeout: 300000, // 生图耗时较长，最长 5 分钟
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && (res.data.imageDataUrl || res.data.imageUrl)) {
          resolve(res.data);
        } else {
          const msg = (res.data && res.data.error) ? res.data.error : '生图服务异常';
          wx.showToast({ title: msg, icon: 'none' });
          resolve(null);
        }
      },
      fail: (err) => {
        console.warn('AI redraw network error:', err);
        wx.hideLoading();
        wx.showToast({ title: '网络异常，重绘失败', icon: 'none' });
        resolve(null);
      }
    });
  });
}

// 微信一键登录：wx.login 拿 code -> 后端换 openid 并自动注册，返回 token + user
function wxLogin() {
  return new Promise((resolve) => {
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.showToast({ title: '微信登录失败', icon: 'none' });
          resolve(null);
          return;
        }
        wx.request({
          url: `${API_BASE}/api/auth/login`,
          method: 'POST',
          data: { code: loginRes.code },
          header: { 'content-type': 'application/json' },
          timeout: 30000,
          success: (res) => {
            if (res.statusCode === 200 && res.data && res.data.token) {
              resolve(res.data);
            } else {
              const msg = (res.data && res.data.error) ? res.data.error : '登录失败';
              wx.showToast({ title: msg, icon: 'none' });
              resolve(null);
            }
          },
          fail: () => {
            wx.showToast({ title: '网络异常，登录失败', icon: 'none' });
            resolve(null);
          }
        });
      },
      fail: () => {
        wx.showToast({ title: '微信登录失败', icon: 'none' });
        resolve(null);
      }
    });
  });
}

// 更新用户资料（昵称）
function updateProfile(token, { nickName }) {
  return new Promise((resolve) => {
    wx.request({
      url: `${API_BASE}/api/auth/profile`,
      method: 'POST',
      data: { nickName },
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000,
      success: (res) => {
        if (res.statusCode === 200 && res.data) resolve(res.data.user);
        else resolve(null);
      },
      fail: () => resolve(null)
    });
  });
}

function getFallbackData(photoTitle) {
  return {
    id: String(Date.now()),
    timestamp: Date.now(),
    photoTitle: photoTitle || '午后燕麦拿铁',
    colorPalette: PRESET_PHOTOS[0].fallbackColors,
    quotes: {
      wongKarWai: {
        monologue: '那天下午 4 点零 3 分，我和这杯咖啡的距离只有 0.01 公分。57 个小时之后，我彻底放下了昨天的执念。',
        english: 'At 4:03 PM, I was only 0.01 cm away from this view. 57 hours later, the obsession vanished.',
        timecode: '04:03:19',
        scene: '午后街角 0.01公分',
      },
      japaneseMinimal: {
        line: '风穿过窗台的时候，光线刚好落在杯沿上。平凡的生活，本身就是不期而遇的奇迹。',
        english: 'When the breeze crossed the sill, sunlight rested on the cup. Ordinary life is a miracle.',
        season: '初秋 · 阳光微温',
      },
      frenchChic: {
        editorial: '无需解释的松弛感，比一切刻意修饰的滤镜都更迷人。保持 30% 的神秘与 70% 的从容。',
        english: 'Effortless chic is the ultimate luxury. 30% mystery, 70% unbothered peace.',
        issue: 'VIBESHOT / ISSUE 08',
      },
      lateNight: {
        cureText: '借着温热的气息，把今天所有的兵荒马乱折叠存进记忆。慢慢来，一切皆有回甘。',
        english: 'Folding today’s chaos away into the dusk. Take it slow, sweetness follows.',
        midnightTime: '04:15 PM',
      },
    },
    moodDNA: {
      dominantMood: '95% 城市漫游者的午后松弛',
      vibeKeywords: ['燕麦暖调', '慢生活', '物哀美学', '胶片颗粒'],
      bpmScore: '68 BPM · 慵懒慢调爵士',
      weatherFeel: '16:00 晴朗微风 · 24°C',
      scentNote: '前调：烤杏仁 | 中调：热燕麦奶 | 尾调：雪松与香草',
      bgmTrack: {
        title: 'Coffee in the Rain',
        artist: 'Lofi Beats & Bill Evans',
        genre: 'Warm Acoustic Jazz',
      },
    },
  };
}

module.exports = {
  analyzePhotoVibe,
  generateAiPoster,
  wxLogin,
  updateProfile
};
