# 📁 项目结构

## 最终架构

```
product_show/                    # 主项目（前端）
│
├── package.json                 # 前端依赖
├── node_modules/                # 前端依赖包
├── .env                         # 配置文件
├── .gitignore
│
├── src/                         # 前端源代码
│   ├── App.tsx                  # 主应用
│   ├── components/              # UI组件
│   └── lib/
│       ├── bestsellers.ts       # 本地爆款数据库
│       ├── bestsellers-api.ts   # 实时爬虫API客户端
│       └── types.ts             # 类型定义
│
├── functions/                   # Cloudflare Functions
│   └── api/
│       ├── analyze-product.ts   # AI产品分析
│       ├── analyze-style.ts     # AI风格分析
│       ├── generate-single.ts   # 单图生成
│       └── generate-batch.ts    # 批量生成
│
└── api-server/                  # 🆕 独立的后端服务
    ├── package.json             # 后端依赖（独立）
    ├── node_modules/            # 后端依赖包（独立）
    ├── tsconfig.json
    ├── .gitignore
    ├── README.md
    └── src/
        ├── index.ts             # API服务器入口
        └── scraper.ts           # Temu爬虫引擎
```

## 依赖分离

### 主项目 (package.json)

```json
{
  "dependencies": {
    "react": "前端框架",
    "vite": "构建工具",
    "tailwindcss": "样式",
    "@google/genai": "AI功能"
  }
}
```

### API 服务器 (api-server/package.json)

```json
{
  "dependencies": {
    "express": "API服务器",
    "cors": "跨域支持",
    "puppeteer": "浏览器自动化",
    "axios": "HTTP请求"
  }
}
```

## 数据流

### 本地数据库模式（默认）

```
用户上传产品图
    ↓
AI分析产品类型
    ↓
从 src/lib/bestsellers.ts 获取爆款
    ↓
显示爆款列表
    ↓
生成产品图
```

### 实时爬虫模式（可选）

```
用户上传产品图
    ↓
AI分析产品类型
    ↓
前端 → api-server (HTTP)
    ↓
api-server/src/scraper.ts
    ↓
打开Temu网站爬取数据
    ↓
返回实时爆款数据
    ↓
显示爆款列表
    ↓
生成产品图
```

## 启动方式

### 开发环境

**仅前端（使用本地数据）**：

```bash
npm run dev
```

**前端 + 实时爬虫**：

```bash
# 终端1：启动爬虫API
npm run api-server

# 终端2：启动前端
npm run dev
```

### 生产环境

**前端部署**：

```bash
npm run build
# 部署 dist/ 到 Cloudflare Pages
```

**API 服务器部署**（如果需要实时爬虫）：

```bash
cd api-server
npm install
npm start  # 或使用 PM2
```

## 核心特性

1. **完全独立**

   - api-server 是独立的 npm 包
   - 有自己的 package.json 和 node_modules
   - 可以单独部署、单独版本控制

2. **依赖隔离**

   - 前端：React、Vite 等
   - 后端：Express、Puppeteer 等
   - 互不干扰，避免冲突

3. **灵活切换**

   - 默认使用本地数据（快速）
   - 可选开启实时爬虫（最新）
   - 通过 .env 文件配置

4. **清晰架构**
   - src/ = 前端
   - functions/ = Cloudflare 边缘函数
   - api-server/ = 独立后端服务
   - 各司其职，易于维护

## 文件说明

| 文件/目录                  | 说明           | 是否提交 Git |
| -------------------------- | -------------- | ------------ |
| `package.json`             | 主项目配置     | ✅ 是        |
| `api-server/package.json`  | API 服务器配置 | ✅ 是        |
| `node_modules/`            | 主项目依赖     | ❌ 否        |
| `api-server/node_modules/` | API 服务器依赖 | ❌ 否        |
| `.env`                     | 环境配置       | ❌ 否        |
| `dist/`                    | 构建输出       | ❌ 否        |

## 总结

✅ **清晰分离**：前端和后端完全独立  
✅ **按需使用**：默认轻量，可选扩展  
✅ **易于部署**：各部分可独立部署  
✅ **专业架构**：符合工业标准
