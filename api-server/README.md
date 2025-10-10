# 🕷️ 实时爬虫 API 服务器

独立的 Node.js 服务，提供实时 Temu 爆款搜索功能。

## 📁 项目结构

```
api-server/
├── package.json         # 独立的包配置
├── tsconfig.json        # TypeScript 配置
├── .gitignore
├── node_modules/        # 独立的依赖
└── src/
    ├── index.ts         # API 服务器入口
    └── scraper.ts       # Temu 爬虫引擎
```

## 🚀 快速开始

### 1. 安装依赖

从主项目安装（推荐）：

```bash
npm run api-server:install
```

或手动安装：

```bash
cd api-server
npm install
cd ..
```

### 2. 启动服务器

从主项目启动：

```bash
npm run api-server
```

或在 api-server 目录内启动：

```bash
cd api-server
npm start
```

### 3. 配置前端

在**主项目根目录**创建 `.env` 文件：

```env
VITE_USE_LIVE_SCRAPER=true
VITE_SCRAPER_API_URL=http://localhost:3001
```

### 4. 启动前端

```bash
npm run dev
```

---

## 📡 API 接口

### 健康检查

```bash
GET http://localhost:3001/health
```

响应：

```json
{
  "status": "ok",
  "scraperInitialized": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 搜索爆款（推荐）

```bash
POST http://localhost:3001/api/search-bestsellers
Content-Type: application/json

{
  "keywords": ["womens", "jeans"]
}
```

### 搜索单个关键词

```bash
GET http://localhost:3001/api/search/womens%20jeans
```

---

## 🧪 测试爬虫

### 快速测试（推荐）

直接运行测试脚本，可以看到爬虫运行过程：

```bash
cd api-server
npm run test:visible
```

这会：

- ✅ 打开浏览器窗口，可以看到实际运行过程
- ✅ 显示详细的流程日志
- ✅ 使用隐身模式
- ✅ 只爬取 3 个产品（快速测试）

### 其他测试命令

```bash
# 无头模式测试（看不到浏览器）
npm run test:scraper

# 启动 API 服务器并显示浏览器
npm run start:visible
```

---

## ⚙️ 配置选项

### 环境变量

| 变量           | 说明             | 默认值  | 示例              |
| -------------- | ---------------- | ------- | ----------------- |
| `PORT`         | API 服务器端口   | `3001`  | `PORT=3001`       |
| `HEADLESS`     | 是否隐藏浏览器   | `true`  | `HEADLESS=false`  |
| `DEBUG`        | 是否显示详细日志 | `false` | `DEBUG=true`      |
| `MAX_PRODUCTS` | 最多爬取产品数   | `10`    | `MAX_PRODUCTS=20` |

**示例：启动时显示浏览器和调试信息**

```bash
# Windows PowerShell
$env:HEADLESS="false"; $env:DEBUG="true"; npm start

# Windows CMD
set HEADLESS=false && set DEBUG=true && npm start

# Linux/Mac
HEADLESS=false DEBUG=true npm start
```

### 爬虫参数

编辑 `src/index.ts` 或使用环境变量：

```typescript
const scraper = new TemuScraper({
  headless: true, // 无头模式（不显示浏览器）
  maxProducts: 10, // 最多返回10个产品
  downloadImages: false, // 不下载图片到本地
  delay: 1500, // 请求间隔（毫秒）
  incognito: true, // 🕶️ 隐身模式（避免被检测）
  timeout: 60000, // ⏱️ 页面加载超时（毫秒）
  debug: false, // 📊 调试模式（详细日志）
});
```

---

## 🏗️ 架构特点

### 独立包设计

- ✅ **完全独立**：有自己的 `package.json`、`node_modules`、`tsconfig.json`
- ✅ **依赖隔离**：Express、CORS 等不会污染主项目
- ✅ **灵活部署**：可以单独部署到任何服务器
- ✅ **清晰架构**：前后端完全分离

### 依赖

```
api-server/ (完全独立)
├── Express          ← API 服务器
├── CORS             ← 跨域支持
├── Puppeteer        ← 浏览器自动化
├── Axios            ← HTTP 请求
└── src/
    ├── index.ts     ← API 路由
    └── scraper.ts   ← 爬虫逻辑
