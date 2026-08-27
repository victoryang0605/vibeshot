<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 拾光半格 · 随手拍变身高级电影帧

随手拍瞬间变身高级电影帧与情绪色卡拍立得。AI 智能提取潘通色号、生成王家卫/日系极简电影台词，一键排版导出高格调社交卡片。后端 AI 由 Agnes AI 免费全模态 API 提供。

View your app in AI Studio: https://ai.studio/apps/9ce3b6e7-8087-4729-898e-dc818748517c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `AGNES_API_KEY` in [.env](.env) to your Agnes AI API key
   (免费注册获取：https://platform.agnes-ai.com → Settings → API Keys；`server.ts` 通过 dotenv 读取 `.env`)
3. Run the app:
   `npm run dev`

> 本工程后端 AI 已从 Google Gemini 迁移至 **Agnes AI 免费全模态 API**（OpenAI 兼容）：
> - 照片识图：`agnes-2.5-flash`（`POST /v1/chat/completions`）
> - AI 重绘海报：`agnes-image-2.1-flash`（`POST /v1/images/generations`）
> - 国内节点可在 `.env.local` 将 `AGNES_BASE_URL` 改为 `https://api.agnes-ai.cn/v1`
> - 详细配置见 [.env.example](.env.example)
