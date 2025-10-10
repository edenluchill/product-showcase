import puppeteer, { Browser, Page } from "puppeteer";
import axios from "axios";
import fs from "fs";
import path from "path";

interface TemuProduct {
  id: string;
  url: string;
  title: string;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  images: string[];
  category: string;
  scrapedAt: string;
}

interface ScraperConfig {
  headless: boolean;
  maxProducts: number;
  downloadImages: boolean;
  outputDir: string;
  delay: number; // 请求间隔（毫秒）
  incognito: boolean; // 隐身模式
  timeout: number; // 页面加载超时（毫秒）
  debug: boolean; // 调试模式（显示详细日志）
  saveScreenshots: boolean; // 保存截图用于诊断
  interceptRequests: boolean; // 拦截请求以分析API
}

export class TemuScraper {
  private browser: Browser | null = null;
  private config: ScraperConfig;
  private apiRequests: any[] = []; // 记录API请求

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = {
      headless: true,
      maxProducts: 10,
      downloadImages: false,
      outputDir: "./data/bestsellers",
      delay: 2000,
      incognito: true,
      timeout: 60000, // 60秒超时
      debug: false,
      saveScreenshots: true, // 默认开启截图
      interceptRequests: true, // 默认拦截请求
      ...config,
    };

    // 确保输出目录存在
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  async init() {
    console.log("🚀 启动浏览器...");
    if (this.config.debug) {
      console.log("⚙️ 配置:", {
        headless: this.config.headless,
        incognito: this.config.incognito,
        maxProducts: this.config.maxProducts,
        timeout: this.config.timeout,
        saveScreenshots: this.config.saveScreenshots,
        interceptRequests: this.config.interceptRequests,
      });
    }

    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-web-security", // 禁用同源策略
        "--disable-features=CrossSiteDocumentBlockingIfIsolating", // 跨站文档阻止
        "--lang=en-US,en", // 设置语言
      ],
      defaultViewport: { width: 1920, height: 1080 },
    });

    console.log("✅ 浏览器已启动");
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("✅ 浏览器已关闭");
    }
  }

  /**
   * 搜索爆款产品
   */
  async searchBestsellers(keyword: string): Promise<TemuProduct[]> {
    if (!this.browser) throw new Error("浏览器未初始化");

    // 如果启用隐身模式，创建隐身上下文
    let page: Page;
    let context;
    if (this.config.incognito) {
      if (this.config.debug) console.log("🕶️ 使用隐身模式");
      context = await this.browser.createIncognitoBrowserContext();
      page = await context.newPage();
    } else {
      page = await this.browser.newPage();
    }

    try {
      // 设置超时时间
      page.setDefaultNavigationTimeout(this.config.timeout);
      page.setDefaultTimeout(this.config.timeout);

      // 设置更真实的用户代理
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
      );

      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      });

      // 拦截请求以分析API
      if (this.config.interceptRequests) {
        await page.setRequestInterception(true);
        page.on("request", (request) => {
          const url = request.url();
          // 记录API请求
          if (url.includes("/api/") || url.includes("api.temu.com")) {
            this.apiRequests.push({
              url,
              method: request.method(),
              headers: request.headers(),
              postData: request.postData(),
              timestamp: new Date().toISOString(),
            });
            if (this.config.debug) {
              console.log(`🔗 API请求: ${url}`);
            }
          }
          request.continue();
        });

        // 记录响应
        page.on("response", async (response) => {
          const url = response.url();
          if (url.includes("/api/") || url.includes("api.temu.com")) {
            try {
              const contentType = response.headers()["content-type"] || "";
              if (contentType.includes("application/json")) {
                const data = await response.json();
                if (this.config.debug) {
                  console.log(`📦 API响应: ${url}`);
                  console.log(`   状态: ${response.status()}`);
                  console.log(
                    `   数据预览: ${JSON.stringify(data).substring(0, 200)}...`
                  );
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        });
      }

      // 增强反检测
      await page.evaluateOnNewDocument(() => {
        // 移除webdriver标记
        // @ts-ignore
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });

        // 模拟真实的chrome属性
        // @ts-ignore
        window.chrome = {
          runtime: {},
          loadTimes: function () {},
          csi: function () {},
          app: {},
        };

        // 覆盖plugins
        // @ts-ignore
        Object.defineProperty(navigator, "plugins", {
          get: () => [1, 2, 3, 4, 5],
        });

        // 覆盖languages
        // @ts-ignore
        Object.defineProperty(navigator, "languages", {
          get: () => ["en-US", "en"],
        });

        // 覆盖permissions查询
        // @ts-ignore
        const originalQuery = window.navigator.permissions.query;
        // @ts-ignore
        window.navigator.permissions.query = (parameters: any) =>
          parameters.name === "notifications"
            ? Promise.resolve({ state: "denied" } as any)
            : originalQuery(parameters);

        // 添加真实的canvas指纹
        // @ts-ignore
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        // @ts-ignore
        HTMLCanvasElement.prototype.toDataURL = function (type) {
          if (type === "image/png" && this.width === 0 && this.height === 0) {
            return "data:image/png;base64,iVBORw0KGg";
          }
          return originalToDataURL.apply(this, arguments as any);
        };
      });

      console.log(`🔍 搜索关键词: ${keyword}`);

      // 访问Temu搜索页面
      const searchUrl = `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(
        keyword
      )}`;

      if (this.config.debug) console.log(`📡 访问URL: ${searchUrl}`);

      console.log("⏳ 正在加载页面...");

      // 先访问首页建立session
      await page.goto("https://www.temu.com", {
        waitUntil: "networkidle2",
        timeout: this.config.timeout,
      });
      console.log("✅ 首页已加载，等待3秒...");
      await this.delay(3000);

      // 保存首页截图
      if (this.config.saveScreenshots) {
        const screenshotPath = path.join(
          this.config.outputDir,
          `homepage-${Date.now()}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 首页截图已保存: ${screenshotPath}`);
      }

      // 然后访问搜索页面
      await page.goto(searchUrl, {
        waitUntil: "networkidle2",
        timeout: this.config.timeout,
      });

      console.log("✅ 搜索页面已加载，等待内容渲染...");

      // 等待产品列表加载
      await this.delay(5000);

      // 保存搜索页面截图用于诊断
      if (this.config.saveScreenshots) {
        const screenshotPath = path.join(
          this.config.outputDir,
          `search-${keyword.replace(/\s+/g, "-")}-${Date.now()}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 搜索页面截图已保存: ${screenshotPath}`);
      }

      // 保存页面HTML用于诊断
      if (this.config.debug) {
        const htmlPath = path.join(
          this.config.outputDir,
          `search-${keyword.replace(/\s+/g, "-")}-${Date.now()}.html`
        );
        const html = await page.content();
        fs.writeFileSync(htmlPath, html);
        console.log(`💾 页面HTML已保存: ${htmlPath}`);
      }

      // 检查页面标题和内容
      const pageTitle = await page.title();
      console.log(`📄 页面标题: ${pageTitle}`);

      // 提取产品数据
      const products = await page.evaluate((maxProducts: number) => {
        // @ts-ignore - 在浏览器上下文中运行
        const items = document.querySelectorAll("[data-product-id]");
        const results: any[] = [];

        items.forEach((item: any, index: number) => {
          if (index >= maxProducts) return;

          try {
            const productId = item.getAttribute("data-product-id") || "";
            const link = item.querySelector("a");
            const title =
              item.querySelector('[class*="title"]')?.textContent?.trim() || "";
            const priceText =
              item.querySelector('[class*="price"]')?.textContent?.trim() ||
              "0";
            const salesText =
              item.querySelector('[class*="sales"]')?.textContent?.trim() ||
              "0";
            const ratingText =
              item.querySelector('[class*="rating"]')?.textContent?.trim() ||
              "0";
            const reviewsText =
              item.querySelector('[class*="reviews"]')?.textContent?.trim() ||
              "0";

            // 提取所有图片
            const imageElements = item.querySelectorAll("img");
            const images: string[] = [];
            imageElements.forEach((img: any) => {
              const src =
                img.getAttribute("src") || img.getAttribute("data-src");
              if (src && src.startsWith("http")) {
                images.push(src);
              }
            });

            results.push({
              id: productId,
              url: link ? link.href : "",
              title,
              price: parseFloat(priceText.replace(/[^0-9.]/g, "")),
              sales: parseInt(salesText.replace(/[^0-9]/g, "")) || 0,
              rating: parseFloat(ratingText.replace(/[^0-9.]/g, "")) || 0,
              reviews: parseInt(reviewsText.replace(/[^0-9]/g, "")) || 0,
              images,
            });
          } catch (error) {
            console.error("解析产品数据失败:", error);
          }
        });

        return results;
      }, this.config.maxProducts);

      console.log(`✅ 找到 ${products.length} 个产品`);

      if (this.config.debug) {
        console.log("📦 产品预览:");
        products.slice(0, 3).forEach((p: any, i: number) => {
          console.log(
            `  ${i + 1}. ${p.title?.substring(0, 40) || "无标题"}...`
          );
          console.log(`     价格: $${p.price || 0}, 销量: ${p.sales || 0}`);
        });
      }

      // 对每个产品获取详细信息
      const detailedProducts: TemuProduct[] = [];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product.url) continue;

        try {
          console.log(
            `📸 [${i + 1}/${
              products.length
            }] 获取产品详情: ${product.title.substring(0, 50)}...`
          );
          const details = await this.getProductDetails(product.url);

          detailedProducts.push({
            ...product,
            ...details,
            category: keyword,
            scrapedAt: new Date().toISOString(),
          });

          if (this.config.debug) {
            console.log(`   ✓ 获取到 ${details.images?.length || 0} 张图片`);
          }

          await this.delay(this.config.delay);
        } catch (error) {
          console.error(`❌ 获取产品详情失败: ${product.title}`, error);
        }
      }

      console.log(`🎉 成功获取 ${detailedProducts.length} 个产品的完整信息`);

      // 如果启用了调试，保存API请求记录
      if (this.config.debug && this.apiRequests.length > 0) {
        const apiLogPath = path.join(
          this.config.outputDir,
          `api-requests-${Date.now()}.json`
        );
        fs.writeFileSync(apiLogPath, JSON.stringify(this.apiRequests, null, 2));
        console.log(`📋 API请求记录已保存: ${apiLogPath}`);
        console.log(`   共记录 ${this.apiRequests.length} 个API请求`);
        this.apiRequests = []; // 清空记录
      }

      return detailedProducts;
    } finally {
      await page.close();
      if (context) {
        await context.close();
      }
    }
  }

  /**
   * 获取产品详细信息（包括所有图片）
   */
  private async getProductDetails(
    productUrl: string
  ): Promise<Partial<TemuProduct>> {
    if (!this.browser) throw new Error("浏览器未初始化");

    const page = await this.browser.newPage();

    try {
      page.setDefaultNavigationTimeout(this.config.timeout);
      page.setDefaultTimeout(this.config.timeout);

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      await page.goto(productUrl, {
        waitUntil: "domcontentloaded",
        timeout: this.config.timeout,
      });
      await this.delay(3000);

      // 提取所有产品图片
      const images = await page.evaluate(() => {
        const imageUrls: string[] = [];

        // @ts-ignore - 在浏览器上下文中运行
        // 查找主图区域
        const mainImages = document.querySelectorAll(
          '[class*="gallery"] img, [class*="image-list"] img, [class*="product-image"] img'
        );
        mainImages.forEach((img: any) => {
          const src = img.getAttribute("src") || img.getAttribute("data-src");
          if (src && src.startsWith("http")) {
            // 获取高清版本（去掉尺寸限制）
            const highResSrc = src.replace(/_\d+x\d+\./, "_2000x2000.");
            imageUrls.push(highResSrc);
          }
        });

        // @ts-ignore - 在浏览器上下文中运行
        // 查找缩略图
        const thumbnails = document.querySelectorAll(
          '[class*="thumbnail"] img'
        );
        thumbnails.forEach((img: any) => {
          const src = img.getAttribute("src") || img.getAttribute("data-src");
          if (src && src.startsWith("http")) {
            const highResSrc = src.replace(/_\d+x\d+\./, "_2000x2000.");
            if (!imageUrls.includes(highResSrc)) {
              imageUrls.push(highResSrc);
            }
          }
        });

        return imageUrls;
      });

      return { images };
    } finally {
      await page.close();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
