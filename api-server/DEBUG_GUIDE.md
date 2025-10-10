# 🐛 VSCode 调试指南

## 快速开始

我已经为你配置好了 VSCode 调试！现在可以轻松调试爬虫代码了。

## 📋 可用的调试配置

### 1. 🐛 Debug test:scraper

调试测试脚本（无头模式）

**使用场景**：调试爬虫逻辑，不需要看浏览器

**步骤**：

1. 在 `test-scraper.ts` 或 `scraper.ts` 中设置断点
2. 按 `F5` 或点击 `Run and Debug` 面板
3. 选择 "🐛 Debug test:scraper"
4. 代码会在断点处暂停

### 2. 🔍 Debug test:scraper (Visible Browser)

调试测试脚本（显示浏览器）

**使用场景**：需要看到浏览器实际操作

**步骤**：

1. 设置断点
2. 选择 "🔍 Debug test:scraper (Visible Browser)"
3. 浏览器会打开，你可以同时看到页面和调试变量

### 3. 🧪 Debug test:diagnose

调试诊断脚本

**使用场景**：调试诊断工具本身

### 4. 🚀 Debug API Server

调试 API 服务器

**使用场景**：调试 API 路由和请求处理

**步骤**：

1. 在 `index.ts` 或 `scraper.ts` 中设置断点
2. 选择 "🚀 Debug API Server"
3. 服务器启动后，从浏览器或 curl 发送请求
4. 断点会触发

### 5. 🔧 Debug Current TS File

调试当前打开的 TypeScript 文件

**使用场景**：快速调试单个文件

**步骤**：

1. 打开任意 `.ts` 文件
2. 设置断点
3. 选择 "🔧 Debug Current TS File"

## 🎯 使用方法

### 方法 1：使用 F5 键（推荐）

1. **打开要调试的文件**（如 `test-scraper.ts`）
2. **点击行号左侧设置断点**（会出现红点）
3. **按 `F5` 键**
4. **选择调试配置**（如 "Debug test:scraper"）
5. **等待断点触发**

### 方法 2：使用侧边栏

1. **点击侧边栏的 "Run and Debug" 图标**（或按 `Ctrl+Shift+D`）
2. **从下拉菜单选择调试配置**
3. **点击绿色播放按钮**
4. **代码会在断点处暂停**

## 🔧 调试技巧

### 设置断点

```typescript
// 在这行左侧点击，会出现红点
const products = await scraper.searchBestsellers(keyword);
```

### 条件断点

右键断点 → Edit Breakpoint → 添加条件

```typescript
// 只在特定条件下暂停
products.length === 0;
```

### 日志点（Logpoint）

右键行号 → Add Logpoint

```typescript
// 不暂停，只输出日志
Product count: {products.length}
```

### 调试面板功能

当代码暂停时：

- **Variables（变量）**：查看当前作用域的所有变量
- **Watch（监视）**：添加表达式实时监控
- **Call Stack（调用堆栈）**：查看函数调用链
- **Breakpoints（断点）**：管理所有断点

### 控制按钮

- **Continue（F5）**：继续执行到下一个断点
- **Step Over（F10）**：执行当前行，不进入函数
- **Step Into（F11）**：进入函数内部
- **Step Out（Shift+F11）**：跳出当前函数
- **Restart（Ctrl+Shift+F5）**：重启调试
- **Stop（Shift+F5）**：停止调试

## 💡 实用调试场景

### 场景 1：调试搜索功能

```typescript
// test-scraper.ts
async function main() {
  const scraper = new TemuScraper({
    headless: false, // 👈 设置断点这里
    maxProducts: 3,
    debug: true,
  });

  await scraper.init();

  // 👈 设置断点这里，查看scraper对象
  const products = await scraper.searchBestsellers("phone case");

  // 👈 设置断点这里，查看products内容
  console.log(`Found ${products.length} products`);
}
```

**Watch 表达式**：

- `products.length`
- `products[0]?.title`
- `scraper.config`

### 场景 2：调试页面加载

```typescript
// scraper.ts
async searchBestsellers(keyword: string) {
  // 👈 设置断点，检查page对象
  await page.goto(searchUrl, {
    waitUntil: "networkidle2",
    timeout: this.config.timeout,
  });

  // 👈 设置断点，查看页面内容
  const pageTitle = await page.title();

  // 👈 设置断点，检查提取的产品数据
  const products = await page.evaluate(...);
}
```

