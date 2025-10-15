import fs from "fs";
import path from "path";
import { Browser, BrowserContext, chromium } from "playwright";

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

    this.browser = await chromium.launch({
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

    // 创建浏览器上下文（如果启用隐身模式）
    let context: BrowserContext;
    if (this.config.incognito) {
      if (this.config.debug) console.log("🕶️ 使用隐身模式");
      context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        locale: "en-US",
        timezoneId: "America/New_York",
        extraHTTPHeaders: {
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
        },
      });
    } else {
      context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        locale: "en-US",
      });
    }

    const page = await context.newPage();

    try {
      // 设置超时时间
      page.setDefaultTimeout(this.config.timeout);
      page.setDefaultNavigationTimeout(this.config.timeout);

      // 拦截请求以分析API
      if (this.config.interceptRequests) {
        await page.route("**/*", (route: any) => {
          const request = route.request();
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

          // 继续请求
          route.continue();
        });

        // 记录响应
        page.on("response", async (response: any) => {
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

      // 增强反检测 - 使用 addInitScript
      await page.addInitScript(() => {
        // 移除webdriver标记
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
        Object.defineProperty(navigator, "plugins", {
          get: () => [1, 2, 3, 4, 5],
        });

        // 覆盖languages
        Object.defineProperty(navigator, "languages", {
          get: () => ["en-US", "en"],
        });

        // 覆盖permissions查询
        const originalQuery = window.navigator.permissions.query;
        // @ts-ignore
        window.navigator.permissions.query = (parameters: any) =>
          parameters.name === "notifications"
            ? Promise.resolve({ state: "denied" } as any)
            : originalQuery(parameters);

        // 添加真实的canvas指纹
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
      console.log("⏳ 正在加载页面...");

      // 先访问首页建立session
      await page.goto("https://www.temu.com", {
        waitUntil: "domcontentloaded",
        timeout: this.config.timeout,
      });
      console.log("✅ 首页已加载，等待建立会话...");
      await this.delay(2000 + Math.random() * 1000); // 2-3秒随机延迟

      // 保存首页截图
      if (this.config.saveScreenshots) {
        const screenshotPath = path.join(
          this.config.outputDir,
          `homepage-${Date.now()}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 首页截图已保存: ${screenshotPath}`);
      }

      // 🎭 模拟人类行为：随机滚动页面
      console.log("🖱️ 模拟浏览页面...");
      await this.humanScroll(page);
      await this.delay(500 + Math.random() * 500);

      // 🎭 模拟人类行为：寻找并点击搜索框
      console.log("🔍 寻找搜索框...");

      // 使用多个选择器策略，按优先级尝试
      let searchInput = null;
      let searchInputExists = false;

      // 策略1: 使用 ID #searchInput (最可靠，基于实际HTML结构)
      searchInput = page.locator("#searchInput");
      searchInputExists = (await searchInput.count()) > 0;
      if (this.config.debug)
        console.log(`   尝试 #searchInput: ${searchInputExists ? "✅" : "❌"}`);

      if (!searchInputExists) {
        // 策略2: 使用 role="searchbox"
        console.log("⚠️ 尝试使用 role 选择器...");
        searchInput = page.locator('input[role="searchbox"]');
        searchInputExists = (await searchInput.count()) > 0;
        if (this.config.debug)
          console.log(
            `   尝试 role="searchbox": ${searchInputExists ? "✅" : "❌"}`
          );
      }

      if (!searchInputExists) {
        // 策略3: 使用 searchBar 容器内的 input
        console.log("⚠️ 尝试使用 searchBar 容器...");
        searchInput = page.locator("#searchBar input").first();
        searchInputExists = (await searchInput.count()) > 0;
        if (this.config.debug)
          console.log(
            `   尝试 #searchBar input: ${searchInputExists ? "✅" : "❌"}`
          );
      }

      if (!searchInputExists) {
        // 策略4: 通用选择器
        console.log("⚠️ 尝试通用选择器...");
        searchInput = page
          .locator('input[type="search"], input[placeholder*="Search"]')
          .first();
        searchInputExists = (await searchInput.count()) > 0;
        if (this.config.debug)
          console.log(`   尝试通用选择器: ${searchInputExists ? "✅" : "❌"}`);
      }

      if (searchInputExists) {
        console.log("✅ 搜索框定位成功！");
      }

      // 获取搜索框的位置
      const searchBox = searchInputExists
        ? await searchInput.boundingBox()
        : null;
      if (searchBox) {
        // 🖱️ 模拟人类鼠标移动：使用随机贝塞尔曲线路径
        console.log("🖱️ 移动鼠标到搜索框...");
        await this.humanMouseMove(
          page,
          searchBox.x + searchBox.width / 2,
          searchBox.y + searchBox.height / 2
        );
        await this.delay(200 + Math.random() * 300);

        // 点击搜索框
        console.log("👆 点击搜索框...");
        await searchInput.click();
        await this.delay(300 + Math.random() * 200);

        // 🖱️ 模拟人类输入：逐字输入带随机延迟
        console.log(`⌨️ 输入搜索关键词: ${keyword}`);
        await this.humanType(page, searchInput, keyword);
        await this.delay(500 + Math.random() * 500);

        // 🎲 随机选择：按Enter键 或 点击搜索按钮 (50/50)
        const useEnterKey = Math.random() > 0.5;

        if (useEnterKey) {
          // 按Enter键
          console.log("🔍 按 Enter 键搜索...");
          await page.keyboard.press("Enter");
        } else {
          // 点击搜索按钮（更模拟真人）
          console.log("🔍 点击搜索按钮...");
          const searchButton = page
            .locator('[aria-label="Submit search"]')
            .first();
          const buttonExists = (await searchButton.count()) > 0;

          if (buttonExists) {
            const buttonBox = await searchButton.boundingBox();
            if (buttonBox) {
              // 鼠标移动到搜索按钮
              await this.humanMouseMove(
                page,
                buttonBox.x + buttonBox.width / 2,
                buttonBox.y + buttonBox.height / 2
              );
              await this.delay(100 + Math.random() * 200);
              await searchButton.click();
              if (this.config.debug) console.log("   ✅ 搜索按钮已点击");
            } else {
              // 回退到按Enter
              console.log("   ⚠️ 无法定位按钮，使用 Enter 键");
              await page.keyboard.press("Enter");
            }
          } else {
            // 回退到按Enter
            console.log("   ⚠️ 未找到搜索按钮，使用 Enter 键");
            await page.keyboard.press("Enter");
          }
        }

        // 等待搜索结果加载
        console.log("⏳ 等待搜索结果...");
        await page.waitForLoadState("domcontentloaded");
        await this.delay(3000 + Math.random() * 2000); // 3-5秒随机延迟

        console.log("✅ 搜索页面已加载，等待内容渲染...");

        // 再次模拟浏览行为
        await this.humanScroll(page);
        await this.delay(2000 + Math.random() * 1000);
      }

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
          const details = await this.getProductDetails(product.url, context);

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
      await context.close();
    }
  }

  /**
   * 获取产品详细信息（包括所有图片）
   */
  private async getProductDetails(
    productUrl: string,
    context: BrowserContext
  ): Promise<Partial<TemuProduct>> {
    const page = await context.newPage();

    try {
      page.setDefaultTimeout(this.config.timeout);
      page.setDefaultNavigationTimeout(this.config.timeout);

      await page.goto(productUrl, {
        waitUntil: "domcontentloaded",
        timeout: this.config.timeout,
      });
      await this.delay(3000);

      // 提取所有产品图片
      const images = await page.evaluate(() => {
        const imageUrls: string[] = [];

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

  /**
   * 🖱️ 模拟人类鼠标移动（使用贝塞尔曲线生成自然路径）
   */
  private async humanMouseMove(page: any, targetX: number, targetY: number) {
    const current = await page.evaluate(() => {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    });

    // 生成贝塞尔曲线路径点
    const steps = 20 + Math.floor(Math.random() * 10); // 20-30步
    const points = this.generateBezierPath(
      current.x,
      current.y,
      targetX,
      targetY,
      steps
    );

    // 沿路径移动鼠标
    for (const point of points) {
      await page.mouse.move(point.x, point.y);
      await this.delay(10 + Math.random() * 20); // 10-30ms每步
    }
  }

  /**
   * 生成贝塞尔曲线路径（三次贝塞尔曲线）
   */
  private generateBezierPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    steps: number
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    // 生成两个控制点，让路径更自然
    const cp1x = startX + (endX - startX) * (0.25 + Math.random() * 0.25);
    const cp1y = startY + (endY - startY) * (Math.random() * 0.5);
    const cp2x = startX + (endX - startX) * (0.5 + Math.random() * 0.25);
    const cp2y = startY + (endY - startY) * (0.5 + Math.random() * 0.5);

    // 沿贝塞尔曲线生成点
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;

      const x =
        startX * mt3 + cp1x * 3 * mt2 * t + cp2x * 3 * mt * t2 + endX * t3;
      const y =
        startY * mt3 + cp1y * 3 * mt2 * t + cp2y * 3 * mt * t2 + endY * t3;

      points.push({ x: Math.round(x), y: Math.round(y) });
    }

    return points;
  }

  /**
   * ⌨️ 模拟人类打字（逐字输入，随机延迟）
   */
  private async humanType(page: any, locator: any, text: string) {
    for (const char of text) {
      await locator.pressSequentially(char, {
        delay: 100 + Math.random() * 150, // 100-250ms每个字符
      });

      // 偶尔停顿一下（模拟思考）
      if (Math.random() < 0.1) {
        await this.delay(300 + Math.random() * 500);
      }
    }
  }

  /**
   * 📜 模拟人类滚动页面
   */
  private async humanScroll(page: any) {
    const scrollDistance = 200 + Math.random() * 300; // 200-500px
    const scrollSteps = 5 + Math.floor(Math.random() * 5); // 5-10步
    const stepDistance = scrollDistance / scrollSteps;

    for (let i = 0; i < scrollSteps; i++) {
      await page.mouse.wheel(0, stepDistance);
      await this.delay(50 + Math.random() * 100); // 50-150ms每步
    }

    // 偶尔向上滚动一点（模拟真实浏览）
    if (Math.random() < 0.3) {
      await this.delay(500 + Math.random() * 500);
      await page.mouse.wheel(0, -(scrollDistance * 0.3));
      await this.delay(300 + Math.random() * 300);
    }
  }
}
