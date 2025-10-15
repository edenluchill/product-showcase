/**
 * 🕵️ 增强型Temu爬虫 - 使用Playwright Stealth模式
 *
 * 特性：
 * - Playwright 原生反检测
 * - 真实的鼠标移动和滚动模拟
 * - Cookie会话管理
 * - 随机化人类行为
 */

import fs from "fs";
import path from "path";
import { Browser, BrowserContext, chromium, Page } from "playwright";

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
  delay: number;
  timeout: number;
  debug: boolean;
  saveScreenshots: boolean;
  useStealth: boolean;
  simulateHuman: boolean; // 模拟人类行为
  cookiePath: string; // Cookie保存路径
}

export class TemuScraperStealth {
  private browser: Browser | null = null;
  private config: ScraperConfig;
  private apiRequests: any[] = [];

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = {
      headless: false, // 建议非headless模式，更难检测
      maxProducts: 10,
      downloadImages: false,
      outputDir: "./data/bestsellers",
      delay: 2000,
      timeout: 60000,
      debug: false,
      saveScreenshots: true,
      useStealth: true,
      simulateHuman: true,
      cookiePath: "./data/cookies.json",
      ...config,
    };

    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  async init() {
    console.log("🚀 启动增强型浏览器（Stealth模式）...");

    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-site-isolation-trials",
        "--lang=en-US,en",
      ],
    });

    console.log("✅ 浏览器已启动（Playwright 原生反检测已激活）");
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("✅ 浏览器已关闭");
    }
  }

  /**
   * 创建增强的浏览器上下文
   */
  private async createStealthContext(): Promise<BrowserContext> {
    if (!this.browser) throw new Error("浏览器未初始化");

    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "America/New_York",
      hasTouch: false,
      isMobile: false,
      deviceScaleFactor: 1,
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

    return context;
  }

  /**
   * 加载保存的Cookies
   */
  private async loadCookies(context: BrowserContext): Promise<void> {
    if (fs.existsSync(this.config.cookiePath)) {
      const cookiesString = fs.readFileSync(this.config.cookiePath, "utf8");
      const cookies = JSON.parse(cookiesString);
      await context.addCookies(cookies);
      if (this.config.debug) {
        console.log(`🍪 已加载 ${cookies.length} 个Cookie`);
      }
    }
  }

  /**
   * 保存Cookies
   */
  private async saveCookies(context: BrowserContext): Promise<void> {
    const cookies = await context.cookies();
    fs.writeFileSync(this.config.cookiePath, JSON.stringify(cookies, null, 2));
    if (this.config.debug) {
      console.log(`💾 已保存 ${cookies.length} 个Cookie`);
    }
  }

  /**
   * 模拟人类鼠标移动
   */
  private async simulateMouseMovement(page: Page): Promise<void> {
    if (!this.config.simulateHuman) return;

    const viewportSize = page.viewportSize() || { width: 1920, height: 1080 };

    // 随机移动鼠标5-10次
    const movements = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < movements; i++) {
      const x = Math.floor(Math.random() * viewportSize.width);
      const y = Math.floor(Math.random() * viewportSize.height);

      // 使用缓动函数模拟真实移动
      await page.mouse.move(x, y, {
        steps: Math.floor(Math.random() * 20) + 10,
      });
      await this.randomDelay(50, 200);
    }
  }

  /**
   * 模拟人类滚动
   */
  private async simulateScrolling(page: Page): Promise<void> {
    if (!this.config.simulateHuman) return;

    const scrolls = Math.floor(Math.random() * 3) + 2; // 2-4次滚动

    for (let i = 0; i < scrolls; i++) {
      const scrollDistance = Math.floor(Math.random() * 500) + 200;
      await page.evaluate((distance) => {
        window.scrollBy({
          top: distance,
          behavior: "smooth",
        });
      }, scrollDistance);
      await this.randomDelay(500, 1500);
    }

    // 滚动回顶部
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /**
   * 随机延迟
   */
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * 检测是否出现人机验证
   */
  private async detectCaptcha(page: Page): Promise<boolean> {
    const captchaSelectors = [
      'iframe[src*="captcha"]',
      'iframe[src*="recaptcha"]',
      '[class*="captcha"]',
      '[id*="captcha"]',
      'iframe[src*="cloudflare"]',
      '[class*="challenge"]',
    ];

    for (const selector of captchaSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`⚠️ 检测到人机验证元素: ${selector}`);
        return true;
      }
    }

    // 检查页面标题
    const title = await page.title();
    if (
      title.toLowerCase().includes("captcha") ||
      title.toLowerCase().includes("challenge") ||
      title.toLowerCase().includes("verify")
    ) {
      console.log(`⚠️ 检测到验证页面标题: ${title}`);
      return true;
    }

    return false;
  }

  /**
   * 会话预热 - 像真实用户一样浏览
   */
  private async warmupSession(
    page: Page,
    context: BrowserContext
  ): Promise<void> {
    console.log("🔥 开始会话预热...");

    // 1. 访问首页
    await page.goto("https://www.temu.com", {
      waitUntil: "domcontentloaded",
      timeout: this.config.timeout,
    });

    await this.randomDelay(2000, 4000);

    // 检查是否有验证
    if (await this.detectCaptcha(page)) {
      console.log("⚠️ 首页出现人机验证！");
      if (this.config.saveScreenshots) {
        await page.screenshot({
          path: path.join(
            this.config.outputDir,
            `captcha-homepage-${Date.now()}.png`
          ),
          fullPage: true,
        });
      }
      // 给用户时间手动解决验证
      if (!this.config.headless) {
        console.log("⏳ 请手动完成验证，等待30秒...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }

    // 2. 模拟人类行为
    await this.simulateMouseMovement(page);
    await this.simulateScrolling(page);

    // 3. 随机点击一些元素（不导航）
    try {
      const clickableElements = await page.$$('a[href*="category"], button');
      if (clickableElements.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * Math.min(3, clickableElements.length)
        );
        // 只hover，不点击
        await clickableElements[randomIndex].hover();
        await this.randomDelay(500, 1000);
      }
    } catch (e) {
      // 忽略错误
    }

    // 4. 保存Cookie
    await this.saveCookies(context);

    console.log("✅ 会话预热完成");
  }

  /**
   * 搜索爆款产品
   */
  async searchBestsellers(keyword: string): Promise<TemuProduct[]> {
    if (!this.browser) throw new Error("浏览器未初始化");

    const context = await this.createStealthContext();
    const page = await context.newPage();

    try {
      // 设置超时
      page.setDefaultTimeout(this.config.timeout);
      page.setDefaultNavigationTimeout(this.config.timeout);

      // 加载保存的Cookie
      await this.loadCookies(context);

      // 如果没有Cookie，先预热会话
      if (!fs.existsSync(this.config.cookiePath)) {
        await this.warmupSession(page, context);
      }

      console.log(`🔍 搜索关键词: ${keyword}`);

      const searchUrl = `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(
        keyword
      )}`;

      await page.goto(searchUrl, {
        waitUntil: "networkidle",
        timeout: this.config.timeout,
      });

      console.log("✅ 搜索页面已加载");

      // 检查验证
      if (await this.detectCaptcha(page)) {
        console.log("⚠️ 搜索页面出现人机验证！");
        if (this.config.saveScreenshots) {
          await page.screenshot({
            path: path.join(
              this.config.outputDir,
              `captcha-search-${Date.now()}.png`
            ),
            fullPage: true,
          });
        }

        if (!this.config.headless) {
          console.log("⏳ 请手动完成验证，等待60秒...");
          await new Promise((resolve) => setTimeout(resolve, 60000));
        } else {
          throw new Error("出现人机验证，请使用非headless模式手动解决");
        }
      }

      // 模拟真实用户行为
      await this.simulateMouseMovement(page);
      await this.randomDelay(1000, 2000);

      // 滚动以加载更多产品
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await this.randomDelay(1000, 2000);

      // 保存截图
      if (this.config.saveScreenshots) {
        const screenshotPath = path.join(
          this.config.outputDir,
          `search-${keyword.replace(/\s+/g, "-")}-${Date.now()}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 截图已保存: ${screenshotPath}`);
      }

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

      // 保存Cookie
      await this.saveCookies(context);

      // 转换为完整产品数据
      const detailedProducts: TemuProduct[] = products.map((p) => ({
        ...p,
        category: keyword,
        scrapedAt: new Date().toISOString(),
      }));

      return detailedProducts;
    } finally {
      await page.close();
      await context.close();
    }
  }

  /**
   * 检测工具 - 验证反检测是否生效
   */
  async runDetectionTest(): Promise<void> {
    if (!this.browser) throw new Error("浏览器未初始化");

    const context = await this.createStealthContext();
    const page = await context.newPage();

    try {
      console.log("\n╔═══════════════════════════════════════════╗");
      console.log("║   🔍 反检测测试                           ║");
      console.log("╚═══════════════════════════════════════════╝\n");

      await page.goto("https://bot.sannysoft.com/");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const results = await page.evaluate(() => {
        return {
          webdriver: navigator.webdriver,
          // @ts-ignore
          chrome: typeof window.chrome !== "undefined",
          plugins: navigator.plugins.length,
          languages: navigator.languages,
          platform: navigator.platform,
        };
      });

      console.log("📊 检测结果:");
      console.log(`  navigator.webdriver: ${results.webdriver}`);
      console.log(`  window.chrome: ${results.chrome}`);
      console.log(`  plugins: ${results.plugins}`);
      console.log(`  languages: ${results.languages.join(", ")}`);
      console.log(`  platform: ${results.platform}`);

      if (this.config.saveScreenshots) {
        const screenshotPath = path.join(
          this.config.outputDir,
          `detection-test-${Date.now()}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`\n📸 测试截图: ${screenshotPath}`);
        console.log("👀 请查看截图中的红色标记（红色=被检测到）\n");
      }
    } finally {
      await page.close();
      await context.close();
    }
  }
}
