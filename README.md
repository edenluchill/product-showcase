# Product Show - AI 产品展示生成器

使用 AI 技术将模特照片和产品图片融合，自动生成精美的产品展示图。

## 技术栈

- **前端**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Cloudflare Functions (Workers)
- **AI**: Google Gemini API (gemini-2.0-flash-exp)

## 项目结构

```
product_show/
├── src/                    # 前端源代码
│   ├── components/        # React 组件
│   │   └── ui/           # shadcn/ui 组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── functions/            # Cloudflare Functions
│   └── api/
│       └── generate.ts   # 图片生成 API
├── dist/                 # 构建输出目录
├── public/               # 静态资源
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── wrangler.toml         # Cloudflare 配置
└── README.md
```

## 功能特点

1. **智能产品分析**: AI 自动识别产品类型和特征
2. **🆕 实时爆款搜索**: 真实爬取 Temu 网站，获取最畅销产品数据
3. **爆款模仿生成**: 分析爆款图片风格，批量生成同风格产品图
4. **多种生成角度**:
   - 正面穿着展示
   - 侧面穿着展示
   - 产品细节特写
   - 产品材质展示
   - 产品整体视图
5. **实时预览**: 上传后即时预览图片
6. **进度显示**: 生成过程中显示实时进度
7. **响应式设计**: 适配各种屏幕尺寸

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.dev.vars.example` 为 `.dev.vars`：

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars` 文件，填入你的 Gemini API Key：

```
GEMINI_API_KEY=your_actual_api_key_here
```

> 获取 API Key: https://makersuite.google.com/app/apikey

### 3. 启动开发服务器

**需要同时运行两个终端：**

终端 1 - 启动前端开发服务器（支持热更新）:

```bash
npm run dev
```

终端 2 - 启动 Functions 服务器:

```bash
npm run functions:dev
```

> 注意：首次运行 `functions:dev` 前需要先 `npm run build` 创建 dist 目录

### 4. 访问应用

打开浏览器访问: **http://localhost:5173**

前端会自动代理 API 请求到 http://localhost:8788

### 5. 🆕 启用实时爬虫（可选）

让应用**真实地爬取 Temu 网站**获取爆款数据！

```bash
# 1. 安装依赖
npm run api-server:install

# 2. 配置（创建 .env 文件）
VITE_USE_LIVE_SCRAPER=true
VITE_SCRAPER_API_URL=http://localhost:3001

# 3. 启动爬虫API（终端1）
npm run api-server

# 4. 启动前端（终端2）
npm run dev
```

**说明**：

- 📦 独立的 `api-server/` 包
- 🚀 可单独部署
- 📖 详见 `api-server/README.md`

## 部署到 Cloudflare Pages

### 1. 构建项目

```bash
npm run build
```

### 2. 部署

```bash
npm run deploy
```

或者使用 Wrangler CLI:

```bash
wrangler pages deploy ./dist
```

### 3. 配置环境变量

在 Cloudflare Dashboard 中设置环境变量：

1. 进入你的 Pages 项目
2. 进入 Settings > Environment variables
3. 添加 `GEMINI_API_KEY` 变量

## API 端点

### POST /api/generate

生成产品展示图。

**请求**:

- Content-Type: `multipart/form-data`
- Body:
  - `modelImage`: 模特全身照 (File)
  - `productImage`: 产品图片 (File)

**响应**:

```json
{
  "success": true,
  "images": [
    {
      "url": "...",
      "prompt": "正面穿着展示",
      "description": "AI 生成的详细描述"
    },
    ...
  ]
}
```

## 开发说明

### 本地开发流程

1. 前端修改会自动热更新
2. Functions 修改需要重启 `npm run worker:dev`
3. 使用 `/api/*` 路径访问 Cloudflare Functions

### 添加新的 UI 组件

项目使用 shadcn/ui，所有组件都已包含在 `src/components/ui/` 中。

### 自定义提示词

修改 `functions/api/generate.ts` 中的 `PROMPTS` 数组来自定义生成的产品视图。

## 注意事项

1. **API 限制**: Gemini API 有请求频率限制，请合理使用
2. **图片大小**: 建议上传的图片大小不超过 4MB
3. **图片格式**: 支持 JPG、PNG 等常见格式
4. **生成时间**: 生成 5 张图片描述大约需要 10-30 秒

## 后续优化

- [ ] 集成真实的图片生成 API (如 DALL-E、Midjourney)
- [ ] 添加图片编辑功能
- [ ] 支持批量处理
- [ ] 添加用户认证
- [ ] 保存历史记录
- [ ] 支持更多产品类型和风格

## License

MIT