```

---

## 🚀 部署

### 方案 1：独立部署

只部署 `api-server/` 目录：

```bash
# 1. 复制到服务器
scp -r api-server/ user@server:/app/

# 2. 在服务器上安装和启动
cd /app
npm install
pm2 start npm --name "scraper-api" -- start
```

### 方案 2：Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src/ ./src/

RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3001

CMD ["npm", "start"]
```

构建和运行：

```bash
cd api-server
docker build -t scraper-api .
docker run -p 3001:3001 scraper-api
```

### 方案 3：定期爬取（推荐生产环境）

不要在生产环境实时爬取，而是定期更新：

```bash
# 每天凌晨3点运行爬虫
0 3 * * * cd /path/to/project && npm run scrape
```

---

## 🐛 故障排除

### ⚠️ 问题 0：爬虫显示白屏 / 找不到产品（重要！）

**症状**：爬虫运行但返回 0 个产品，或页面显示白屏

**原因**：Temu 有强大的反爬虫机制，可能显示验证码或阻止访问

**解决方案**：

#### 第一步：诊断问题

```bash
cd api-server
npm run test:diagnose
```

这会：

- ✅ 打开浏览器让你看到实际情况
- ✅ 保存页面截图到 `data/bestsellers/`
- ✅ 记录所有 API 请求

#### 第二步：查看截图

检查 `data/bestsellers/` 目录中的截图：

- `homepage-*.png` - 首页截图
- `search-*.png` - 搜索页面截图
- `api-requests-*.json` - API 请求记录（重要！）

#### 第三步：根据情况处理

**如果看到验证码**：

1. 阅读 `QUICK_FIX.md` - 快速修复指南
2. 阅读 `TEMU_API_GUIDE.md` - API 逆向指南（推荐！）
3. 考虑使用代理 IP 或 API 方案

**如果页面正常但无产品**：

- 查看 `search-*.html` 分析页面结构
- 可能需要更新选择器

**如果发现 API 请求**：

- 分析 `api-requests-*.json` 文件
- 使用 `temu-api.template.ts` 实现 API 调用（最佳方案！）

#### 推荐方案：使用 API 而非爬页面

根据 Reddit 讨论，Temu 使用内部 API。直接调用 API 比爬取页面更可靠：

1. 运行诊断找到 API 端点
2. 分析签名生成逻辑
3. 使用 `temu-api.template.ts` 模板实现

详细步骤请查看：

- 📖 `QUICK_FIX.md` - 快速修复
- 📖 `TEMU_API_GUIDE.md` - API 完整指南

---

### 问题 1：找不到模块

**症状**：`Cannot find module 'express'`

**解决**：

```bash
cd api-server
npm install
```

### 问题 2：无法启动浏览器

**症状**：`Error: Failed to launch browser`

**解决**：

```bash
# 安装系统依赖
# Ubuntu/Debian
sudo apt-get install -y chromium-browser

# Windows/macOS
# Puppeteer 会自动下载 Chromium
npm install
```

### 问题 3：CORS 错误

**解决**：编辑 `src/index.ts`：

```typescript
app.use(
  cors({
    origin: "http://localhost:5173", // 你的前端地址
    credentials: true,
  })
);
```

---

## 📚 更多信息

查看主项目 `README.md` 了解完整使用说明。

---

## ⚠️ 重要提示

1. **仅用于学习和研究目的**
2. **遵守 Temu 服务条款**
3. **不要过度频繁请求**
4. **商业使用需咨询法律顾问**

---

## 🎯 最佳实践

- 🧪 **开发阶段**：使用实时爬虫
- 🚀 **生产阶段**：定期爬取 + 本地数据库
- 💼 **商业阶段**：使用官方 API

**记住**：爬虫只是起步工具！🚀
