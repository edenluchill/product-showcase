# 🕷️ 爆款产品爬虫系统

## ⚠️ 重要声明

**法律和道德考量：**

1. 此爬虫**仅用于学习和研究目的**
2. 商业使用前请咨询法律顾问
3. 请遵守目标网站的 robots.txt 和服务条款
4. 建议使用合理的请求频率（2-5 秒间隔）
5. 不要对服务器造成过大压力
6. 考虑使用官方 API（如果可用）

**建议策略：**

- 初期：使用爬虫快速验证产品
- 中期：转向半自动（人工精选 + 爬虫辅助）
- 长期：使用官方 API 或完全人工管理

---

## 📦 安装依赖

```bash
npm install puppeteer axios
npm install -D @types/puppeteer
```

---

## 🚀 快速开始

### 1. 爬取 Temu 爆款

```typescript
import { TemuScraper } from "./scraper/temu-scraper";

const scraper = new TemuScraper({
  headless: true, // 无头模式
  maxProducts: 10, // 最多爬取10个产品
  downloadImages: true, // 下载图片
  delay: 2000, // 2秒延迟
});

await scraper.init();

// 搜索牛仔裤爆款
const products = await scraper.searchBestsellers("womens jeans");

// 保存数据
await scraper.saveProducts(products, "womens-jeans");

await scraper.close();
```

### 2. 运行脚本

```bash
# 编译TypeScript
npx tsc scripts/scraper/temu-scraper.ts

# 运行
node scripts/scraper/temu-scraper.js
```

或使用 ts-node：

```bash
npx ts-node scripts/scraper/temu-scraper.ts
```

---

## 📊 数据格式

爬取的数据会保存为 JSON 格式：

```json
{
  "id": "temu-product-12345",
  "url": "https://www.temu.com/...",
  "title": "Women's 2025 Loose Wide Leg Jeans",
  "price": 30.58,
  "sales": 77000,
  "rating": 4.7,
  "reviews": 12543,
  "images": [
    "https://img.temu.com/image1.jpg",
    "https://img.temu.com/image2.jpg",
    "..."
  ],
  "category": "womens jeans",
  "scrapedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## 🗂️ 文件结构

```
data/
└── bestsellers/
    ├── womens-jeans.json          # 产品数据
    ├── mens-t-shirt.json
    └── images/
        ├── temu-product-12345/
        │   ├── image_1.jpg        # 原始爆款图片
        │   ├── image_2.jpg
        │   └── ...
        └── temu-product-67890/
            └── ...
```

---

## 🔧 配置选项

```typescript
interface ScraperConfig {
  headless: boolean; // 是否无头模式（true=不显示浏览器）
  maxProducts: number; // 最多爬取多少个产品
  downloadImages: boolean; // 是否下载图片
  outputDir: string; // 输出目录
  delay: number; // 请求间隔（毫秒）
}
```

---

## 📝 使用流程

### Step 1: 确定要爬取的类别

```typescript
const categories = [
  "womens jeans",
  "mens t-shirt",
  "womens dress",
  "sneakers",
  "handbag",
  "jewelry",
];
```

### Step 2: 运行爬虫

```bash
npx ts-node scripts/scraper/temu-scraper.ts
```

### Step 3: 检查数据

爬取完成后，检查 `data/bestsellers/` 目录：

- JSON 文件包含产品元数据
- `images/` 文件夹包含下载的图片

### Step 4: 转换为应用数据格式

```typescript
import { convertToAppFormat } from "./scripts/convert-data";

// 读取爬取的数据
const rawData = require("./data/bestsellers/womens-jeans.json");

// 转换为应用格式
const appData = convertToAppFormat(rawData);

// 保存到 src/lib/bestsellers.ts
```

---

## 🛡️ 反爬虫对策

### 常见问题和解决方案

#### 1. 被检测为机器人

**解决方案：**

```typescript
// 设置真实的User-Agent
await page.setUserAgent(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
);

// 随机延迟
const randomDelay = 2000 + Math.random() * 3000;
await delay(randomDelay);
```

#### 2. IP 被封

**解决方案：**

- 使用代理服务
- 降低请求频率
- 分批次爬取（每天爬一部分）

```typescript
const scraper = new TemuScraper({
  delay: 5000, // 增加到5秒
  maxProducts: 5, // 减少数量
});
```

#### 3. 页面结构变化

**解决方案：**

- 定期检查和更新选择器
- 使用更通用的选择器
- 添加错误处理和日志

---

## 🔄 数据转换

创建一个脚本将爬取的数据转换为应用格式：

```typescript
// scripts/convert-scraped-data.ts

