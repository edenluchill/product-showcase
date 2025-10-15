/**
 * 🕷️ 实时爬虫 API 服务器
 *
 * 这是一个独立的Node.js服务，提供实时Temu爆款搜索功能
 *
 * 启动方式：
 * npm start
 *
 * 端口：3001
 */

import cors from "cors";
import express from "express";
import { MOCK_BESTSELLERS } from "./mock-products.js";
import { TemuScraper } from "./scraper.js";

// 类型定义
interface Bestseller {
  id: string;
  platform: string;
  productName: string;
  price: number;
  currency: string;
  sales: number;
  rating: number;
  reviews: number;
  thumbnailUrl: string;
  imageCount: number;
  productUrl: string;
  images: Array<{
    url: string;
    index: number;
    type?: string;
  }>;
}

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 全局爬虫实例（复用浏览器）
let scraper: TemuScraper | null = null;
let scraperInitialized = false;

// 初始化爬虫
async function initScraper() {
  if (!scraper) {
    console.log("🚀 初始化爬虫...");

    // 从环境变量读取配置
    const headless = process.env.HEADLESS !== "false"; // 默认为true，设置为false可看到浏览器
    const debug = process.env.DEBUG === "true"; // 默认为false
    const maxProducts = parseInt(process.env.MAX_PRODUCTS || "10");

    console.log("⚙️ 爬虫配置:", {
      headless,
      debug,
      maxProducts,
      incognito: true,
    });

    scraper = new TemuScraper({
      headless, // 可通过 HEADLESS=false 查看浏览器运行
      maxProducts,
      downloadImages: false, // 不下载图片到本地
      delay: 1500,
      incognito: true, // 启用隐身模式
      timeout: 60000, // 60秒超时
      debug, // 可通过 DEBUG=true 启用详细日志
      saveScreenshots: true, // 保存截图用于诊断
      interceptRequests: true, // 拦截请求以分析API
    });
    await scraper.init();
    scraperInitialized = true;
    console.log("✅ 爬虫已初始化");
  }
}

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    scraperInitialized,
    timestamp: new Date().toISOString(),
  });
});

// 搜索爆款产品
app.post("/api/search-bestsellers", async (req, res) => {
  try {
    const { keywords } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        error: "请提供搜索关键词",
        message: "keywords 参数必须是非空数组",
      });
    }

    console.log(`🔍 收到搜索请求：${keywords.join(", ")}`);

    // 确保爬虫已初始化
    await initScraper();

    if (!scraper) {
      throw new Error("爬虫初始化失败");
    }

    // 将多个关键词组合成搜索词
    const searchQuery = keywords.join(" ");

    // 使用爬虫搜索
    console.log(`📡 开始爬取：${searchQuery}`);
    const products = await scraper.searchBestsellers(searchQuery);

    // 转换为应用格式
    const bestsellers: Bestseller[] = products.map((product, index) => ({
      id: `temu-${Date.now()}-${index}`,
      platform: "temu",
      productName: product.title,
      price: product.price,
      currency: "USD",
      sales: product.sales,
      rating: product.rating,
      reviews: product.reviews,
      thumbnailUrl: product.images[0] || "",
      imageCount: product.images.length,
      productUrl: product.url,
      images: product.images.map((url, imgIndex) => ({
        url,
        index: imgIndex + 1,
        type: imgIndex === 0 ? "main" : "detail",
      })),
    }));

    console.log(`✅ 找到 ${bestsellers.length} 个产品`);

    res.json({
      success: true,
      count: bestsellers.length,
      bestsellers,
      searchQuery,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ 搜索失败:", error);
    res.status(500).json({
      success: false,
      error: "搜索失败",
      message: error instanceof Error ? error.message : "未知错误",
    });
  }
});

// 搜索单个关键词（简化版 - 使用 Mock Data）
app.get("/api/search/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;
    const useMock = req.query.mock === "true"; // 支持通过 ?mock=true 启用 mock

    console.log(`🔍 收到搜索请求：${keyword}`);

    let products;

    products = MOCK_BESTSELLERS;
    // else {
    //   // 使用真实爬虫
    //   await initScraper();
    //   if (!scraper) {
    //     throw new Error("爬虫初始化失败");
    //   }
    //   console.log(`📡 开始爬取：${keyword}`);
    //   products = await scraper.searchBestsellers(keyword);
    // }

    const bestsellers: Bestseller[] = products.map((product, index) => ({
      id: `temu-${Date.now()}-${index}`,
      platform: "temu",
      productName: product.title,
      price: product.price,
      currency: product.currency || "CAD",
      sales: product.sales,
      rating: product.rating,
      reviews: product.reviews,
      thumbnailUrl: product.images[0] || "",
      imageCount: product.images.length,
      productUrl: product.url,
      images: product.images.map((url, imgIndex) => ({
        url,
        index: imgIndex + 1,
        type: imgIndex === 0 ? "main" : "detail",
      })),
    }));

    console.log(`✅ 找到 ${bestsellers.length} 个产品`);

    res.json({
      success: true,
      count: bestsellers.length,
      bestsellers,
      keyword,
      usedMock: useMock,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ 搜索失败:", error);
    res.status(500).json({
      success: false,
      error: "搜索失败",
      message: error instanceof Error ? error.message : "未知错误",
    });
  }
});

// 新增：专门的 Mock Data 端点
app.get("/api/mock-bestsellers", (req, res) => {
  try {
    const bestsellers: Bestseller[] = MOCK_BESTSELLERS.map(
      (product, index) => ({
        id: `mock-temu-${Date.now()}-${index}`,
        platform: "temu",
        productName: product.title,
        price: product.price,
        currency: product.currency || "CAD",
        sales: product.sales,
        rating: product.rating,
        reviews: product.reviews,
        thumbnailUrl: product.images[0] || "",
        imageCount: product.images.length,
        productUrl: product.url,
        images: product.images.map((url, imgIndex) => ({
          url,
          index: imgIndex + 1,
          type: imgIndex === 0 ? "main" : "detail",
        })),
      })
    );

    res.json({
      success: true,
      count: bestsellers.length,
      bestsellers,
      source: "mock",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Mock 数据获取失败:", error);
    res.status(500).json({
      success: false,
      error: "Mock 数据获取失败",
      message: error instanceof Error ? error.message : "未知错误",
    });
  }
});

// 优雅关闭
process.on("SIGINT", async () => {
  console.log("\n⏳ 正在关闭服务...");
  if (scraper) {
    await scraper.close();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏳ 正在关闭服务...");
  if (scraper) {
    await scraper.close();
  }
  process.exit(0);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🕷️  Temu 爆款爬虫 API 服务器           ║
║                                            ║
║   服务地址: http://localhost:${PORT}        ║
║   健康检查: GET  /health                   ║
║   搜索爆款: POST /api/search-bestsellers   ║
║             GET  /api/search/:keyword      ║
╚════════════════════════════════════════════╝
  `);

  console.log("⚠️  重要提示：");
  console.log("  1. 此服务仅用于开发和测试");
  console.log("  2. 请遵守Temu服务条款");
  console.log("  3. 建议使用合理的请求频率");
  console.log("  4. 生产环境建议使用缓存或定期爬取\n");

  // 启动时预初始化爬虫
  initScraper().catch(console.error);
});
