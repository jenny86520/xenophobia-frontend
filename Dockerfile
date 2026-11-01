# syntax=docker/dockerfile:1
# XenoPhobiA 公開前台映像（Next standalone）。用法見根目錄 deploy/README.md。
#   build arg NEXT_PUBLIC_BACKEND_URL：瀏覽器連得到的後端位址（圖片與影片網址），建置時寫入
#   build arg DEPLOYMENT_ID：部署代號（換版腳本帶入 commit）。換版後，舊版開著的頁面會改為整頁重新載入；不設定時沒有這個保護
#   執行時 BACKEND_URL：前台伺服器呼叫後端的位址（容器內部網路）

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_BACKEND_URL
ARG DEPLOYMENT_ID
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_DEPLOYMENT_ID=$DEPLOYMENT_ID \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -n "$NEXT_PUBLIC_BACKEND_URL" || (echo "缺少 build arg NEXT_PUBLIC_BACKEND_URL" >&2; exit 1)
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/brand/xpa-logo.png').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "server.js"]