**Watch 表达式**：

- `pageTitle`
- `products.length`
- `this.config.debug`

### 场景 3：调试 API 请求拦截

```typescript
// scraper.ts
page.on("request", (request) => {
  const url = request.url();
  // 👈 条件断点: url.includes('/api/')
  if (url.includes("/api/")) {
    this.apiRequests.push({
      url,
      method: request.method(),
      // ...
    });
  }
});
```

**条件断点**：

```
url.includes('/api/') && request.method() === 'POST'
```

### 场景 4：调试 API 服务器

```typescript
// index.ts
app.post("/api/search-bestsellers", async (req, res) => {
  // 👈 设置断点，查看请求体
  const { keywords } = req.body;

  // 👈 设置断点，查看爬虫结果
  const products = await scraper.searchBestsellers(searchQuery);

  // 👈 设置断点，查看转换后的数据
  const bestsellers = products.map(...);
});
```

**Watch 表达式**：

- `req.body`
- `products.length`
- `bestsellers[0]`

## 🚨 常见问题

### 问题 1：断点不触发

**原因**：可能是 TypeScript 编译问题

**解决**：

1. 确保使用 `tsx` 运行（已在配置中）
2. 检查 `skipFiles` 配置
3. 尝试重启 VSCode

### 问题 2：浏览器窗口在调试时自动关闭

**原因**：调试结束后 Puppeteer 自动关闭

**解决**：

```typescript
// 在代码末尾添加
await this.delay(999999); // 保持浏览器打开
```

或者在调试时设置断点，不要让代码执行完

### 问题 3：无法看到变量值

**原因**：变量可能在不同作用域

**解决**：

1. 在正确的作用域设置断点
2. 使用 Watch 表达式
3. 在 Debug Console 中输入变量名查看

### 问题 4：调试太慢

**原因**：大量日志或数据

**解决**：

1. 减少 `console.log`
2. 使用条件断点
3. 使用 Logpoint 代替断点

## 🎓 进阶技巧

### 1. 调试特定搜索关键词

修改 `test-scraper.ts`：

```typescript
// 通过环境变量传递关键词
const keyword = process.env.KEYWORD || "phone case";
```

在 `launch.json` 中添加：

```json
{
  "name": "🔍 Debug Custom Keyword",
  "env": {
    "KEYWORD": "laptop"
  }
}
```

### 2. 调试时保存更多信息

在 `scraper.ts` 中添加：

```typescript
if (this.config.debug) {
  // 👈 断点这里，检查所有变量
  debugger; // 这会触发断点
}
```

### 3. 使用 Debug Console 执行代码

当暂停时，可以在 Debug Console 中：

```javascript
// 查看变量
products;

// 执行函数
await page.screenshot({ path: "debug.png" });

// 修改变量
this.config.maxProducts = 5;
```

## 📚 更多资源

- [VSCode 调试文档](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js 调试指南](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [Puppeteer 调试技巧](https://pptr.dev/guides/debugging)

## ⚡ 快捷键速查

| 功能               | Windows/Linux   | Mac            |
| ------------------ | --------------- | -------------- |
| 开始调试           | `F5`            | `F5`           |
| 继续               | `F5`            | `F5`           |
| 单步跳过           | `F10`           | `F10`          |
| 单步进入           | `F11`           | `F11`          |
| 单步跳出           | `Shift+F11`     | `Shift+F11`    |
| 重启调试           | `Ctrl+Shift+F5` | `Cmd+Shift+F5` |
| 停止调试           | `Shift+F5`      | `Shift+F5`     |
| 切换断点           | `F9`            | `F9`           |
| Run and Debug 面板 | `Ctrl+Shift+D`  | `Cmd+Shift+D`  |

## 🎉 开始调试！

1. **打开 `api-server/test-scraper.ts`**
2. **在第 15 行设置断点**（`await scraper.init()` 这行）
3. **按 F5**
4. **选择 "🔍 Debug test:scraper (Visible Browser)"**
5. **享受调试！**

祝你调试顺利！🚀
