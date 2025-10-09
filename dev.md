# 本地开发指南

## 第一次启动

1. **安装依赖**

```bash
npm install
```

2. **配置 API Key**

```bash
cp .dev.vars.example .dev.vars
```

然后编辑 `.dev.vars` 填入你的 Gemini API Key

3. **首次构建**

```bash
npm run build
```

## 日常开发

需要同时运行两个终端：

### 终端 1 - 前端开发服务器（带热更新）

```bash
npm run dev
```

这会在 http://localhost:5173 启动 Vite 开发服务器，支持热更新

### 终端 2 - Functions 服务器

```bash
npm run functions:dev
```

这会在 http://localhost:8788 启动 Cloudflare Functions

## 访问应用

打开浏览器访问: **http://localhost:5173**

前端会自动将 `/api/*` 请求代理到 Functions 服务器

## 注意事项

- 修改前端代码（`src/` 目录）会自动热更新
- 修改 Functions 代码（`functions/` 目录）后需要重启 `npm run functions:dev`
- 如果修改了前端构建配置，需要重新运行 `npm run build`

## 部署

```bash
npm run deploy
```
