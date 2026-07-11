# ZenMind Server — 多阶段 Docker 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc --build --force

# 运行阶段
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD curl -f http://localhost:3000/api/health || exit 1
CMD ["node", "dist/main"]