import * as fs from "fs/promises";
import * as path from "path";

interface ScrapedProduct {
  id: string;
  title: string;
  sales: number;
  rating: number;
  reviews: number;
  images: string[];
  // ...
}

interface AppBestseller {
  id: string;
  platform: string;
  productName: string;
  sales: number;
  rating: number;
  reviews: number;
  imageCount: number;
  productUrl: string;
  images: Array<{
    url: string;
    index: number;
    type?: string;
  }>;
}

async function convertScrapedData() {
  const inputDir = "./data/bestsellers";
  const outputFile = "./src/lib/bestsellers-generated.ts";

  // 读取所有JSON文件
  const files = await fs.readdir(inputDir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const allBestsellers: Record<string, AppBestseller[]> = {};

  for (const file of jsonFiles) {
    const category = file.replace(".json", "");
    const content = await fs.readFile(path.join(inputDir, file), "utf-8");
    const products: ScrapedProduct[] = JSON.parse(content);

    allBestsellers[category] = products.map((p, index) => ({
      id: `temu-${category}-${index + 1}`,
      platform: "temu",
      productName: p.title,
      sales: p.sales,
      rating: p.rating,
      reviews: p.reviews,
      imageCount: p.images.length,
      productUrl: `https://temu.com/product/${p.id}`,
      images: p.images.map((url, i) => ({
        url,
        index: i + 1,
        type: i === 0 ? "main" : "detail",
      })),
    }));
  }

  // 生成TypeScript文件
  const tsContent = `// 🤖 此文件由爬虫自动生成
// 生成时间: ${new Date().toISOString()}

export const BESTSELLERS_DATABASE = ${JSON.stringify(allBestsellers, null, 2)};
`;

  await fs.writeFile(outputFile, tsContent, "utf-8");
  console.log(`✅ 已生成: ${outputFile}`);
}

convertScrapedData();
```

---

## 📅 定期更新策略

### 方案 1: 手动更新

```bash
# 每周运行一次
npm run scrape
```

### 方案 2: 定时任务（cron）

```bash
# 每天凌晨3点运行
0 3 * * * cd /path/to/project && npm run scrape
```

### 方案 3: CI/CD 自动化

```yaml
# .github/workflows/scrape-bestsellers.yml
name: Update Bestsellers

on:
  schedule:
    - cron: "0 3 * * 1" # 每周一凌晨3点

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run scrape
      - run: npm run convert-data
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: update bestsellers data"
```

---

## 🚨 注意事项

### 1. 遵守法律

- ✅ 用于学习和研究
- ✅ 公开可访问的数据
- ⚠️ 商业使用需谨慎
- ❌ 不要爬取用户隐私数据

### 2. 技术限制

- 网站结构可能随时变化
- 需要定期维护选择器
- 大规模爬取可能被封 IP

### 3. 性能优化

- 使用并发控制（p-limit）
- 实现断点续爬
- 缓存已爬取的数据

---

## 🔄 从爬虫迁移到 API/人工

当产品稳定后，建议迁移到更可靠的方案：

### 迁移路径

```
Phase 1: 爬虫（当前）
  ↓
Phase 2: 爬虫 + 人工审核
  - 爬虫自动获取候选产品
  - 运营团队人工筛选和确认
  ↓
Phase 3: 人工管理 + 偶尔爬虫
  - 主要由运营团队添加
  - 爬虫只用于发现新趋势
  ↓
Phase 4: 完全人工/API
  - 使用官方API
  - 或完全人工精选
```

---

## 📞 常见问题

### Q: 爬虫合法吗？

A: 取决于用途和方式。学习研究通常可以，商业用途需谨慎。

### Q: 会被封 IP 吗？

A: 可能。建议：

- 降低频率（3-5 秒间隔）
- 使用代理
- 分批次爬取

### Q: 数据会过期吗？

A: 会。建议每周更新一次。

### Q: 能爬 Amazon 吗？

A: 技术上可以，但 Amazon 有更严格的反爬虫机制。建议使用 Amazon Product Advertising API。

---

## 🎯 下一步

1. **测试爬虫**

   ```bash
   npm run scrape:test
   ```

2. **爬取真实数据**

   ```bash
   npm run scrape:prod
   ```

3. **转换数据格式**

   ```bash
   npm run convert-data
   ```

4. **集成到应用**

   - 更新 `src/lib/bestsellers.ts`
   - 测试应用功能

5. **监控和维护**
   - 定期检查数据质量
   - 更新失效的选择器
   - 记录问题和解决方案

---

**记住：爬虫只是起步工具，最终目标是建立合规、可持续的数据获取方案！** 🚀
