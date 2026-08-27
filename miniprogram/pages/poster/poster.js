// pages/poster/poster.js
const app = getApp();

Page({
  data: {
    posterTempUrl: '',
    isGenerating: true
  },

  onReady() {
    this.drawPosterCanvas();
  },

  // 使用微信小程序 Canvas 2D 进行像素级海报绘制
  drawPosterCanvas() {
    wx.showLoading({ title: '海报高精度渲染中...', mask: true });

    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res[0] || !res[0].node) {
          wx.hideLoading();
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getSystemInfoSync().pixelRatio || 2;
        const width = 750;
        const height = 1100;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const vibeData = app.globalData.currentVibeResult;
        const imageUrl = app.globalData.currentImageUrl;
        const quote = app.globalData.customQuote || vibeData.quotes.wongKarWai.monologue;

        // 1. 绘制拍立得暖白底色
        ctx.fillStyle = '#fbf9f5';
        ctx.fillRect(0, 0, width, height);

        // 2. 绘制照片底图
        try {
          const img = canvas.createImage();
          img.src = imageUrl;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          // 照片区域
          const photoPadding = 40;
          const photoW = width - photoPadding * 2;
          const photoH = 680;

          ctx.drawImage(img, photoPadding, photoPadding, photoW, photoH);

          // 3. 绘制右下角胶片时间戳
          ctx.fillStyle = '#ea580c';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('2026.08.25', photoPadding + photoW - 170, photoPadding + photoH - 24);

          // 4. 绘制情绪潘通色块
          let swatchX = photoPadding;
          const swatchY = photoPadding + photoH + 40;
          const colors = vibeData.colorPalette || [];

          colors.forEach((c) => {
            ctx.fillStyle = c.hex;
            ctx.beginPath();
            ctx.arc(swatchX + 16, swatchY, 16, 0, Math.PI * 2);
            ctx.fill();
            swatchX += 44;
          });

          // 绘制色号文字
          ctx.fillStyle = '#78716c';
          ctx.font = '22px monospace';
          ctx.fillText(colors[0]?.hex || '#3E2723', swatchX + 10, swatchY + 8);

          // 5. 绘制中文诗意台词（多行自动换行）
          ctx.fillStyle = '#1c1917';
          ctx.font = 'bold 30px serif';
          this.wrapText(ctx, `“ ${quote} ”`, photoPadding, swatchY + 70, photoW, 44);

          // 6. 绘制底部条形码和水印
          ctx.strokeStyle = '#e7e5e4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(photoPadding, height - 70);
          ctx.lineTo(width - photoPadding, height - 70);
          ctx.stroke();

          ctx.fillStyle = '#a8a29e';
          ctx.font = '20px monospace';
          ctx.fillText('||||| ||| ||||||| 0.01cm', photoPadding, height - 36);
          ctx.fillText('EMOTION CODE · VIBESHOT', width - photoPadding - 280, height - 36);

          // 导出为临时图片路径
          wx.canvasToTempFilePath({
            canvas,
            x: 0,
            y: 0,
            width: width,
            height: height,
            destWidth: width * 2,
            destHeight: height * 2,
            success: (tempRes) => {
              wx.hideLoading();
              this.setData({
                posterTempUrl: tempRes.tempFilePath,
                isGenerating: false
              });
            },
            fail: (err) => {
              console.error('Canvas export error', err);
              wx.hideLoading();
            }
          });
        } catch (e) {
          console.error(e);
          wx.hideLoading();
        }
      });
  },

  // Canvas 文本换行工具
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('');
    let line = '';
    for (let n = 0; n < chars.length; n++) {
      const testLine = line + chars[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = chars[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  },

  // 保存到手机本地系统相册 (wx.saveImageToPhotosAlbum)
  saveToAlbum() {
    if (!this.data.posterTempUrl) return;

    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterTempUrl,
      success: () => {
        wx.showToast({
          title: '已保存到手机相册',
          icon: 'success'
        });
      },
      fail: (err) => {
        if (err.errMsg.indexOf('auth') !== -1) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许小程序访问您的相册以保存海报',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return {
      title: '这是我今天的心情色号电影海报，送你一张 💌',
      imageUrl: this.data.posterTempUrl || ''
    };
  }
});
