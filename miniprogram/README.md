# 情绪色号 · VibeShot (微信原生小程序工程源码)

本项目为**纯原生微信小程序（WXML + WXSS + JS + JSON）**代码工程，采用高阶中式胶片、日系物哀与王家卫电影美学设计，完全适配微信公众平台小程序规范。

---

## 📁 目录结构

```text
miniprogram/
├── project.config.json       # 微信开发者工具项目配置
├── app.json                  # 全局路由、导航栏、底部 TabBar 配置
├── app.js                    # 小程序生命周期与全局数据
├── app.wxss                  # 全局样式与高定色彩变量
├── utils/
│   ├── api.js                # AI 情绪色彩与台词分析接口封装
│   └── presets.js            # 5 套高质感电影感样片数据
└── pages/
    ├── index/                # 首页：拍照 / 选图 / 样片体验
    │   ├── index.wxml
    │   ├── index.wxss
    │   ├── index.js
    │   └── index.json
    ├── studio/               # 工作室：5套排版模板 / 4大台词流派 / 胶片滤镜
    │   ├── studio.wxml
    │   ├── studio.wxss
    │   ├── studio.js
    │   └── studio.json
    ├── poster/               # 海报导出：Canvas 2D 离屏像素渲染与保存相册
    │   ├── poster.wxml
    │   ├── poster.wxss
    │   ├── poster.js
    │   └── poster.json
    └── pro/                  # 变现闭环：¥9.9 Pro会员购买与POD实体文创定制
        ├── pro.wxml
        ├── pro.wxss
        ├── pro.js
        └── pro.json
```

---

## 🚀 如何在微信开发者工具中打开并上线？

### 第一步：下载项目
1. 在 AI Studio 右上方菜单选择 **Export ZIP**，或将 `miniprogram` 文件夹导出到本地。

### 第二步：导入微信开发者工具
1. 打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 点击 **「导入项目」**。
3. **项目目录**：选择本地解压后的 `miniprogram` 文件夹。
4. **AppID**：填写你在微信公众平台申请的小程序 AppID（或选择测试号）。
5. **后端服务**：选择「不使用云服务」或按需开启。

### 第三步：配置合法域名
1. 登录 [微信公众平台 (mp.weixin.qq.com)](https://mp.weixin.qq.com)。
2. 进入 **开发管理 -> 开发设置 -> 服务器域名**。
3. 在 `request 合法域名` 中添加你的后端接口或云函数服务域名。

### 第四步：真机预览与上传发布d
1. 在微信开发者工具顶部点击 **「真机调试」** 或 **「预览」**，使用手机微信扫码体验。
2. 点击 **「上传」** 提交代码版本，在微信后台提交审核即可上架！
