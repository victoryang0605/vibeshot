# 拾光半格 后端镜像（Express + Agnes AI）
# 使用官方 node 镜像（云托管对官方常用镜像有缓存加速，拉取稳定）
FROM node:20-slim

WORKDIR /app

# 依赖使用国内 npm 镜像（npmmirror），避免直连 npm 官方源超时
RUN npm config set registry https://registry.npmmirror.com

# 先装依赖（利用层缓存；lockfile 已指向 npmmirror，npm ci 直接命中）
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# 拷贝源码并构建（vite build 产出 Web 静态资源，esbuild 打包 server -> dist/server.cjs）
COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

# ESM 产物（import.meta 在 ESM 下正常工作）
CMD ["node", "dist/server.mjs"]
