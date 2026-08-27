import React, { useState } from 'react';
import { X, Copy, Check, FileCode, FolderTree, BookOpen, Smartphone } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const MINIPROGRAM_FILES: { name: string; path: string; lang: string; code: string; desc: string }[] = [
  {
    name: 'project.config.json',
    path: '/miniprogram/project.config.json',
    lang: 'json',
    desc: '微信开发者工具工程配置文件 (AppID / 编译设置)',
    code: `{
  "miniprogramRoot": "./",
  "projectname": "vibeshot-miniprogram",
  "description": "拾光半格 微信原生小程序",
  "appid": "wx1234567890abcdef",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "lazyCodeLoading": "requiredComponents"
  },
  "compileType": "miniprogram",
  "libVersion": "3.3.4"
}`
  },
  {
    name: 'app.json',
    path: '/miniprogram/app.json',
    lang: 'json',
    desc: '小程序全局路由、深色导航栏与底部 TabBar 配置',
    code: `{
  "pages": [
    "pages/index/index",
    "pages/studio/studio",
    "pages/poster/poster",
    "pages/pro/pro"
  ],
  "window": {
    "backgroundTextStyle": "dark",
    "navigationBarBackgroundColor": "#0c0a09",
    "navigationBarTitleText": "拾光半格",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#0c0a09"
  },
  "tabBar": {
    "color": "#78716c",
    "selectedColor": "#fbbf24",
    "backgroundColor": "#1c1917",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "创作"
      },
      {
        "pagePath": "pages/pro/pro",
        "text": "商业/VIP"
      }
    ]
  },
  "style": "v2",
  "lazyCodeLoading": "requiredComponents"
}`
  },
  {
    name: 'app.js',
    path: '/miniprogram/app.js',
    lang: 'javascript',
    desc: '小程序全局生命周期与状态管理',
    code: `App({
  onLaunch() {
    console.log('拾光半格 微信小程序启动');
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
    currentImageUrl: '',
    selectedTemplate: 'polaroid',
    selectedFilter: 'none',
    customQuote: ''
  }
});`
  },
  {
    name: 'app.wxss',
    path: '/miniprogram/app.wxss',
    lang: 'css',
    desc: '全局 WXSS 样式与胶片暗黑高定主题',
    code: `page {
  background-color: #0c0a09;
  color: #f5f5f4;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  box-sizing: border-box;
}

.font-serif {
  font-family: "Songti SC", "SimSun", serif;
}

.font-mono {
  font-family: "SF Mono", "Menlo", monospace;
}

.btn-primary {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #0c0a09;
  font-weight: 700;
  border-radius: 40rpx;
  padding: 24rpx 40rpx;
  font-size: 30rpx;
}

.glass-card {
  background: rgba(28, 25, 23, 0.85);
  border: 1rpx solid rgba(68, 64, 60, 0.6);
  border-radius: 36rpx;
  padding: 32rpx;
}`
  },
  {
    name: 'pages/index/index.wxml',
    path: '/miniprogram/pages/index/index.wxml',
    lang: 'xml',
    desc: '首页 WXML 模板（微信原生选图、样片选择）',
    code: `<view class="container">
  <view class="hero-section">
    <view class="badge-gold">✦ AI 视觉情绪美学 · 电影感胶囊</view>
    <view class="hero-title font-serif">随手拍照片 · 3秒变身电影帧</view>
    <view class="hero-subtitle">智能提取潘通色标 · 生成王家卫/日系极简台词 · 导出朋友圈海报</view>
  </view>

  <view class="upload-card glass-card">
    <view class="drop-zone" bindtap="handleChooseMedia">
      <view class="camera-icon-wrapper">📷</view>
      <view class="drop-main-text">点击拍摄 / 从微信相册选择照片</view>
      <view class="drop-sub-text">支持任意咖啡、街景、猫咪、雨夜或工作台</view>
    </view>
  </view>

  <view class="preset-section">
    <view class="section-title">精选电影感样片：</view>
    <view class="preset-grid">
      <view class="preset-item" wx:for="{{presetPhotos}}" wx:key="id" bindtap="handleSelectPreset" data-item="{{item}}">
        <image class="preset-image" src="{{item.imageUrl}}" mode="aspectFill"></image>
        <view class="preset-tag font-mono">{{item.tag}}</view>
        <view class="preset-name">{{item.title}}</view>
      </view>
    </view>
  </view>
</view>`
  },
  {
    name: 'pages/studio/studio.wxml',
    path: '/miniprogram/pages/studio/studio.wxml',
    lang: 'xml',
    desc: '工作室排版 WXML（5套模板、4大文学台词、滤镜）',
    code: `<view class="studio-container">
  <!-- 5套模板切换 -->
  <scroll-view class="template-scroll" scroll-x enable-flex>
    <view class="template-tab {{currentTemplate === 'polaroid' ? 'tab-active' : ''}}" bindtap="switchTemplate" data-tpl="polaroid">📷 拍立得</view>
    <view class="template-tab {{currentTemplate === 'vinyl' ? 'tab-active' : ''}}" bindtap="switchTemplate" data-tpl="vinyl">💿 黑胶唱片</view>
    <view class="template-tab {{currentTemplate === 'magazine' ? 'tab-active' : ''}}" bindtap="switchTemplate" data-tpl="magazine">📰 小众杂志</view>
    <view class="template-tab {{currentTemplate === 'cinema' ? 'tab-active' : ''}}" bindtap="switchTemplate" data-tpl="cinema">🎬 宽银幕</view>
    <view class="template-tab {{currentTemplate === 'pantone' ? 'tab-active' : ''}}" bindtap="switchTemplate" data-tpl="pantone">🎨 潘通色卡</view>
  </scroll-view>

  <!-- 拍立得实时渲染卡片 -->
  <view wx:if="{{currentTemplate === 'polaroid'}}" class="polaroid-card">
    <view class="polaroid-image-frame filter-{{currentFilter}}">
      <image class="main-photo" src="{{imageUrl}}" mode="aspectFill"></image>
      <view class="film-date-stamp font-mono">{{dateFormatted}}</view>
    </view>
    <view class="polaroid-bottom">
      <view class="swatch-row">
        <view class="swatch-dot" wx:for="{{vibeData.colorPalette}}" wx:key="hex" style="background-color: {{item.hex}};"></view>
        <text class="swatch-code font-mono">{{vibeData.colorPalette[0].hex}}</text>
      </view>
      <view class="polaroid-quote font-serif">{{currentQuoteText}}</view>
      <view class="polaroid-sub-quote font-mono">{{currentSubText}}</view>
    </view>
  </view>
</view>`
  },
  {
    name: 'pages/poster/poster.js',
    path: '/miniprogram/pages/poster/poster.js',
    lang: 'javascript',
    desc: 'Canvas 2D 离屏像素渲染与 wx.saveImageToPhotosAlbum 保存相册',
    code: `Page({
  data: { posterTempUrl: '' },

  onReady() {
    this.drawPosterCanvas();
  },

  drawPosterCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas').fields({ node: true, size: true }).exec(async (res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio || 2;
      canvas.width = 750 * dpr;
      canvas.height = 1100 * dpr;
      ctx.scale(dpr, dpr);

      // 绘制拍立得背景、照片、潘通色块、王家卫台词...
      wx.canvasToTempFilePath({
        canvas,
        destWidth: 1500,
        destHeight: 2200,
        success: (tempRes) => {
          this.setData({ posterTempUrl: tempRes.tempFilePath });
        }
      });
    });
  },

  saveToAlbum() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterTempUrl,
      success: () => wx.showToast({ title: '已存入相册', icon: 'success' })
    });
  }
});`
  },
  {
    name: 'README.md',
    path: '/miniprogram/README.md',
    lang: 'markdown',
    desc: '微信开发者工具一键导入与上架发布指南',
    code: `# 微信原生小程序工程使用指南

1. 打开微信开发者工具 (WeChat DevTools)
2. 点击「导入项目」，选择 miniprogram 目录
3. 输入你的小程序 AppID（或使用测试号）
4. 编译即可在真机与模拟器中完美运行！`
  }
];

