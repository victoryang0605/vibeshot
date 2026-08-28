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

  // 使用微信小程序 Canvas 2D 绘制海报（对齐 studio 拍立得模板样式）
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
        // 画布尺寸：750 宽，按 studio 拍立得（620rpx）等比放大
        const width = 750;
        const height = 1260;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const vibeData = app.globalData.currentVibeResult;
        const imageUrl = app.globalData.currentImageUrl;
        const quote = app.globalData.customQuote || (vibeData.quotes.wongKarWai && vibeData.quotes.wongKarWai.monologue) || '';
        const quoteEN = app.globalData.customQuoteEN || (vibeData.quotes.wongKarWai && vibeData.quotes.wongKarWai.english) || '';

        // 日期戳（与 studio 的 dateFormatted 同格式）
        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

        // ===== 布局（对齐 studio 拍立得：卡片 padding 24rpx、照片 1:1 方形）=====
        const cardPad = 29;          // 卡片内边距
        const photoSize = 692;       // 照片区 1:1 方形
        const photoX = cardPad;
        const photoY = cardPad;
        const bottomY = photoY + photoSize;

        // 1. 卡片暖白底色（与 studio 一致 #fcfbf9）
        ctx.fillStyle = '#fcfbf9';
        ctx.fillRect(0, 0, width, height);

        // 2. 照片（cover 等比裁剪 + 圆角）
        try {
          const img = canvas.createImage();
          img.src = imageUrl;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          const iw = img.width || photoSize;
          const ih = img.height || photoSize;
          const scale = Math.max(photoSize / iw, photoSize / ih);
          const dw = iw * scale;
          const dh = ih * scale;
          const dx = photoX + (photoSize - dw) / 2;
          const dy = photoY + (photoSize - dh) / 2;

          ctx.save();
          this.roundRect(ctx, photoX, photoY, photoSize, photoSize, 8);
          ctx.clip();
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();

          // 3. 日期戳（照片右下角，与 studio 一致：橙字 + 半透明黑底）
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          this.roundRect(ctx, photoX + photoSize - 150, photoY + photoSize - 48, 122, 32, 4);
          ctx.fill();
          ctx.fillStyle = '#ea580c';
          ctx.font = '20px monospace';
          ctx.fillText(dateStr, photoX + photoSize - 140, photoY + photoSize - 25);

          // 4. 情绪潘通色块行（圆点 + hex，与 studio 一致）
          let swatchX = photoX;
          const swatchY = bottomY + 32;
          const colors = vibeData.colorPalette || [];
          colors.forEach((c) => {
            ctx.fillStyle = c.hex;
            ctx.beginPath();
            ctx.arc(swatchX + 14, swatchY + 14, 14, 0, Math.PI * 2);
            ctx.fill();
            swatchX += 42;
          });
          ctx.fillStyle = '#78716c';
          ctx.font = '22px monospace';
          ctx.fillText(colors[0]?.hex || '#3E2723', swatchX + 8, swatchY + 21);

          // 5. 中文台词（颜色/字体与 studio 一致：serif #292524）
          ctx.fillStyle = '#292524';
          ctx.font = 'bold 34px serif';
          const cnText = (quote || '').length > 60 ? quote.slice(0, 60) + '…' : quote;
          const cnEndY = this.wrapText(ctx, `“ ${cnText} ”`, photoX, swatchY + 76, photoSize, 56);

          // 6. 英文译文（与 studio 一致：sans #78716c 斜体）
          if (quoteEN) {
            ctx.fillStyle = '#78716c';
            ctx.font = 'italic 22px sans-serif';
            this.wrapText(ctx, quoteEN, photoX + 6, cnEndY + 40, photoSize - 12, 32);
          }

          // 7. 底部虚线分隔 + 条码/品牌水印（与 studio 一致）
          const footerLineY = height - 86;
          const footerTextY = height - 52;
          ctx.strokeStyle = '#d6d3d1';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(photoX, footerLineY);
          ctx.lineTo(photoX + photoSize, footerLineY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#a8a29e';
          ctx.font = '20px monospace';
          ctx.fillText('||||| ||| ||||||| 0.01cm', photoX, footerTextY);
          ctx.fillText('EMOTION CODE · VIBESHOT', width - photoX - 260, footerTextY);

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

  // 圆角矩形路径
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  // Canvas 文本换行工具（返回最后一行结束的 y 坐标）
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
    return y;
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
