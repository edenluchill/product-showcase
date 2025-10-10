# 🧪 爬虫测试指南

## 快速开始

### 1️⃣ 安装依赖（首次使用）

```bash
cd api-server
npm install
```

### 2️⃣ 运行可视化测试

```bash
npm run test:visible
```

这会：

- 🔍 打开 Chrome 浏览器窗口
- 📊 显示详细的运行日志
- 🕶️ 使用隐身模式避免被检测
- ⚡ 快速测试（只爬取 3 个产品）

---

## 📺 你将看到什么

### 终端输出示例：

```
╔═══════════════════════════════════════════╗
║   🧪 Temu 爬虫测试                        ║
╚═══════════════════════════════════════════╝

🚀 启动浏览器...
⚙️ 配置: {
  headless: false,
  incognito: true,
  maxProducts: 3,
  timeout: 60000
}
✅ 浏览器已启动

🔍 测试关键词: phone case

🕶️ 使用隐身模式
📡 访问URL: https://www.temu.com/search_result.html?search_key=phone%20case
⏳ 正在加载页面...
✅ 页面已加载，等待内容渲染...
✅ 找到 3 个产品

📦 产品预览:
  1. iPhone 15 Pro Max Case Clear...
     价格: $2.99, 销量: 15000
  2. Samsung Galaxy S24 Ultra Case...
     价格: $3.49, 销量: 12000

📸 [1/3] 获取产品详情: iPhone 15 Pro Max Case Clear...
   ✓ 获取到 8 张图片
📸 [2/3] 获取产品详情: Samsung Galaxy S24 Ultra Case...
   ✓ 获取到 6 张图片
📸 [3/3] 获取产品详情: Shockproof Phone Case for iPhone...
   ✓ 获取到 7 张图片

🎉 成功获取 3 个产品的完整信息

╔═══════════════════════════════════════════╗
║   📊 测试结果                             ║
╚═══════════════════════════════════════════╝

✅ 成功爬取 3 个产品

1. iPhone 15 Pro Max Case Clear
   💰 价格: $2.99
   ⭐ 评分: 4.8 (1234 评论)
   📦 销量: 15000
   🖼️  图片数: 8
   🔗 链接: https://www.temu.com/...

...

🎉 测试完成！
✅ 浏览器已关闭
```

### 浏览器窗口：

你会看到一个 Chrome 窗口自动执行以下操作：

1. ✅ 打开 Temu 搜索页面
2. ✅ 加载搜索结果
3. ✅ 逐个访问产品详情页
4. ✅ 提取产品信息和图片
5. ✅ 完成后自动关闭

---

## 🎯 不同测试模式

### 模式 1：可视化 + 详细日志（推荐调试）

```bash
npm run test:visible
```

- 🔍 显示浏览器
- 📊 详细日志
- 🕶️ 隐身模式

### 模式 2：后台运行（测试稳定性）

```bash
npm run test:scraper
```

- ❌ 不显示浏览器
- ✅ 静默运行
- ⚡ 更快速度

### 模式 3：自定义测试

创建你自己的测试脚本：

```typescript
import { TemuScraper } from "./src/scraper.js";

const scraper = new TemuScraper({
  headless: false, // 是否显示浏览器
  maxProducts: 5, // 爬取数量
  incognito: true, // 隐身模式
  timeout: 60000, // 超时时间
  debug: true, // 详细日志
});

await scraper.init();
const products = await scraper.searchBestsellers("your keyword");
await scraper.close();
```

---

## 🐛 常见问题排查

### ❌ 问题 1：超时错误

**错误信息：**

```
TimeoutError: Navigation timeout of 30000 ms exceeded
```

**解决方案：**

1. ✅ 检查网络连接
2. ✅ 增加超时时间（已默认设置为 60 秒）
3. ✅ 使用可视化模式查看页面是否正常加载

### ❌ 问题 2：找不到产品

**可能原因：**

- Temu 页面结构改变
- 网络问题
- 被检测为爬虫

**解决方案：**

1. ✅ 使用可视化模式查看实际页面
2. ✅ 确认隐身模式已启用
3. ✅ 尝试不同的搜索关键词

### ❌ 问题 3：浏览器无法启动

**Windows PowerShell:**

```powershell
# 设置环境变量
$env:HEADLESS="false"
$env:DEBUG="true"

# 运行测试
cd api-server
npm run test:scraper
```

**检查 Puppeteer 安装：**

```bash
npm ls puppeteer
# 应该显示 puppeteer@21.11.0
```

---

## 📈 测试不同场景

### 场景 1：测试英文搜索

```bash
# 修改 test-scraper.ts 中的 testKeyword
const testKeyword = "phone case";
```

### 场景 2：测试中文搜索

```bash
const testKeyword = "手机壳";
```

### 场景 3：测试多关键词

```bash
const testKeyword = "womens jeans high waisted";
```

### 场景 4：压力测试

```bash
# 增加产品数量
const scraper = new TemuScraper({
  maxProducts: 20,  // 爬取更多产品
  // ...
});
```

---

## 💡 调试技巧

### 1. 查看页面 HTML

在 `scraper.ts` 中添加：

```typescript
// 在 searchBestsellers 方法中
const html = await page.content();
console.log(html);
```

### 2. 截图保存

```typescript
await page.screenshot({ path: "debug.png", fullPage: true });
```

### 3. 暂停执行

```typescript
await this.delay(10000); // 暂停10秒查看页面
```

### 4. 打印页面元素

```typescript
const elements = await page.$$eval("[data-product-id]", (els) => els.length);
console.log(`找到 ${elements} 个产品元素`);
```

---

## ⚡ 性能优化

### 减少延迟（谨慎使用）

```typescript
const scraper = new TemuScraper({
  delay: 500, // 从2000ms降到500ms
});
```

⚠️ **警告**：太快可能被检测为爬虫

### 增加并发（高级）

目前是串行爬取，可以考虑并行：

```typescript
// 并行获取多个产品详情
const detailPromises = products.map((p) => this.getProductDetails(p.url));
const details = await Promise.all(detailPromises);
```

---

## 📝 测试清单

在部署前，确保完成：

- [ ] ✅ 可视化测试通过
- [ ] ✅ 后台测试通过
- [ ] ✅ 至少测试 3 种不同关键词
- [ ] ✅ 测试网络不稳定情况
- [ ] ✅ 测试超时处理
- [ ] ✅ 确认隐身模式有效
- [ ] ✅ 检查爬取数据完整性

---

## 🚀 下一步

测试通过后：

1. **启动 API 服务器**

   ```bash
   npm start
   ```

2. **集成到前端**

   - 在主项目 `.env` 中设置 `VITE_USE_LIVE_SCRAPER=true`

3. **监控运行**
   - 观察日志
   - 处理错误
   - 调整参数

---

**祝测试顺利！🎉**
