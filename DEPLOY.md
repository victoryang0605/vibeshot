# 拾光半格 小程序部署指南

> 部署分两条线：**后端服务**（AI 分析/生图接口，必须公网 HTTPS）和**小程序本体**（上传审核发布）。
> 小程序所有 AI 能力都通过 `wx.request` 调用后端 `/api/vibeshot/*` 接口，后端不部署好，小程序上线后 AI 功能不可用。

---

## 第一步：部署后端（二选一）

### 方案 A：微信云托管（推荐 · 免 ICP 备案 · 官方集成）

微信云托管提供 HTTPS 默认域名，**免备案**，可直接配置为小程序的 request 合法域名，个人开发者最省事。

1. 登录 [微信公众平台](https://mp.weixin.qq.com) → 左侧「云托管」→ 按引导开通（环境选你小程序的 AppID）。
2. 创建服务：
   - 服务名称：`vibeshot-api`
   - 上传方式：**代码包**（把整个项目目录打包 zip 上传，仓库根目录已带 `Dockerfile` 与 `.dockerignore`）或关联 Git 仓库
   - 语言/镜像：Docker（自动读取根目录 Dockerfile）
3. 服务配置：
   - **端口**：`3000`（与 Dockerfile 的 `EXPOSE 3000` 一致）
   - **环境变量**：
     | 变量 | 值 |
     |---|---|
     | `AGNES_API_KEY` | 你的 Agnes Key（国际站 Key 用国际节点） |
     | `AGNES_BASE_URL` | `https://apihub.agnes-ai.com/v1` |
     | `NODE_ENV` | `production` |
     | `WX_APPID` | 小程序 AppID（如 `wxcf4f812d0feb5ae8`） |
     | `WX_SECRET` | 小程序密钥（公众平台「开发管理 → 开发设置 → 小程序密钥」生成） |
4. 点击「发布」，等构建完成，拿到**默认 HTTPS 域名**（形如 `https://vibeshot-api-xxxx.weixincloud.run`）。
5. 验证：浏览器打开 `https://你的域名/api/health`，应返回 `{"status":"ok","provider":"agnes-ai"}`。

> ⚠️ **微信登录与数据存储**：
> - `WX_APPID` / `WX_SECRET` 用于「微信一键登录」（`wx.login` → `jscode2session`），**必须在服务端配置**，否则登录接口返回 500。
> - 用户数据默认存服务端 `data/` 文件（开发/测试用）。**云托管容器重启会清空文件数据**，正式上线请改用数据库（云托管 MySQL 或云开发），需要我帮忙接入可以说一声。

### 方案 B：云服务器（腾讯云/阿里云轻量，成本几十元/月）

1. 购买轻量服务器（2C2G 起步，系统选 Ubuntu 22.04 / Debian）。
2. **域名 + ICP 备案 + HTTPS 证书**（微信要求 request 合法域名必须是已备案的 https 域名，备案周期 1~2 周，请提前办理）。
3. 服务器上执行：
   ```bash
   # 安装 Node 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
   # 上传代码（git clone 或 scp）后：
   cd vibeshot
   npm install
   npm run build          # 产出 dist/（前端静态）和 dist/server.cjs
   npm i -g pm2
   pm2 start dist/server.cjs --name vibeshot
   pm2 save && pm2 startup
   ```
   - 服务默认监听 3000（可用环境变量 `PORT` 覆盖）。
   - 用 nginx 反代：`443 -> 127.0.0.1:3000`，配置 SSL 证书（certbot 一键签发）。
4. 验证：`https://你的域名/api/health` 返回 ok。

---

## 第二步：小程序后台配置（两方案通用）

登录 [微信公众平台](https://mp.weixin.qq.com)：

1. **服务器域名**：开发管理 → 开发设置 → 服务器域名 → `request 合法域名`
   - 添加后端域名，如 `https://vibeshot-api-xxxx.weixincloud.run`
   - ⚠️ 只填域名不填路径，必须 https，不要带 `http://IP`（IP 与 http 一律不合法）
2. **用户隐私保护指引**：设置 → 服务内容声明 → 用户隐私保护指引
   - 本项目用到了：相册（选择照片/保存图片到相册）、摄像头（拍摄）—— 逐项勾选声明，否则审核会被拒
3. **类目选择**：设置 → 基本设置 → 服务类目，选「工具 > 效率」或「摄影」相关类目
4. （可选）**微信支付**：pro 页的 ¥9.9 会员需要**企业主体**的微信支付商户号；个人主体无法开通，pro 页会停留在模拟支付

---

## 第三步：小程序代码切到线上地址并发布

1. 修改 `miniprogram/utils/api.js` 顶部：
   ```js
   // 把本机调试地址换成线上域名
   const API_BASE = 'https://你的线上域名';
   ```
2. 确认 `miniprogram/project.config.json` 的 `appid` 是你的真实 AppID（当前已是 `wxcf4f812d0feb5ae8`）。
3. 微信开发者工具 → 点右上角「上传」→ 填版本号与备注 → 提交。
4. 公众平台 → 版本管理 → 开发版本里找到刚上传的版本 → 「提交审核」。
5. 审核通过后（通常 1~7 天）→ 「发布」。

---

## 日常更新（一键推送）

代码改完后，在项目根目录执行一键推送（`git add/commit/push` 一步完成，推送后云托管流水线自动构建部署）：

```bash
push.bat                      # 自动提交（消息：update: 日期时间）
push.bat "feat: 新增XX功能"    # 带提交说明（建议英文/数字，中文在 cmd 下可能乱码）
# 或
npm run push -- "提交说明"
```

> 推送走 SSH（`~/.ssh/config` 已配置 `ssh.github.com:443` + 专属密钥 `id_ed25519_github`），国内网络稳定。
> 未提交的密钥/用户数据（`.env`、`data/`）已被 `.gitignore` 排除，不会进仓库。

## 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| 真机调试正常，预览/线上 AI 报网络错误 | 后端域名没加进 request 合法域名，或域名未备案/非 https |
| 点 AI 重绘提示「生图服务异常」 | 后端是旧版本（缺 `/generate-image` 端点）→ 重新部署最新 `server.ts`；或 `AGNES_API_KEY` 未配置 |
| 分析结果全是兜底文案 | `AGNES_API_KEY` 缺失/无效，或国内网络连不上国际节点 → 换 `AGNES_BASE_URL=https://apihub.agnes-ai.cn/v1`（国际备线，同一 Key 可用）|
| 代码包超 2MB（错误码 80051） | 不要把大图放 `miniprogram/` 内；本项目已本地化 5 张预设小图（共 181KB），正常包约 356KB |
| 本机 Web 端一切正常 | 说明后端代码没问题，问题在域名配置/部署环境 |

## 本机开发与线上切换速查

- **本机联调**：`npm run dev` 起后端（端口 3000），小程序 `API_BASE=http://<本机局域网IP>:3000`（开发者工具开启 urlCheck:false 可真机调试）。
- **上线**：后端按方案 A/B 部署 → 小程序 `API_BASE` 换 https 域名 → 上传审核发布。
