# 🚀 爬虫快速开始

## 📦 安装依赖

```bash
npm install
```

这会安装：

- `puppeteer` - 浏览器自动化
- `axios` - HTTP 请求
- `tsx` - TypeScript 执行器

---

## 🎯 快速使用

### 1. 测试爬虫（推荐先运行）

```bash
npm run scrape:test
```

这会：

- 爬取少量产品（5 个）
- 显示浏览器窗口（方便调试）
- 保存数据到 `data/bestsellers/`

### 2. 生产环境爬取

```bash
npm run scrape
```

这会：

- 爬取更多产品
- 无头模式运行
- 下载所有图片

### 3. 转换数据格式

```bash
npm run convert-data
```

这会：

- 读取爬取的数据
- 转换为应用格式
- 生成 `src/lib/bestsellers-generated.ts`

---

## 📁 输出文件

### 爬取的数据

```
data/bestsellers/
├── womens-jeans.json          # 产品元数据
├── mens-t-shirt.json
└── images/
    ├── temu-product-12345/
    │   ├── image_1.jpg        # 第1张图
    │   ├── image_2.jpg        # 第2张图
    │   └── image_20.jpg       # 第20张图
    └── temu-product-67890/
        └── ...
```

### 转换后的代码

```typescript
// src/lib/bestsellers-generated.ts

export const SCRAPED_BESTSELLERS: Record<string, Bestseller[]> = {
  "womens-jeans": [
    {
      id: "temu-womens-jeans-1",
      platform: "temu",
      productName: "Women's 2025 Loose Wide Leg Jeans",
      sales: 77000,
      rating: 4.7,
      reviews: 12543,
      thumbnailUrl: "https://...",
      imageCount: 20,
      productUrl: "https://...",
      images: [
        { url: "https://...", index: 1, type: "main" },
        { url: "https://...", index: 2, type: "detail" },
        // ... 20张
      ],
    },
  ],
};
```

---

## 🎨 使用爬取的数据

### 方案 1：直接使用生成的文件

```typescript
// src/lib/bestsellers.ts
import { SCRAPED_BESTSELLERS } from "./bestsellers-generated";

export const BESTSELLERS_DATABASE = SCRAPED_BESTSELLERS;
```

### 方案 2：合并人工和爬虫数据

```typescript
// src/lib/bestsellers.ts
import { SCRAPED_BESTSELLERS } from "./bestsellers-generated";

// 人工精选的模板
const MANUAL_TEMPLATES = {
  "high-quality-jeans": [
    {
      id: "manual-001",
      platform: "amazon",
      // ... 人工添加的高质量模板
    },
  ],
};

// 合并
export const BESTSELLERS_DATABASE = {
  ...SCRAPED_BESTSELLERS,
  ...MANUAL_TEMPLATES,
};
```

---

## ⚙️ 配置爬虫

编辑 `scripts/scraper/temu-scraper.ts`：

```typescript
const scraper = new TemuScraper({
  headless: true, // false = 显示浏览器
  maxProducts: 10, // 每个类别爬取多少个
  downloadImages: true, // 是否下载图片
  delay: 2000, // 请求间隔（毫秒）
});
```

### 修改爬取的类别

```typescript
const categories = [
  "womens jeans", // 女士牛仔裤
  "mens t-shirt", // 男士T恤
  "womens dress", // 女士连衣裙
  "sneakers", // 运动鞋
  "handbag", // 手提包
  // 添加更多...
];
```

---

## 🛡️ 避免被封的技巧

### 1. 降低频率

```typescript
delay: 5000; // 增加到5秒
```

### 2. 减少数量

```typescript
maxProducts: 3; // 每个类别只爬3个
```

### 3. 分批运行

```bash
# 今天爬一部分
npm run scrape -- --categories "womens jeans,mens t-shirt"

# 明天爬另一部分
npm run scrape -- --categories "womens dress,sneakers"
```

### 4. 使用代理（高级）

```typescript
const browser = await puppeteer.launch({
  args: ["--proxy-server=your-proxy-here"],
});
```

---

## 🔄 定期更新流程

### 每周更新（推荐）

```bash
# 1. 爬取最新数据
npm run scrape

# 2. 转换格式
npm run convert-data

# 3. 测试应用
npm run dev

# 4. 提交代码
git add .
git commit -m "chore: update bestsellers data"
git push
```

### 自动化（可选）

创建 GitHub Action，每周自动运行：

```yaml
# .github/workflows/update-bestsellers.yml
name: Update Bestsellers

on:
  schedule:
    - cron: "0 3 * * 1" # 每周一凌晨3点

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run scrape
      - run: npm run convert-data
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: update bestsellers"
```

---

## 🐛 常见问题

### Q: 爬虫运行失败？

**A:** 检查：

1. 网络连接是否正常
2. Temu 网站是否可访问
3. 是否被反爬虫拦截（降低频率）

```bash
# 显示浏览器，看看发生了什么
npm run scrape:test
```

### Q: 没有下载图片？

**A:** 设置 `downloadImages: true`：

```typescript
const scraper = new TemuScraper({
  downloadImages: true,
});
```

### Q: 图片 URL 失效？

**A:** 图片 URL 可能有时效性，建议：

1. 下载图片到本地
2. 上传到自己的 CDN
3. 定期更新

### Q: 数据格式不对？

**A:** 网站结构可能变了，需要：

1. 打开浏览器调试
2. 检查新的 HTML 结构
3. 更新选择器

---

## 📊 数据质量检查

运行后检查：

### 1. 数据完整性

```bash
# 查看爬取的产品数量
cat data/bestsellers/*.json | jq 'length'

# 查看图片数量
find data/bestsellers/images -name "*.jpg" | wc -l
```

### 2. 销量排序

```bash
# 检查是否按销量排序
cat data/bestsellers/womens-jeans.json | jq '.[].sales'
```

### 3. 图片可访问性

```bash
# 随机检查几个图片URL
cat data/bestsellers/womens-jeans.json | jq '.[0].images[0]'
```

---

## 🎯 下一步

1. ✅ **运行测试爬虫**

   ```bash
   npm run scrape:test
   ```

2. ✅ **检查数据**

   ```bash
   ls -lh data/bestsellers/
   ```

3. ✅ **转换数据**

   ```bash
   npm run convert-data
   ```

4. ✅ **集成到应用**

   ```bash
   # 在 src/lib/bestsellers.ts 中使用
   ```

5. ✅ **测试完整流程**
   ```bash
   npm run dev
   ```

---

## 📞 需要帮助？

查看详细文档：

- `scripts/scraper/README.md` - 爬虫详细说明
- `BESTSELLER_REPLICATION_SYSTEM.md` - 系统架构设计

---

**Happy Scraping! 🕷️**

记住：

- 从小规模开始测试
- 遵守法律和道德规范
- 定期更新维护
- 最终目标是迁移到 API 或人工管理