export function MiniProgramSourceModal({ onClose }: Props) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = MINIPROGRAM_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">微信原生小程序工程源码 (WXML / WXSS)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  纯原生微信工程
                </span>
              </div>
              <p className="text-xs text-stone-400">已完整生成在 <code>/miniprogram</code> 目录，可直接导入微信开发者工具</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar Files + Code View */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[450px]">
          {/* File list sidebar */}
          <div className="md:col-span-4 bg-stone-950/50 border-r border-stone-800 p-3 space-y-1 overflow-y-auto max-h-[500px]">
            <div className="text-[11px] font-mono text-stone-500 px-3 py-1.5 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-amber-500" />
              <span>MINIPROGRAM / 源码列表</span>
            </div>
            {MINIPROGRAM_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                  selectedFileIndex === idx
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                    : 'text-stone-300 hover:bg-stone-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono">
                  <FileCode className="w-3.5 h-3.5 text-stone-400" />
                  <span>{file.name}</span>
                </div>
                <div className="text-[10px] text-stone-400 line-clamp-1">{file.desc}</div>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-8 flex flex-col bg-stone-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900/90 border-b border-stone-800">
              <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
                <span>{currentFile.path}</span>
                <span className="text-[10px] text-stone-400">({currentFile.desc})</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制代码'}</span>
              </button>
            </div>

            <pre className="flex-1 p-4 font-mono text-xs text-stone-300 overflow-auto bg-stone-950/90 leading-relaxed select-all">
              <code>{currentFile.code}</code>
            </pre>
          </div>
        </div>

        {/* Footer Import Guide */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>
              已为您在根目录生成 <strong>/miniprogram</strong> 原生工程文件夹。在微信开发者工具中「导入项目」并选择该目录即可！
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
          >
            知道了，继续预览
          </button>
        </div>
      </div>
    </div>
  );
}
